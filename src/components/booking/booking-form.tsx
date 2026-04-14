"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { bookingSchema } from "@/lib/validations";
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
import { Trash2, UserPlus } from "lucide-react";

interface BookingTrip {
  id: string;
  title: string;
  slug: string;
  departureDate: string;
  returnDate: string;
}

interface PersonForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
  const locale = useLocale();
  const searchParams = useSearchParams();
  const tripSlug = searchParams.get("trip");

  const [tripId, setTripId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [persons, setPersons] = useState<PersonForm[]>([
    { firstName: "", lastName: "", dateOfBirth: "" },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    if (tripSlug) {
      const match = trips.find((trip) => trip.slug === tripSlug);
      if (match) setTripId(match.id);
    }
  }, [tripSlug, trips]);

  function updatePerson(index: number, field: keyof PersonForm, value: string) {
    setPersons((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((prev) => {
      const key = `persons.${index}.${field}`;
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }

  function addPerson() {
    setPersons((prev) => [...prev, { firstName: "", lastName: "", dateOfBirth: "" }]);
  }

  function removePerson(index: number) {
    if (persons.length <= 1) return;
    setPersons((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    setSubmitError(false);

    const data = {
      tripId,
      firstName,
      lastName,
      email,
      phone,
      street,
      postalCode,
      city,
      persons,
      remarks,
      locale,
    };

    const result = bookingSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
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
        body: JSON.stringify({ ...result.data, website: honeypot }),
      });

      if (!response.ok) throw new Error("Booking failed");

      setSuccess(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-lg bg-green-50 p-6 text-center text-sm text-green-800">
          {t("success")}
        </div>
        <Button
          className="w-full hover:bg-primary/80 transition-colors"
          onClick={() => {
            setSuccess(false);
            setTripId("");
            setFirstName("");
            setLastName("");
            setEmail("");
            setPhone("");
            setStreet("");
            setPostalCode("");
            setCity("");
            setRemarks("");
            setPersons([{ firstName: "", lastName: "", dateOfBirth: "" }]);
            setErrors({});
          }}
        >
          {t("newInquiry")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {/* Honeypot — hidden from humans, filled by bots */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
      />
      {submitError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {t("error")}
        </div>
      )}

      {/* Trip select */}
      <div className="space-y-2">
        <Label htmlFor="trip-select">{t("selectTrip")}</Label>
        <Select value={tripId} onValueChange={(v) => v && setTripId(v)}>
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
        {errors.tripId && <p className="text-sm text-destructive">{errors.tripId}</p>}
      </div>

      {/* Contact person */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-foreground">{t("contactPerson")}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input id="firstName" value={firstName} onChange={(e) => { setFirstName(e.target.value); setErrors((p) => ({ ...p, firstName: "" })); }} aria-invalid={!!errors.firstName} />
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input id="lastName" value={lastName} onChange={(e) => { setLastName(e.target.value); setErrors((p) => ({ ...p, lastName: "" })); }} aria-invalid={!!errors.lastName} />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }} aria-invalid={!!errors.phone} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">{t("street")}</Label>
          <Input id="street" value={street} onChange={(e) => { setStreet(e.target.value); setErrors((p) => ({ ...p, street: "" })); }} aria-invalid={!!errors.street} />
          {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postalCode">{t("postalCode")}</Label>
            <Input id="postalCode" value={postalCode} onChange={(e) => { setPostalCode(e.target.value); setErrors((p) => ({ ...p, postalCode: "" })); }} aria-invalid={!!errors.postalCode} />
            {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input id="city" value={city} onChange={(e) => { setCity(e.target.value); setErrors((p) => ({ ...p, city: "" })); }} aria-invalid={!!errors.city} />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>
        </div>
      </fieldset>

      {/* Persons */}
      <fieldset className="space-y-4">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold text-foreground">
            {t("persons")} ({persons.length})
          </legend>
          <button
            type="button"
            onClick={addPerson}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            <UserPlus className="size-3.5" />
            {t("addPerson")}
          </button>
        </div>

        {errors.persons && <p className="text-sm text-destructive">{errors.persons}</p>}

        <div className="space-y-3">
          {persons.map((person, index) => (
            <div
              key={index}
              className="rounded-lg border bg-muted/30 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("personLabel")} {index + 1}
                </span>
                {persons.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePerson(index)}
                    className="rounded p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t("removePerson")}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("firstName")}</Label>
                  <Input
                    value={person.firstName}
                    onChange={(e) => updatePerson(index, "firstName", e.target.value)}
                    aria-invalid={!!errors[`persons.${index}.firstName`]}
                  />
                  {errors[`persons.${index}.firstName`] && (
                    <p className="text-xs text-destructive">{errors[`persons.${index}.firstName`]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("lastName")}</Label>
                  <Input
                    value={person.lastName}
                    onChange={(e) => updatePerson(index, "lastName", e.target.value)}
                    aria-invalid={!!errors[`persons.${index}.lastName`]}
                  />
                  {errors[`persons.${index}.lastName`] && (
                    <p className="text-xs text-destructive">{errors[`persons.${index}.lastName`]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("dateOfBirth")}</Label>
                  <Input
                    type="date"
                    value={person.dateOfBirth}
                    onChange={(e) => updatePerson(index, "dateOfBirth", e.target.value)}
                    aria-invalid={!!errors[`persons.${index}.dateOfBirth`]}
                  />
                  {errors[`persons.${index}.dateOfBirth`] && (
                    <p className="text-xs text-destructive">{errors[`persons.${index}.dateOfBirth`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">{t("remarks")}</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
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
