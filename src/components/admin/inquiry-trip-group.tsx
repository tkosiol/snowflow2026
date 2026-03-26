"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { InquiryNotes } from "@/components/admin/inquiry-notes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronDown, Trash2, Download, UserPlus } from "lucide-react";

export interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface InquiryData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  remarks: string;
  createdAt: string;
  status: string;
  personCount: number;
  notes: string;
  persons: PersonData[];
}

interface TripGroupProps {
  tripId: string;
  tripTitle: string;
  departureDate: string;
  returnDate: string;
  inquiries: InquiryData[];
}

type SortKey = "name" | "email" | "createdAt" | "status" | "personCount";
type SortDir = "asc" | "desc";

const statusOrder: Record<string, number> = {
  NEW: 0,
  CONTACTED: 1,
  PAID: 2,
  CLOSED: 3,
};

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  CONTACTED: "Kontaktiert",
  PAID: "Bezahlt",
  CLOSED: "Geschlossen",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function StatusBadge({ status, count, persons }: { status: string; count: number; persons: number }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}>
      {statusLabels[status]}: {count} ({persons})
    </span>
  );
}

// ─── Person Management ───────────────────────────────────

function PersonRow({ person, onDeleted }: { person: PersonData; onDeleted: (id: string) => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/inquiries/persons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: person.id }),
      });
      if (res.ok) {
        setDeleteOpen(false);
        onDeleted(person.id);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-foreground">
          {person.firstName} {person.lastName}
        </span>
        {person.dateOfBirth && (
          <span className="text-muted-foreground">
            geb. {formatDate(person.dateOfBirth)}
          </span>
        )}
      </div>
      <button
        onClick={() => setDeleteOpen(true)}
        className="rounded p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Person entfernen"
      >
        <Trash2 className="size-3.5" />
      </button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Person entfernen?</DialogTitle>
            <DialogDescription>
              <strong>{person.firstName} {person.lastName}</strong> wird aus dieser Anfrage entfernt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Abbrechen
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Entfernen..." : "Entfernen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddPersonForm({ inquiryId, onAdded }: { inquiryId: string; onAdded: (person: PersonData) => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!firstName.trim() || !lastName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inquiries/persons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiryId, firstName: firstName.trim(), lastName: lastName.trim(), dateOfBirth }),
      });
      if (res.ok) {
        const person = await res.json();
        onAdded(person);
        setFirstName("");
        setLastName("");
        setDateOfBirth("");
        setOpen(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
      >
        <UserPlus className="size-3.5" />
        Person hinzufügen
      </button>
    );
  }

  return (
    <div className="flex items-end gap-2 pt-2 border-t border-dashed">
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Vorname</Label>
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-8 text-sm" />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Nachname</Label>
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-8 text-sm" />
      </div>
      <div className="flex-1 space-y-1">
        <Label className="text-xs">Geburtsdatum</Label>
        <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="h-8 text-sm" />
      </div>
      <Button size="sm" onClick={handleAdd} disabled={saving || !firstName.trim() || !lastName.trim()}>
        {saving ? "..." : "Hinzufügen"}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Abbrechen
      </Button>
    </div>
  );
}

// ─── Inquiry Row ─────────────────────────────────────────

function InquiryRow({ inquiry, tripTitle, onDeleted }: { inquiry: InquiryData; tripTitle: string; onDeleted: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [persons, setPersons] = useState(inquiry.persons);

  const personCount = persons.length || inquiry.personCount;

  function handleRowClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("select, input, textarea, button, [data-slot='select-trigger'], [data-slot='select-content'], [data-slot='dialog']")) {
      return;
    }
    setExpanded(!expanded);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inquiry.id }),
      });
      if (res.ok) {
        setDeleteOpen(false);
        onDeleted(inquiry.id);
      }
    } finally {
      setDeleting(false);
    }
  }

  function handlePersonDeleted(personId: string) {
    setPersons((prev) => prev.filter((p) => p.id !== personId));
  }

  function handlePersonAdded(person: PersonData) {
    setPersons((prev) => [...prev, person]);
  }

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleRowClick}
      >
        <TableCell className="font-medium whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {expanded ? (
              <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
            )}
            {inquiry.firstName} {inquiry.lastName}
          </div>
        </TableCell>
        <TableCell className="text-sm">{inquiry.email}</TableCell>
        <TableCell className="text-sm whitespace-nowrap">
          {formatDate(inquiry.createdAt)}
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <InquiryStatusSelect id={inquiry.id} currentStatus={inquiry.status} />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium tabular-nums w-6 text-center">{personCount}</span>
            <button
              onClick={() => setDeleteOpen(true)}
              className="rounded p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Anfrage löschen"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Anfrage löschen?</DialogTitle>
            <DialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm py-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</span>
              <p className="font-medium">{inquiry.firstName} {inquiry.lastName}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</span>
              <p>{inquiry.email}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reise</span>
              <p>{tripTitle}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Personen</span>
              <p>{personCount}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Abbrechen
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Löschen..." : "Endgültig löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {expanded && (
        <TableRow className="bg-gray-50/50">
          <TableCell colSpan={5} className="p-0">
            <div className="px-6 py-4 space-y-4">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {inquiry.phone && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefon</span>
                    <p>{inquiry.phone}</p>
                  </div>
                )}
                {(inquiry.street || inquiry.postalCode || inquiry.city) && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adresse</span>
                    {inquiry.street && <p>{inquiry.street}</p>}
                    {(inquiry.postalCode || inquiry.city) && (
                      <p>{inquiry.postalCode} {inquiry.city}</p>
                    )}
                  </div>
                )}
                {inquiry.remarks && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Anmerkungen</span>
                    <p className="text-muted-foreground">{inquiry.remarks}</p>
                  </div>
                )}
              </div>

              {/* Persons */}
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Reiseteilnehmer ({personCount})
                </span>
                <div className="mt-2 rounded-lg border bg-white divide-y">
                  {persons.length > 0 ? (
                    persons.map((person) => (
                      <PersonRow key={person.id} person={person} onDeleted={handlePersonDeleted} />
                    ))
                  ) : (
                    // Legacy: show old dateOfBirth if no persons exist
                    inquiry.dateOfBirth ? (
                      <div className="py-2 px-3 text-sm text-muted-foreground">
                        Altdaten: {inquiry.firstName} {inquiry.lastName}, geb. {formatDate(inquiry.dateOfBirth)} (Personen: {inquiry.personCount})
                      </div>
                    ) : (
                      <div className="py-2 px-3 text-sm text-muted-foreground">
                        Keine Personen hinterlegt.
                      </div>
                    )
                  )}
                </div>
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <AddPersonForm inquiryId={inquiry.id} onAdded={handlePersonAdded} />
                </div>
              </div>

              {/* Notes */}
              <div onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notizen</span>
                <div className="mt-1">
                  <InquiryNotes id={inquiry.id} currentNotes={inquiry.notes} />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Trip Group ──────────────────────────────────────────

export function InquiryTripGroup({ tripId, tripTitle, departureDate, returnDate, inquiries: initialInquiries }: TripGroupProps) {
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleDeleted(id: string) {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...inquiries].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "name":
        return dir * `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      case "email":
        return dir * a.email.localeCompare(b.email);
      case "createdAt":
        return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "status":
        return dir * ((statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0));
      case "personCount":
        return dir * ((a.persons.length || a.personCount) - (b.persons.length || b.personCount));
      default:
        return 0;
    }
  });

  const stats: Record<string, { count: number; persons: number }> = {};
  for (const s of ["NEW", "CONTACTED", "PAID", "CLOSED"]) {
    const matching = inquiries.filter((i) => i.status === s);
    stats[s] = {
      count: matching.length,
      persons: matching.reduce((sum, i) => sum + (i.persons.length || i.personCount), 0),
    };
  }

  const totalPersons = inquiries.reduce((sum, i) => sum + (i.persons.length || i.personCount), 0);

  function SortHeader({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) {
    const active = sortKey === sortKeyName;
    return (
      <TableHead
        className="cursor-pointer select-none hover:text-foreground transition-colors"
        onClick={() => handleSort(sortKeyName)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {active && (
            <span className="text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>
          )}
        </span>
      </TableHead>
    );
  }

  if (inquiries.length === 0) return null;

  return (
    <Collapsible defaultOpen={inquiries.some((i) => i.status === "NEW")} className="group/panel rounded-lg border bg-white">
      <div className="flex items-center">
        <CollapsibleTrigger className="flex flex-1 items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
          <ChevronRight className="size-5 text-muted-foreground transition-transform group-data-[panel-open]:rotate-90" />
          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-lg">{tripTitle}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(departureDate)} – {formatDate(returnDate)}
              </span>
              <span className="text-sm text-muted-foreground">
                · {inquiries.length} Anfragen ({totalPersons} Personen)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {(["NEW", "CONTACTED", "PAID", "CLOSED"] as const).map((s) => (
                <StatusBadge key={s} status={s} count={stats[s].count} persons={stats[s].persons} />
              ))}
            </div>
          </div>
        </CollapsibleTrigger>
        <a
          href={`/api/admin/inquiries/export?tripId=${tripId}`}
          download
          className="mr-4 rounded-lg p-2.5 text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
          title="Als Excel herunterladen"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="size-5" />
        </a>
      </div>
      <CollapsibleContent className="border-t">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Name" sortKeyName="name" />
              <SortHeader label="Email" sortKeyName="email" />
              <SortHeader label="Datum" sortKeyName="createdAt" />
              <SortHeader label="Status" sortKeyName="status" />
              <SortHeader label="Pers." sortKeyName="personCount" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} tripTitle={tripTitle} onDeleted={handleDeleted} />
            ))}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
