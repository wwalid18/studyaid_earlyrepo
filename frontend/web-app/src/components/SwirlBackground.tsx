import React from "react";

export default function SwirlBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="swirl1" x1="0" y1="0" x2="400" y2="600" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7f5fff" />
          <stop offset="1" stopColor="#5e8bff" />
        </linearGradient>
        <linearGradient id="swirl2" x1="400" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5e8bff" />
          <stop offset="1" stopColor="#7f5fff" />
        </linearGradient>
      </defs>
      <path d="M50 100 Q200 200 350 100" stroke="url(#swirl1)" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M100 200 Q200 400 300 200" stroke="url(#swirl2)" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M80 400 Q200 500 320 400" stroke="url(#swirl1)" strokeWidth="2" fill="none" opacity="0.2" />
      <path d="M0 300 Q200 350 400 300" stroke="url(#swirl2)" strokeWidth="2" fill="none" opacity="0.2" />
    </svg>
  );
} 