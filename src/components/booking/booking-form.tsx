"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { bookingSchema, type BookingFormData } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface BookingTrip {
  id: string;
  title: string;
  slug: string;
  departureDate: string;
  returnDate: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function tripLabel(trip: BookingTrip): string {
  return `${trip.title} (${formatDate(trip.departureDate)} – ${formatDate(trip.returnDate)})`;
}

interface BookingFormProps {
  trips: BookingTrip[];
}

export function BookingForm({ trips }: BookingFormProps) {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();
  const tripSlug = searchParams.get("trip");

  const [formData, setFormData] = useState<BookingFormData>({
    tripId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    postalCode: "",
    city: "",
    remarks: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Pre-select trip from URL
  useEffect(() => {
    if (tripSlug) {
      const matchingTrip = trips.find((trip) => trip.slug === tripSlug);
      if (matchingTrip) {
        setFormData((prev) => ({ ...prev, tripId: matchingTrip.id }));
      }
    }
  }, [tripSlug, trips]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleTripChange(tripId: string | null) {
    if (!tripId) return;
    setFormData((prev) => ({ ...prev, tripId }));
    if (errors.tripId) {
      setErrors((prev) => ({ ...prev, tripId: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setSubmitError(false);

    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof BookingFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      setSuccess(true);
      setFormData({
        tripId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        street: "",
        postalCode: "",
        city: "",
        remarks: "",
      });
      setErrors({});
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          {t("success")}
        </div>
      )}

      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {t("error")}
        </div>
      )}

      {/* Trip select */}
      <div className="space-y-2">
        <Label htmlFor="trip-select">{t("selectTrip")}</Label>
        <Select value={formData.tripId} onValueChange={handleTripChange}>
          <SelectTrigger id="trip-select" className="w-full">
            <SelectValue placeholder={t("selectTrip")}>
              {(value: string | null) => {
                if (!value) return t("selectTrip");
                const trip = trips.find((tr) => tr.id === value);
                return trip ? tripLabel(trip) : value;
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id} label={tripLabel(trip)}>
                {tripLabel(trip)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tripId && (
          <p className="text-sm text-destructive">{errors.tripId}</p>
        )}
      </div>

      {/* Name row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email & phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Date of birth */}
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">{t("dateOfBirth")}</Label>
        <Input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          aria-invalid={!!errors.dateOfBirth}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-destructive">{errors.dateOfBirth}</p>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="street">{t("street")}</Label>
        <Input
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          aria-invalid={!!errors.street}
        />
        {errors.street && (
          <p className="text-sm text-destructive">{errors.street}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postalCode">{t("postalCode")}</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            aria-invalid={!!errors.postalCode}
          />
          {errors.postalCode && (
            <p className="text-sm text-destructive">{errors.postalCode}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">{t("city")}</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            aria-invalid={!!errors.city}
          />
          {errors.city && (
            <p className="text-sm text-destructive">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">{t("remarks")}</Label>
        <Textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder={t("remarksPlaceholder")}
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full hover:bg-primary/80 transition-colors" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
