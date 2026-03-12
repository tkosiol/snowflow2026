import { z } from "zod";

export const bookingSchema = z.object({
  tripId: z.string().min(1, "Bitte eine Reise auswählen"),
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().min(1, "Telefonnummer ist erforderlich"),
  dateOfBirth: z.string().min(1, "Geburtsdatum ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  postalCode: z.string().min(1, "Postleitzahl ist erforderlich"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  remarks: z.string().optional().default(""),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const tripSchema = z.object({
  slug: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  departureDate: z.string().min(1),
  returnDate: z.string().min(1),
  priceEur: z.number().int().positive(),
  destination: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  translations: z.object({
    de: z.object({
      title: z.string().min(1),
      subtitle: z.string().optional().default(""),
      description: z.string().optional().default(""),
      includedItems: z.array(z.string()).optional().default([]),
      locationInfo: z.string().optional().default(""),
      accommodationInfo: z.string().optional().default(""),
      logisticsInfo: z.string().optional().default(""),
    }),
    en: z.object({
      title: z.string().min(1),
      subtitle: z.string().optional().default(""),
      description: z.string().optional().default(""),
      includedItems: z.array(z.string()).optional().default([]),
      locationInfo: z.string().optional().default(""),
      accommodationInfo: z.string().optional().default(""),
      logisticsInfo: z.string().optional().default(""),
    }),
  }),
});

export type TripFormData = z.infer<typeof tripSchema>;
