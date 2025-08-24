"use client";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { PriceFilter } from "./price-filter";
import { useProductFilters } from "@/modules/home/use-product-filters";

interface ProductFilterProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const ProductFilter = ({ children, className, title }: ProductFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Icon = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <div className={cn("p-4 border-b flex flex-col gap-2", className)}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen((open) => !open)}
      >
        <p className="font-medium">{title}</p>
        <Icon />
      </div>
      {isOpen && children}
    </div>
  );
};

export const ProductFilters = () => {
  const [filters, setFilters] = useProductFilters();

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="border rounded-md bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        <button className="underline" onClick={() => {}} type="button">
          Clear
        </button>
      </div>
      <ProductFilter className="border-b-0" title="Price">
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMaxPricechange={(value) => onChange("maxPrice", value)}
          onMinPricechange={(value) => onChange("minPrice", value)}
        />
      </ProductFilter>
    </div>
  );
};
