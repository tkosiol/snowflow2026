"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface InquiryPersonCountProps {
  id: string;
  currentCount: number;
}

export function InquiryPersonCount({ id, currentCount }: InquiryPersonCountProps) {
  const router = useRouter();
  const [value, setValue] = useState((currentCount ?? 1).toString());

  async function handleBlur() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num === (currentCount ?? 1)) {
      setValue((currentCount ?? 1).toString());
      return;
    }
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, personCount: num }),
    });
    router.refresh();
  }

  return (
    <Input
      type="number"
      min={1}
      className="w-16 text-center"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}
