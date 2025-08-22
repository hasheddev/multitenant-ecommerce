interface Props {
  params: Promise<{ category: string }>;
}

const Category = async ({ params }: Props) => {
  const { category } = await params;
  return <div>{category}</div>;
};

export default Category;
