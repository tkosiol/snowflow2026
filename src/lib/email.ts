import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      <tr><td><strong>Name:</strong></td><td>${data.firstName} ${data.lastName}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
      <tr><td><strong>Telefon:</strong></td><td>${data.phone}</td></tr>
      <tr><td><strong>Geburtsdatum:</strong></td><td>${data.dateOfBirth}</td></tr>
      <tr><td><strong>Adresse:</strong></td><td>${data.street}, ${data.postalCode} ${data.city}</td></tr>
      <tr><td><strong>Reise:</strong></td><td>${data.tripTitle}</td></tr>
      <tr><td><strong>Anmerkungen:</strong></td><td>${data.remarks || "-"}</td></tr>
    </table>
  `;

  await resend.emails.send({
    from: process.env.SMTP_FROM || "noreply@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Buchungsanfrage: ${data.firstName} ${data.lastName} - ${data.tripTitle}`,
    html,
  });
}
