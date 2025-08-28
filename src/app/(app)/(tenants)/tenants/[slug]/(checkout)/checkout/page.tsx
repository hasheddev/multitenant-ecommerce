import CheckoutView from "@/modules/checkout/ui/views/checkout-view";

interface Props {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: Props) => {
  const { slug } = await params;
  return <CheckoutView slug={slug} />;
};

export default Page;
