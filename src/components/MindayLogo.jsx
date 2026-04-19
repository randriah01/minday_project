import React from "react";

export default function MindayLogo({ size = "md", light = false }) {
  const sizes = {
    sm: "h-8",
    md: "h-11",
    lg: "h-14",
    xl: "h-20",
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/91a386bd7_Black_White_Minimal_Simple_Modern__Classic__Photography_Studio_Salt_Logo-removebg-preview.png"
        alt="Minday"
        className={`${sizes[size]} object-contain ${light ? "brightness-0 invert" : ""}`}
      />
    </div>
  );
}