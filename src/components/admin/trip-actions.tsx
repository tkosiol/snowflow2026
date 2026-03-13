"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Archive, Trash2, RotateCcw } from "lucide-react";

interface TripActionsProps {
  id: string;
  isArchived: boolean;
}

export function TripActions({ id, isArchived }: TripActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function handleCopy() {
    setLoading("copy");
    await fetch(`/api/admin/trips/${id}/copy`, { method: "POST" });
    router.refresh();
    setLoading("");
  }

  async function handleArchive() {
    if (!confirm("Reise ins Archiv verschieben?")) return;
    setLoading("archive");
    await fetch(`/api/admin/trips/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading("");
  }

  async function handleRestore() {
    setLoading("restore");
    await fetch(`/api/admin/trips/${id}/restore`, { method: "POST" });
    router.refresh();
    setLoading("");
  }

  async function handlePermanentDelete() {
    if (!confirm("Reise und alle zugehörigen Anfragen endgültig löschen? Dies kann nicht rückgängig gemacht werden!")) return;
    setLoading("delete");
    await fetch(`/api/admin/trips/${id}/permanent-delete`, { method: "DELETE" });
    router.refresh();
    setLoading("");
  }

  if (isArchived) {
    return (
      <div className="flex gap-1 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRestore}
          disabled={loading === "restore"}
          title="Wiederherstellen"
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePermanentDelete}
          disabled={loading === "delete"}
          className="text-destructive hover:text-destructive"
          title="Endgültig löschen"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-1 justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        disabled={loading === "copy"}
        title="Kopieren"
      >
        <Copy className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleArchive}
        disabled={loading === "archive"}
        title="Archivieren"
      >
        <Archive className="size-4" />
      </Button>
    </div>
  );
}
