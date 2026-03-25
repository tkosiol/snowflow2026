"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, X, Plus, GripVertical, Trash2 } from "lucide-react";
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
import type {
  TripFormData,
  TripSection,
  PriceItem,
  SectionType,
} from "@/lib/validations";

interface TripFormProps {
  initialData?: TripFormData;
  onSubmit: (data: TripFormData) => Promise<void>;
}

function generateId() {
  return crypto.randomUUID();
}

function emptySection(position: number): TripSection {
  return {
    id: generateId(),
    title: "",
    type: "text",
    content: "",
    priceItems: [],
    position,
  };
}

// --- Price Items Editor ---
function PriceItemsEditor({
  items,
  onChange,
}: {
  items: PriceItem[];
  onChange: (items: PriceItem[]) => void;
}) {
  function addItem() {
    onChange([...items, { name: "", price: 0 }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: "name" | "price", value: string) {
    const updated = [...items];
    if (field === "price") {
      const normalized = value.replace(",", ".");
      updated[index] = { ...updated[index], price: parseFloat(normalized) || 0 };
    } else {
      updated[index] = { ...updated[index], name: value };
    }
    onChange(updated);
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="z.B. Doppelzimmer"
            value={item.name}
            onChange={(e) => updateItem(i, "name", e.target.value)}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              placeholder="0,00"
              value={item.price || ""}
              onChange={(e) => updateItem(i, "price", e.target.value)}
              className="w-24 text-right"
            />
            <span className="text-sm text-muted-foreground">&euro;</span>
          </div>
          <button
            type="button"
            onClick={() => removeItem(i)}
            className="rounded p-1 text-muted-foreground hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="size-3.5 mr-1" /> Eintrag hinzufuegen
      </Button>
    </div>
  );
}

// --- Section content editor for a single locale ---
function SectionContentEditor({
  section,
  onChange,
}: {
  section: TripSection;
  onChange: (updated: TripSection) => void;
}) {
  if (section.type === "list-price") {
    return (
      <PriceItemsEditor
        items={section.priceItems ?? []}
        onChange={(priceItems) => onChange({ ...section, priceItems })}
      />
    );
  }

  const placeholder =
    section.type === "list"
      ? "Ein Eintrag pro Zeile"
      : "Freitext eingeben...";

  return (
    <Textarea
      value={section.content}
      onChange={(e) => onChange({ ...section, content: e.target.value })}
      rows={section.type === "list" ? 5 : 3}
      placeholder={placeholder}
    />
  );
}

// --- Sortable section row ---
function SortableSectionItem({
  section,
  locale,
  otherLocaleSection,
  onUpdateThis,
  onUpdateOther,
  onRemove,
}: {
  section: TripSection;
  locale: "de" | "en";
  otherLocaleSection: TripSection | undefined;
  onUpdateThis: (updated: TripSection) => void;
  onUpdateOther: (updated: TripSection) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleTypeChange(newType: SectionType) {
    onUpdateThis({ ...section, type: newType, content: "", priceItems: [] });
    if (otherLocaleSection) {
      onUpdateOther({
        ...otherLocaleSection,
        type: newType,
        content: "",
        priceItems: [],
      });
    }
  }

  const typeLabels: Record<SectionType, string> = {
    text: "Freitext",
    list: "Liste",
    "list-price": "Liste mit Preis",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border bg-muted/30 p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <Input
          placeholder={locale === "de" ? "Titel der Sektion" : "Section title"}
          value={section.title}
          onChange={(e) =>
            onUpdateThis({ ...section, title: e.target.value })
          }
          className="flex-1 font-semibold"
        />
        <Select
          value={section.type}
          onValueChange={(v) => v && handleTypeChange(v as SectionType)}
        >
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string | null) => value ? typeLabels[value as SectionType] ?? value : "Typ"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Freitext</SelectItem>
            <SelectItem value="list">Liste</SelectItem>
            <SelectItem value="list-price">Liste mit Preis</SelectItem>
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <SectionContentEditor section={section} onChange={onUpdateThis} />
    </div>
  );
}

// --- Main Form ---
export function TripForm({ initialData, onSubmit }: TripFormProps) {
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
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

  const [deTitle, setDeTitle] = useState(
    initialData?.translations.de?.title ?? ""
  );
  const [deSubtitle, setDeSubtitle] = useState(
    initialData?.translations.de?.subtitle ?? ""
  );
  const [enTitle, setEnTitle] = useState(
    initialData?.translations.en?.title ?? ""
  );
  const [enSubtitle, setEnSubtitle] = useState(
    initialData?.translations.en?.subtitle ?? ""
  );

  const [deSections, setDeSections] = useState<TripSection[]>(
    initialData?.translations.de?.sections ?? []
  );
  const [enSections, setEnSections] = useState<TripSection[]>(
    initialData?.translations.en?.sections ?? []
  );

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Image upload ---
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

  // --- Section management ---
  function addSection() {
    const position = deSections.length;
    const newSection = emptySection(position);
    setDeSections((prev) => [...prev, newSection]);
    setEnSections((prev) => [
      ...prev,
      { ...newSection, title: "", content: "", priceItems: [] },
    ]);
  }

  function removeSection(id: string) {
    setDeSections((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, i) => ({ ...s, position: i }));
    });
    setEnSections((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      return filtered.map((s, i) => ({ ...s, position: i }));
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const reorder = (sections: TripSection[]) => {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return sections;
      const updated = [...sections];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      return updated.map((s, i) => ({ ...s, position: i }));
    };

    // Apply same reorder to both locales
    setDeSections(reorder);
    setEnSections(reorder);
  }

  function updateDeSection(id: string, updated: TripSection) {
    setDeSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  function updateEnSection(id: string, updated: TripSection) {
    setEnSections((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  // --- Submit ---
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
            title: deTitle,
            subtitle: deSubtitle,
            sections: deSections,
          },
          en: {
            title: enTitle,
            subtitle: enSubtitle,
            sections: enSections,
          },
        },
      };

      await onSubmit(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* General section */}
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
            <Select
              value={status}
              onValueChange={(v) =>
                v &&
                setStatus(v as "DRAFT" | "PUBLISHED" | "ARCHIVED")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Entwurf</SelectItem>
                <SelectItem value="PUBLISHED">Veroeffentlicht</SelectItem>
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
            <Label htmlFor="returnDate">Rueckkehr</Label>
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
                {uploading
                  ? "Wird hochgeladen..."
                  : "Bild auswaehlen oder hierher ziehen"}
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

      {/* Translations: title + subtitle */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Uebersetzungen</h2>
        <Tabs defaultValue="de">
          <TabsList>
            <TabsTrigger value="de">Deutsch</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="de" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={deTitle}
                onChange={(e) => setDeTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input
                value={deSubtitle}
                onChange={(e) => setDeSubtitle(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="en" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={enSubtitle}
                onChange={(e) => setEnSubtitle(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dynamic sections */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Sektionen</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Reihenfolge per Drag &amp; Drop aendern. Typ und Reihenfolge gelten
          fuer beide Sprachen.
        </p>

        <Tabs defaultValue="de">
          <TabsList>
            <TabsTrigger value="de">Deutsch</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="de" className="mt-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={deSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {deSections.map((section) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      locale="de"
                      otherLocaleSection={enSections.find(
                        (s) => s.id === section.id
                      )}
                      onUpdateThis={(updated) =>
                        updateDeSection(section.id, updated)
                      }
                      onUpdateOther={(updated) =>
                        updateEnSection(section.id, updated)
                      }
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>

          <TabsContent value="en" className="mt-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={enSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {enSections.map((section) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      locale="en"
                      otherLocaleSection={deSections.find(
                        (s) => s.id === section.id
                      )}
                      onUpdateThis={(updated) =>
                        updateEnSection(section.id, updated)
                      }
                      onUpdateOther={(updated) =>
                        updateDeSection(section.id, updated)
                      }
                      onRemove={() => removeSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Button type="button" variant="outline" onClick={addSection}>
            <Plus className="size-4 mr-1.5" /> Sektion hinzufuegen
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Speichern..."
            : initialData
              ? "Aktualisieren"
              : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
