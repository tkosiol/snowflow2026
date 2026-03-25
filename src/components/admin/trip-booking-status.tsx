"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BookingStatus } from "@/lib/validations";

const labels: Record<BookingStatus, string> = {
  AVAILABLE: "Buchbar",
  ALMOST_FULL: "Fast ausgebucht",
  FULL: "Ausgebucht",
};

const colors: Record<BookingStatus, string> = {
  AVAILABLE: "text-green-700 bg-green-50",
  ALMOST_FULL: "text-amber-700 bg-amber-50",
  FULL: "text-red-700 bg-red-50",
};

export function TripBookingStatus({
  id,
  initialStatus,
}: {
  id: string;
  initialStatus: BookingStatus;
}) {
  const [status, setStatus] = useState<BookingStatus>(initialStatus);

  async function handleChange(value: string | null) {
    if (!value) return;
    const newStatus = value as BookingStatus;
    setStatus(newStatus);
    await fetch(`/api/admin/trips/${id}/booking-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingStatus: newStatus }),
    });
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className={`w-40 text-xs font-medium ${colors[status]}`}>
        <SelectValue>
          {(value: string | null) =>
            value ? labels[value as BookingStatus] ?? value : "—"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AVAILABLE">Buchbar</SelectItem>
        <SelectItem value="ALMOST_FULL">Fast ausgebucht</SelectItem>
        <SelectItem value="FULL">Ausgebucht</SelectItem>
      </SelectContent>
    </Select>
  );
}
