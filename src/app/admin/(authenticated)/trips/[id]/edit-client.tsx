"use client";

import { useRouter } from "next/navigation";
import { TripForm } from "@/components/admin/trip-form";
import type { TripFormData } from "@/lib/validations";

interface EditTripClientProps {
  id: string;
  initialData: TripFormData;
}

export function EditTripClient({ id, initialData }: EditTripClientProps) {
  const router = useRouter();

  async function handleSubmit(data: TripFormData) {
    const res = await fetch(`/api/admin/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to update trip");
    }

    router.push("/admin/trips");
  }

  return <TripForm initialData={initialData} onSubmit={handleSubmit} />;
}
