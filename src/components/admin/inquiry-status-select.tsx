"use client";

import { useState } from "react";
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
  PAID: "Bezahlt",
  CLOSED: "Geschlossen",
};

const statusColors: Record<string, string> = {
  NEW: "text-blue-600",
  CONTACTED: "text-amber-600",
  PAID: "text-green-600",
  CLOSED: "text-gray-500",
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
  const [status, setStatus] = useState(currentStatus);

  async function handleChange(newStatus: string | null) {
    if (!newStatus || newStatus === status) return;
    setStatus(newStatus);
    await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue>
          {(value: string | null) => (
            <span className={statusColors[value ?? status]}>
              {statusLabels[value ?? status] ?? value}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="NEW">
          <span className={statusColors.NEW}>{statusLabels.NEW}</span>
        </SelectItem>
        <SelectItem value="CONTACTED">
          <span className={statusColors.CONTACTED}>{statusLabels.CONTACTED}</span>
        </SelectItem>
        <SelectItem value="PAID">
          <span className={statusColors.PAID}>{statusLabels.PAID}</span>
        </SelectItem>
        <SelectItem value="CLOSED">
          <span className={statusColors.CLOSED}>{statusLabels.CLOSED}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
