import React from "react";
import configPromise from "@payload-config";
import { getPayload } from "payload";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { SearchFilter } from "./search-filters/search-filter";
import { Category } from "@/payload-types";
import { CustomCategory } from "./types";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const payload = await getPayload({
    config: configPromise,
  });
  const data = await payload.find({
    collection: "categories",
    pagination: false, //load every document
    depth: 1, //populate nested document if 0 only id would be returned only up to given depth
    where: { parent: { exists: false } },
    sort: "name",
  });
  //At  depth 1 subcaterory with be of type Category
  const formatedData: CustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilter data={formatedData} />
      <div className="flex-1 bg-[#f4f4f0]">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
