import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  CONTACTED: "Kontaktiert",
  PAID: "Bezahlt",
  CLOSED: "Geschlossen",
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tripId = request.nextUrl.searchParams.get("tripId");
  if (!tripId) {
    return NextResponse.json({ error: "tripId required" }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      translations: { where: { locale: "de" } },
      inquiries: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const tripTitle = trip.translations[0]?.title ?? trip.destination;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Snowflow";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Anfragen");

  // Title row
  sheet.mergeCells("A1:J1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = tripTitle;
  titleCell.font = { size: 16, bold: true, color: { argb: "FF0F1A37" } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 30;

  // Subtitle row
  sheet.mergeCells("A2:J2");
  const subtitleCell = sheet.getCell("A2");
  subtitleCell.value = `${formatDate(trip.departureDate)} – ${formatDate(trip.returnDate)} | ${trip.inquiries.length} Anfragen | Exportiert am ${formatDate(new Date())}`;
  subtitleCell.font = { size: 10, color: { argb: "FF6B7280" } };
  sheet.getRow(2).height = 20;

  // Empty row
  sheet.getRow(3).height = 8;

  // Header row
  const headers = [
    "Name",
    "E-Mail",
    "Telefon",
    "Geburtsdatum",
    "Adresse",
    "Personen",
    "Status",
    "Anmerkungen",
    "Notizen",
    "Datum",
  ];

  const headerRow = sheet.getRow(4);
  headers.forEach((header, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = header;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F1A37" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });
  headerRow.height = 28;

  // Data rows
  trip.inquiries.forEach((inquiry, index) => {
    const row = sheet.getRow(5 + index);
    const values = [
      `${inquiry.firstName} ${inquiry.lastName}`,
      inquiry.email,
      inquiry.phone,
      formatDate(inquiry.dateOfBirth),
      `${inquiry.street}, ${inquiry.postalCode} ${inquiry.city}`,
      inquiry.personCount,
      statusLabels[inquiry.status] ?? inquiry.status,
      inquiry.remarks || "",
      inquiry.notes || "",
      formatDate(inquiry.createdAt),
    ];

    values.forEach((value, i) => {
      const cell = row.getCell(i + 1);
      cell.value = value;
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFF3F4F6" } },
      };
    });

    // Alternate row coloring
    if (index % 2 === 1) {
      values.forEach((_, i) => {
        row.getCell(i + 1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      });
    }

    // Color-code status cell
    const statusCell = row.getCell(7);
    const statusColors: Record<string, string> = {
      NEW: "FFDBEAFE",
      CONTACTED: "FFFEF3C7",
      PAID: "FFD1FAE5",
      CLOSED: "FFF3F4F6",
    };
    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusColors[inquiry.status] ?? "FFFFFFFF" },
    };

    row.height = 22;
  });

  // Column widths
  const widths = [22, 28, 16, 14, 32, 10, 14, 30, 30, 14];
  widths.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  // Summary row
  const summaryRowIndex = 5 + trip.inquiries.length + 1;
  sheet.mergeCells(`A${summaryRowIndex}:E${summaryRowIndex}`);
  const summaryCell = sheet.getCell(`A${summaryRowIndex}`);
  const totalPersons = trip.inquiries.reduce((sum, i) => sum + i.personCount, 0);
  summaryCell.value = `Gesamt: ${trip.inquiries.length} Anfragen, ${totalPersons} Personen`;
  summaryCell.font = { bold: true, size: 10, color: { argb: "FF0F1A37" } };

  const buffer = await workbook.xlsx.writeBuffer();

  const safeTitle = tripTitle.replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "").replace(/\s+/g, "_");
  const filename = `Snowflow_Anfragen_${safeTitle}_${formatDate(new Date())}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
