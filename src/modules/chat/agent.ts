import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph, Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import z from "zod";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as { status: unknown }).status;
      if (status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.error(`Rate limit hit, Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function callAgent(query: string, thread_id: string) {
  try {
    const client = new MongoClient(process.env.DATABASE_URI!);
    await client.connect();
    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({ reducer: (x, y) => x.concat(y) }),
    });

    const dbName = "ecommerce";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const toolSchema = z.object({
      query: z.string().describe("The search query"),
      n: z
        .number()
        .optional()
        .default(15)
        .describe("Number of results to return"),
    });

    type ToolInput = z.infer<typeof toolSchema>;

    const itemLookupTool = tool(
      async (arg) => {
        const { query, n = 15 } = arg as ToolInput;
        try {
          const totalDocs = await collection.countDocuments();

          if (totalDocs === 0) {
            return JSON.stringify({
              error: "No products found",
              message: "The database appears to be empty",
              count: 0,
            });
          }

          const dbConfig = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            collection: collection as any,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          };
          const vectorStore = new MongoDBAtlasVectorSearch(
            new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GOOGLE_API_KEY,
              model: "text-embedding-004",
            }),
            dbConfig
          );
          const result = await vectorStore.similaritySearchWithScore(query, n);
          if (result.length === 0) {
            const textResults = await collection
              .find({
                $or: [
                  { item_name: { $regex: query, $options: "i" } },
                  { item_description: { $regex: query, $options: "i" } },
                  { categories: { $regex: query, $options: "i" } },
                  { embedding_text: { $regex: query, $options: "i" } },
                ],
              })
              .limit(n)
              .toArray();

            return JSON.stringify({
              results: textResults,
              searchType: "text",
              query: query,
              count: textResults.length,
            });
          }
          return JSON.stringify({
            results: result,
            searchType: "vector",
            query: query,
            count: result.length,
          });
        } catch (error) {
          console.error(error);
          return JSON.stringify({
            error: "Failed to search products",
            details: (error as { message: unknown }).message,
            query: query,
          });
        }
      },
      {
        name: "item_lookup",
        description: "Gathers product details from the ecommerce database",
        schema: toolSchema,
      }
    );
    const tools = [itemLookupTool];
    const toolNode = new ToolNode<typeof GraphState.State>(tools);
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY!,
    }).bindTools(tools);

    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;
      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      return "__end__";
    }

    async function callModel(state: typeof GraphState.State) {
      return retryWithBackoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system", // System message defines the AI's role and behavior
            `You are a helpful Chatbot Agent for a multitenant e-commerce marketplace. You have access to a vast inventory spanning multiple independent vendors.
      
            IMPORTANT: You have access to an item_lookup tool that searches the entire marketplace inventory. ALWAYS use this tool when customers ask about products, even if the tool returns errors or empty results.

            When using the item_lookup tool:
                - If it returns results, provide helpful details about the products
                - If it returns an error or no results, acknowledge this and offer to help in other ways
                - If the database appears to be empty, let the customer know that inventory might be being updated

            Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"), // Placeholder for conversation history
        ]);
        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        });
        const result = await model.invoke(formattedPrompt);
        return { messages: [result] };
      });
    }

    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    const checkpointer = new MongoDBSaver({ client, dbName });
    const app = workflow.compile({ checkpointer });
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      {
        recursionLimit: 15,
        configurable: { thread_id: thread_id },
      }
    );

    const response =
      finalState.messages[finalState.messages.length - 1]?.content;

    return response;
  } catch (error) {
    console.error("Error in callAgent", error);
    const status = (error as { status: unknown }).status;
    if (status === 429) {
      throw new Error(
        "Service temporarily unavailable due to rate limits. Please try again in a minute."
      );
    } else if (status === 401) {
      throw new Error(
        "Authentication failed. Please check your API configuration."
      );
    } else {
      throw new Error(`Agent FAILED`);
    }
  }
}
