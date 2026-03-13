"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Plus } from "lucide-react";
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
import type { TripFormData, Extra } from "@/lib/validations";

interface TripFormProps {
  initialData?: TripFormData;
  onSubmit: (data: TripFormData) => Promise<void>;
}

interface TranslationState {
  title: string;
  subtitle: string;
  description: string;
  includedItems: string[];
  locationInfo: string;
  accommodationInfo: string;
  logisticsInfo: string;
  extras: Extra[];
}

const emptyTranslation: TranslationState = {
  title: "",
  subtitle: "",
  description: "",
  includedItems: [],
  locationInfo: "",
  accommodationInfo: "",
  logisticsInfo: "",
  extras: [],
};

function ExtrasEditor({
  extras,
  onChange,
}: {
  extras: Extra[];
  onChange: (extras: Extra[]) => void;
}) {
  function addExtra() {
    onChange([...extras, { name: "", price: 0 }]);
  }

  function removeExtra(index: number) {
    onChange(extras.filter((_, i) => i !== index));
  }

  function updateExtra(index: number, field: "name" | "price", value: string) {
    const updated = [...extras];
    if (field === "price") {
      // Allow comma as decimal separator
      const normalized = value.replace(",", ".");
      updated[index] = { ...updated[index], price: parseFloat(normalized) || 0 };
    } else {
      updated[index] = { ...updated[index], name: value };
    }
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {extras.map((extra, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="z.B. Doppelzimmer"
            value={extra.name}
            onChange={(e) => updateExtra(i, "name", e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              placeholder="0,00"
              value={extra.price || ""}
              onChange={(e) => updateExtra(i, "price", e.target.value)}
              className="w-24 text-right"
            />
            <span className="text-sm text-muted-foreground">€</span>
          </div>
          <button
            type="button"
            onClick={() => removeExtra(i)}
            className="rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addExtra}>
        <Plus className="size-3.5 mr-1" /> Extra hinzufügen
      </Button>
    </div>
  );
}

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

  const [de, setDe] = useState<TranslationState>(
    initialData?.translations.de
      ? { ...emptyTranslation, ...initialData.translations.de }
      : { ...emptyTranslation }
  );
  const [en, setEn] = useState<TranslationState>(
    initialData?.translations.en
      ? { ...emptyTranslation, ...initialData.translations.en }
      : { ...emptyTranslation }
  );

  const [deIncludedText, setDeIncludedText] = useState(
    (initialData?.translations.de?.includedItems ?? []).join("\n")
  );
  const [enIncludedText, setEnIncludedText] = useState(
    (initialData?.translations.en?.includedItems ?? []).join("\n")
  );

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload fehlgeschlagen");
      }
      const { url } = await res.json();
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          },
          en: {
            ...en,
            includedItems: enIncludedText
              .split("\n")
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
          <Label>Bild</Label>
          {imageUrl ? (
            <div className="relative w-full max-w-sm">
              <Image
                src={imageUrl}
                alt="Trip image"
                width={400}
                height={250}
                className="rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow hover:bg-destructive/80"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 transition-colors hover:border-primary/50 hover:bg-muted/50">
              <Upload className="mb-2 size-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {uploading ? "Wird hochgeladen..." : "Bild auswählen oder hierher ziehen"}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP (max. 10 MB)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
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
              <Label>Inklusivleistungen (eine pro Zeile)</Label>
              <Textarea value={deIncludedText} onChange={(e) => setDeIncludedText(e.target.value)} rows={5} placeholder={"Busfahrt ab/bis Berlin\n5x Übernachtung mit Frühstück\n4-Tages-Skipass"} />
            </div>
            <div className="space-y-2">
              <Label>Extras (zubuchbar)</Label>
              <ExtrasEditor
                extras={de.extras}
                onChange={(extras) => setDe((prev) => ({ ...prev, extras }))}
              />
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
              <Input value={en.title} onChange={(e) => updateEn("title", e.target.value)} />
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
              <Label>Included Items (one per line)</Label>
              <Textarea value={enIncludedText} onChange={(e) => setEnIncludedText(e.target.value)} rows={5} placeholder={"Bus transfer from/to Berlin\n5 nights with breakfast\n4-day ski pass"} />
            </div>
            <div className="space-y-2">
              <Label>Extras (bookable)</Label>
              <ExtrasEditor
                extras={en.extras}
                onChange={(extras) => setEn((prev) => ({ ...prev, extras }))}
              />
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
