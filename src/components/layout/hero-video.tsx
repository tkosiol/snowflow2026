"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    // Ensure video plays after source change
    videoRef.current?.play().catch(() => {});
  }, [isMobile]);

  if (!mounted) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover"
      key={isMobile ? "mobile" : "desktop"}
    >
      <source
        src={isMobile ? "/videos/hero-mobile.mp4" : "/videos/hero-desktop.mp4"}
        type="video/mp4"
      />
    </video>
  );
}
