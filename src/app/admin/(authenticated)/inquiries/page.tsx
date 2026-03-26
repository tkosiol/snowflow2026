import { prisma } from "@/lib/prisma";
import { InquiryTripGroup, type InquiryData } from "@/components/admin/inquiry-trip-group";

export default async function AdminInquiriesPage() {
  const trips = await prisma.trip.findMany({
    include: {
      translations: { where: { locale: "de" } },
      inquiries: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { departureDate: "desc" },
  });

  // Only show trips that have inquiries
  const tripsWithInquiries = trips.filter((t) => t.inquiries.length > 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Anfragen</h1>
      {tripsWithInquiries.length > 0 ? (
        <div className="space-y-4">
          {tripsWithInquiries.map((trip) => {
            const inquiries: InquiryData[] = trip.inquiries.map((i) => ({
              id: i.id,
              firstName: i.firstName,
              lastName: i.lastName,
              email: i.email,
              phone: i.phone,
              dateOfBirth: i.dateOfBirth,
              street: i.street,
              postalCode: i.postalCode,
              city: i.city,
              remarks: i.remarks,
              createdAt: i.createdAt.toISOString(),
              status: i.status,
              personCount: i.personCount,
              notes: i.notes,
            }));

            return (
              <InquiryTripGroup
                key={trip.id}
                tripId={trip.id}
                tripTitle={trip.translations[0]?.title ?? trip.destination}
                departureDate={trip.departureDate.toISOString()}
                returnDate={trip.returnDate.toISOString()}
                inquiries={inquiries}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg bg-white border p-8 text-center text-muted-foreground">
          Keine Anfragen vorhanden.
        </div>
      )}
    </div>
  );
}
