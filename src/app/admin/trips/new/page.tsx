"use client";

import { useRouter } from "next/navigation";
import { TripForm } from "@/components/admin/trip-form";
import type { TripFormData } from "@/lib/validations";

export default function NewTripPage() {
  const router = useRouter();

  async function handleSubmit(data: TripFormData) {
    const res = await fetch("/api/admin/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Failed to create trip");
    }

    router.push("/admin/trips");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Neue Reise</h1>
      <TripForm onSubmit={handleSubmit} />
    </div>
  );
}
