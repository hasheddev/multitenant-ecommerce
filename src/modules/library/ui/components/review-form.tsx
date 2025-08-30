import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTRPC } from "@/trpc/client";
import { ReviewsGetOneOutput } from "@/modules/reviews/types";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { StarPicker } from "@/components/star-picker";

interface Props {
  productId: string;
  initialData?: ReviewsGetOneOutput;
}

const formSchema = z.object({
  rating: z.number().min(1, { message: "Rating is requred" }).max(5),
  description: z.string().min(2, { message: "Description is requred" }),
});

export const ReviewForm = ({ productId, initialData }: Props) => {
  const [isPreview, setIspreview] = useState(!!initialData);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: createReview, isPending: createIspending } = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIspreview(true);
      },
      onError: (error) => {
        toast(error.message);
      },
    })
  );
  const { mutate: updateReview, isPending: updateIspending } = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIspreview(true);
      },
      onError: (error) => {
        toast(error.message);
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating ?? 0,
      description: initialData?.description ?? "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateReview({ ...data, reviewId: initialData.id });
    } else {
      createReview({ ...data, productId });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <p className="font-medium">
          {isPreview ? "Your rating" : "Liked it? Give it a rating"}
        </p>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPreview}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Want to leave a written review"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isPreview && (
          <Button
            variant="elevated"
            disabled={createIspending || updateIspending}
            type="submit"
            size="lg"
            className="bg-black text-white w-fit hover:text-primary hover:bg-pink-400"
          >
            {initialData ? "Update review" : "Post review"}
          </Button>
        )}
      </form>
      {isPreview && (
        <Button
          onClick={() => setIspreview(false)}
          variant="elevated"
          disabled={false}
          type="button"
          size="lg"
          className="w-fit mt-4"
        >
          Edit
        </Button>
      )}
    </Form>
  );
};
