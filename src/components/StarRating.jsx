import React, { useState } from "react";
import { Star } from "lucide-react";

export function StarDisplay({ rating, size = "sm", showNumber = false }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" };
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      {showNumber && <span className="ml-1 text-sm font-semibold text-gray-700">{Number(rating).toFixed(1)}</span>}
    </div>
  );
}

export function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const filled = hover ? star <= hover : star <= value;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${filled ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
            />
          </button>
        );
      })}
    </div>
  );
}