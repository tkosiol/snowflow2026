"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  CONTACTED: "Kontaktiert",
  CLOSED: "Geschlossen",
};

interface InquiryStatusSelectProps {
  id: string;
  currentStatus: string;
}

export function InquiryStatusSelect({
  id,
  currentStatus,
}: InquiryStatusSelectProps) {
  const router = useRouter();

  async function handleChange(newStatus: string | null) {
    if (!newStatus) return;
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    router.refresh();
  }

  return (
    <Select defaultValue={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NEW">{statusLabels.NEW}</SelectItem>
        <SelectItem value="CONTACTED">{statusLabels.CONTACTED}</SelectItem>
        <SelectItem value="CLOSED">{statusLabels.CLOSED}</SelectItem>
      </SelectContent>
    </Select>
  );
}
