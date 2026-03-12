"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TripFormData } from "@/lib/validations";

interface TripFormProps {
  initialData?: TripFormData;
  onSubmit: (data: TripFormData) => Promise<void>;
}

const emptyTranslation = {
  title: "",
  subtitle: "",
  description: "",
  includedItems: [] as string[],
  locationInfo: "",
  accommodationInfo: "",
  logisticsInfo: "",
};

export function TripForm({ initialData, onSubmit }: TripFormProps) {
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status ?? "DRAFT"
  );
  const [departureDate, setDepartureDate] = useState(
    initialData?.departureDate ?? ""
  );
  const [returnDate, setReturnDate] = useState(initialData?.returnDate ?? "");
  const [priceEur, setPriceEur] = useState(
    initialData?.priceEur?.toString() ?? ""
  );
  const [destination, setDestination] = useState(
    initialData?.destination ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");

  const [de, setDe] = useState(initialData?.translations.de ?? { ...emptyTranslation });
  const [en, setEn] = useState(initialData?.translations.en ?? { ...emptyTranslation });

  const [deIncludedText, setDeIncludedText] = useState(
    (initialData?.translations.de?.includedItems ?? []).join(", ")
  );
  const [enIncludedText, setEnIncludedText] = useState(
    (initialData?.translations.en?.includedItems ?? []).join(", ")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data: TripFormData = {
        slug,
        status,
        departureDate,
        returnDate,
        priceEur: parseInt(priceEur, 10),
        destination,
        imageUrl,
        translations: {
          de: {
            ...de,
            includedItems: deIncludedText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          en: {
            ...en,
            includedItems: enIncludedText
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          },
        },
      };

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  function updateDe(field: string, value: string) {
    setDe((prev) => ({ ...prev, [field]: value }));
  }

  function updateEn(field: string, value: string) {
    setEn((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Allgemein</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as "DRAFT" | "PUBLISHED")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Entwurf</SelectItem>
                <SelectItem value="PUBLISHED">Veröffentlicht</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="departureDate">Abreise</Label>
            <Input
              id="departureDate"
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="returnDate">Rückkehr</Label>
            <Input
              id="returnDate"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceEur">Preis (EUR)</Label>
            <Input
              id="priceEur"
              type="number"
              value={priceEur}
              onChange={(e) => setPriceEur(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Ziel</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Bild-URL</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Übersetzungen</h2>
        <Tabs defaultValue="de">
          <TabsList>
            <TabsTrigger value="de">Deutsch</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="de" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input value={de.title} onChange={(e) => updateDe("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input value={de.subtitle} onChange={(e) => updateDe("subtitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea value={de.description} onChange={(e) => updateDe("description", e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Inklusivleistungen (kommagetrennt)</Label>
              <Textarea value={deIncludedText} onChange={(e) => setDeIncludedText(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Lage-Info</Label>
              <Textarea value={de.locationInfo} onChange={(e) => updateDe("locationInfo", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Unterkunft-Info</Label>
              <Textarea value={de.accommodationInfo} onChange={(e) => updateDe("accommodationInfo", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Logistik-Info</Label>
              <Textarea value={de.logisticsInfo} onChange={(e) => updateDe("logisticsInfo", e.target.value)} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={en.title} onChange={(e) => updateEn("title", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={en.subtitle} onChange={(e) => updateEn("subtitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={en.description} onChange={(e) => updateEn("description", e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Included Items (comma-separated)</Label>
              <Textarea value={enIncludedText} onChange={(e) => setEnIncludedText(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Location Info</Label>
              <Textarea value={en.locationInfo} onChange={(e) => updateEn("locationInfo", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Accommodation Info</Label>
              <Textarea value={en.accommodationInfo} onChange={(e) => updateEn("accommodationInfo", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Logistics Info</Label>
              <Textarea value={en.logisticsInfo} onChange={(e) => updateEn("logisticsInfo", e.target.value)} rows={3} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Speichern..." : initialData ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
