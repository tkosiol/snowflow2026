import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminTripsPage() {
  const trips = await prisma.trip.findMany({
    include: { translations: true },
    orderBy: { departureDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reisen</h1>
        <Button render={<Link href="/admin/trips/new" />}>
          Neue Reise
        </Button>
      </div>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titel</TableHead>
              <TableHead>Ziel</TableHead>
              <TableHead>Zeitraum</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => {
              const deTranslation = trip.translations.find(
                (t) => t.locale === "de"
              );
              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {deTranslation?.title ?? trip.slug}
                  </TableCell>
                  <TableCell>{trip.destination}</TableCell>
                  <TableCell>
                    {new Date(trip.departureDate).toLocaleDateString("de-DE")} -{" "}
                    {new Date(trip.returnDate).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trip.status === "PUBLISHED" ? "default" : "secondary"
                      }
                    >
                      {trip.status === "PUBLISHED"
                        ? "Veröffentlicht"
                        : "Entwurf"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" render={<Link href={`/admin/trips/${trip.id}`} />}>
                      Bearbeiten
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {trips.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Noch keine Reisen vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
