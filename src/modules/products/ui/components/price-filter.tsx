import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  minPrice?: string | null;
  maxPrice?: string | null;
  onMaxPricechange: (value: string) => void;
  onMinPricechange: (value: string) => void;
}

export const PriceFilter = ({
  minPrice,
  maxPrice,
  onMaxPricechange,
  onMinPricechange,
}: Props) => {
  const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numberValue = e.target.value.replace(/[^0-9.]/g, "");
    onMinPricechange(numberValue);
  };
  const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const numberValue = e.target.value.replace(/[^0-9.]/g, "");
    onMaxPricechange(numberValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <Label className="font-medium text-base"></Label>
      </div>
      <Input
        placeholder="$0"
        type="text"
        value={minPrice ? formatAsCurrency(minPrice) : ""}
        onChange={handleMinPriceChange}
      />
      <Input
        placeholder="∞"
        type="text"
        value={maxPrice ? formatAsCurrency(maxPrice) : ""}
        onChange={handleMaxPriceChange}
      />
    </div>
  );
};

export const formatAsCurrency = (value: string) => {
  const numericValue = value.replace(/[^0-9.]/g, "");

  const parts = numericValue.split(".");
  const formattedValue =
    parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

  if (!formattedValue) return "";

  const numberValue = parseFloat(formattedValue);

  if (isNaN(numberValue)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue);
};
