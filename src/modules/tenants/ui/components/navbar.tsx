"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import React from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { generateTenantURL } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

const CheckOutButton = dynamic(
  () =>
    import("@/modules/checkout/ui/components/checkout-button").then(
      (mod) => mod.CheckOutButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button className="bg-white" disabled>
        <ShoppingCartIcon className="text-black" />
      </Button>
    ),
  }
);

const Navbar = ({ slug }: { slug: string }) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug }));
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <Link
          href={generateTenantURL(slug)}
          className="flex items-center gap-2"
        >
          {data.image?.url && (
            <Image
              src={data.image.url}
              width={32}
              height={32}
              className="border rounded-full size-[32] shrink-0"
              alt={slug}
            />
          )}
          <p className="text-xl">{data.name}</p>
        </Link>
        <CheckOutButton hideIfEmpty tenantSlug={slug} />
      </div>
    </nav>
  );
};

export default Navbar;

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
        <Button className="bg-white" disabled>
          <ShoppingCartIcon className="text-black" />
        </Button>
      </div>
    </nav>
  );
};
