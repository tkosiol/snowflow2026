import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "info@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Buchungsanfrage: ${data.firstName} ${data.lastName} - ${data.tripTitle}`,
    html,
  });
}
