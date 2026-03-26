import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface BookingEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  street: string;
  postalCode: string;
  city: string;
  tripTitle: string;
  remarks: string;
}

export async function sendBookingNotification(data: BookingEmailData) {
  const html = `
    <h2>Neue Buchungsanfrage</h2>
    <table>
      <tr><td><strong>Name:</strong></td><td>${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${escapeHtml(data.email)}</td></tr>
      <tr><td><strong>Telefon:</strong></td><td>${escapeHtml(data.phone)}</td></tr>
      <tr><td><strong>Geburtsdatum:</strong></td><td>${escapeHtml(data.dateOfBirth)}</td></tr>
      <tr><td><strong>Adresse:</strong></td><td>${escapeHtml(data.street)}, ${escapeHtml(data.postalCode)} ${escapeHtml(data.city)}</td></tr>
      <tr><td><strong>Reise:</strong></td><td>${escapeHtml(data.tripTitle)}</td></tr>
      <tr><td><strong>Anmerkungen:</strong></td><td>${escapeHtml(data.remarks || "-")}</td></tr>
    </table>
  `;

  await getResend().emails.send({
    from: process.env.SMTP_FROM || "noreply@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Buchungsanfrage: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} - ${escapeHtml(data.tripTitle)}`,
    html,
  });
}
