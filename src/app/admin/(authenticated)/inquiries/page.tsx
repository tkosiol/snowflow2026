import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.bookingInquiry.findMany({
    include: {
      trip: {
        include: { translations: { where: { locale: "de" } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Anfragen</h1>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Reise</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">
                  {inquiry.firstName} {inquiry.lastName}
                </TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell>
                  {inquiry.trip.translations[0]?.title ??
                    inquiry.trip.destination}
                </TableCell>
                <TableCell>
                  {new Date(inquiry.createdAt).toLocaleDateString("de-DE")}
                </TableCell>
                <TableCell>
                  <InquiryStatusSelect
                    id={inquiry.id}
                    currentStatus={inquiry.status}
                  />
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Keine Anfragen vorhanden.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
