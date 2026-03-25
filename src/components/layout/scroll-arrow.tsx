"use client";

import { ArrowDown } from "lucide-react";

export function ScrollArrow() {
  function handleClick() {
    const hero = document.querySelector("section");
    if (!hero) return;
    window.scrollTo({ top: hero.offsetHeight, behavior: "smooth" });
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce cursor-pointer"
      aria-label="Nach unten scrollen"
    >
      <ArrowDown className="size-6 text-white/60" />
    </button>
  );
}
