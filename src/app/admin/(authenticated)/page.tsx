import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [publishedTrips, totalInquiries, newInquiries] = await Promise.all([
    prisma.trip.count({ where: { status: "PUBLISHED" } }),
    prisma.bookingInquiry.count(),
    prisma.bookingInquiry.count({ where: { status: "NEW" } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Veröffentlichte Reisen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedTrips}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anfragen gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalInquiries}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Neue Anfragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{newInquiries}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
