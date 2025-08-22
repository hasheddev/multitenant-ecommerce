interface Props {
  params: Promise<{ category: string; subcategory: string }>;
}

const Category = async ({ params }: Props) => {
  const { category, subcategory } = await params;
  return (
    <div>
      {category} {subcategory}
    </div>
  );
};

export default Category;
