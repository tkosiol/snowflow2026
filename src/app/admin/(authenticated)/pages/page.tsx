import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const pageLabels: Record<string, string> = {
  about: "Über uns",
  impressum: "Impressum",
  privacy: "Datenschutz",
};

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Seiten</h1>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Übersetzungen</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-mono text-sm">{page.slug}</TableCell>
                <TableCell className="font-medium">
                  {pageLabels[page.slug] ?? page.slug}
                </TableCell>
                <TableCell>
                  {page.translations.map((t) => t.locale).join(", ") || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" render={<Link href={`/admin/pages/${page.id}`} />}>
                    Bearbeiten
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  Keine Seiten vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
