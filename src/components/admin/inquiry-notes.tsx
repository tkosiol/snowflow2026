"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

interface InquiryNotesProps {
  id: string;
  currentNotes: string;
}

export function InquiryNotes({ id, currentNotes }: InquiryNotesProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentNotes);
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (value === currentNotes) return;
    setSaving(true);
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <Textarea
      className="min-h-[60px] text-sm"
      placeholder="Notizen..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={saving}
    />
  );
}
