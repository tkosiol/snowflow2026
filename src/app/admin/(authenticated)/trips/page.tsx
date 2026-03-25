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
import { TripActions } from "@/components/admin/trip-actions";
import { TripBookingStatus } from "@/components/admin/trip-booking-status";
import type { BookingStatus } from "@/lib/validations";

export default async function AdminTripsPage() {
  const activeTrips = await prisma.trip.findMany({
    where: { status: { not: "ARCHIVED" } },
    include: { translations: true },
    orderBy: { departureDate: "desc" },
  });

  const archivedTrips = await prisma.trip.findMany({
    where: { status: "ARCHIVED" },
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
              <TableHead>Buchbarkeit</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTrips.map((trip) => {
              const deTranslation = trip.translations.find(
                (t) => t.locale === "de"
              );
              return (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/trips/${trip.id}`} className="hover:underline">
                      {deTranslation?.title ?? trip.slug}
                    </Link>
                  </TableCell>
                  <TableCell>{trip.destination}</TableCell>
                  <TableCell>
                    {new Date(trip.departureDate).toLocaleDateString("de-DE")} –{" "}
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
                  <TableCell>
                    <TripBookingStatus
                      id={trip.id}
                      initialStatus={trip.bookingStatus as BookingStatus}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" render={<Link href={`/admin/trips/${trip.id}`} />}>
                        Bearbeiten
                      </Button>
                      <TripActions id={trip.id} isArchived={false} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {activeTrips.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Noch keine Reisen vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {archivedTrips.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-12 mb-4 text-muted-foreground">Archiv</h2>
          <div className="bg-white rounded-lg border opacity-75">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Ziel</TableHead>
                  <TableHead>Zeitraum</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedTrips.map((trip) => {
                  const deTranslation = trip.translations.find(
                    (t) => t.locale === "de"
                  );
                  return (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {deTranslation?.title ?? trip.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{trip.destination}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(trip.departureDate).toLocaleDateString("de-DE")} –{" "}
                        {new Date(trip.returnDate).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <TripActions id={trip.id} isArchived={true} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
