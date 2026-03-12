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
import { ChevronRight } from "lucide-react";

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

export function InquiryTripGroup({ tripTitle, departureDate, returnDate, inquiries }: TripGroupProps) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
              <TableHead>Telefon</TableHead>
              <TableHead>Adresse</TableHead>
              <SortHeader label="Datum" sortKeyName="createdAt" />
              <SortHeader label="Status" sortKeyName="status" />
              <SortHeader label="Pers." sortKeyName="personCount" />
              <TableHead className="min-w-[200px]">Notizen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {inquiry.firstName} {inquiry.lastName}
                  {inquiry.dateOfBirth && (
                    <div className="text-xs text-muted-foreground">
                      geb. {formatDate(inquiry.dateOfBirth)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">{inquiry.email}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">{inquiry.phone}</TableCell>
                <TableCell className="text-sm">
                  {inquiry.street && (
                    <div>{inquiry.street}</div>
                  )}
                  {(inquiry.postalCode || inquiry.city) && (
                    <div>{inquiry.postalCode} {inquiry.city}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDate(inquiry.createdAt)}
                </TableCell>
                <TableCell>
                  <InquiryStatusSelect id={inquiry.id} currentStatus={inquiry.status} />
                </TableCell>
                <TableCell>
                  <InquiryPersonCount id={inquiry.id} currentCount={inquiry.personCount} />
                </TableCell>
                <TableCell>
                  <InquiryNotes id={inquiry.id} currentNotes={inquiry.notes} />
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  Keine Anfragen.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {inquiries.some((i) => i.remarks) && (
          <div className="border-t p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anmerkungen der Teilnehmer</p>
            {inquiries.filter((i) => i.remarks).map((i) => (
              <div key={i.id} className="text-sm">
                <span className="font-medium">{i.firstName} {i.lastName}:</span>{" "}
                <span className="text-muted-foreground">{i.remarks}</span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
