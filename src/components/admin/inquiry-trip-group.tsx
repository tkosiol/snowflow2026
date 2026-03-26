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
import { InquiryPersonCount } from "@/components/admin/inquiry-person-count";
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
import { ChevronRight, ChevronDown, Trash2 } from "lucide-react";

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
}

interface TripGroupProps {
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

function InquiryRow({ inquiry, tripTitle, onDeleted }: { inquiry: InquiryData; tripTitle: string; onDeleted: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
            <InquiryPersonCount id={inquiry.id} currentCount={inquiry.personCount} />
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
              <p>{inquiry.personCount}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Datum</span>
              <p>{formatDate(inquiry.createdAt)}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</span>
              <p>{statusLabels[inquiry.status] ?? inquiry.status}</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Abbrechen
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Löschen..." : "Endgültig löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {expanded && (
        <TableRow className="bg-gray-50/50">
          <TableCell colSpan={5} className="p-0">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-6 py-4 text-sm">
              {inquiry.dateOfBirth && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Geburtsdatum</span>
                  <p>{formatDate(inquiry.dateOfBirth)}</p>
                </div>
              )}
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
              <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
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

export function InquiryTripGroup({ tripTitle, departureDate, returnDate, inquiries: initialInquiries }: TripGroupProps) {
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
        return dir * (a.personCount - b.personCount);
      default:
        return 0;
    }
  });

  // Compute stats
  const stats: Record<string, { count: number; persons: number }> = {};
  for (const s of ["NEW", "CONTACTED", "PAID", "CLOSED"]) {
    const matching = inquiries.filter((i) => i.status === s);
    stats[s] = {
      count: matching.length,
      persons: matching.reduce((sum, i) => sum + i.personCount, 0),
    };
  }

  const totalPersons = inquiries.reduce((sum, i) => sum + i.personCount, 0);

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

  return (
    <Collapsible defaultOpen={inquiries.some((i) => i.status === "NEW")} className="group/panel rounded-lg border bg-white">
      <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
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
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Keine Anfragen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CollapsibleContent>
    </Collapsible>
  );
}
