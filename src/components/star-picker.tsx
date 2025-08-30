import { StarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface StarPickerProps {
  value?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (value: number) => void;
}

export const StarPicker = ({
  value = 0,
  className,
  disabled,
  onChange,
}: StarPickerProps) => {
  const [hoverValue, setHoverValue] = useState(0);

  const handleChange = (value: number) => {
    onChange?.(value);
  };

  return (
    <div
      className={cn(
        "flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={cn(
            "p-0.5",
            !disabled && "cursor-pointer hover:scale-110 transition"
          )}
          onClick={() => handleChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
        >
          <StarIcon
            className={cn(
              "size-5",
              (hoverValue || value) >= star
                ? "stroke-black fill-black"
                : "stroke-black"
            )}
          />
        </button>
      ))}
    </div>
  );
};
