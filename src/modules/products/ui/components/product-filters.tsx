"use client";

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { PriceFilter } from "./price-filter";
import { useProductFilters } from "@/modules/products/hooks/use-product-filters";
import { TagsFilter } from "./tags-filter";

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

  const hasAnyFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sort") return false;

    if (Array.isArray(value)) return value.length > 0;

    return typeof value === "string" ? value !== "" : value !== null;
  });

  const onClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      tags: [],
    });
  };

  const onChange = (key: keyof typeof filters, value: unknown) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="border rounded-md bg-white">
      <div className="p-4 border-b flex items-center justify-between">
        <p className="font-medium">Filters</p>
        {hasAnyFilters && (
          <button
            className="underline cursor-pointer"
            onClick={() => onClear()}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      <ProductFilter title="Price">
        <PriceFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMaxPricechange={(value) => onChange("maxPrice", value)}
          onMinPricechange={(value) => onChange("minPrice", value)}
        />
      </ProductFilter>
      <ProductFilter className="border-b-0" title="Tags">
        <TagsFilter
          value={filters.tags}
          onChange={(value) => onChange("tags", value)}
        />
      </ProductFilter>
    </div>
  );
};
