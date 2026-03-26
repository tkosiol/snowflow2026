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

interface ConfirmationEmailData {
  firstName: string;
  email: string;
  tripTitle: string;
  departureDate: string;
  returnDate: string;
  personCount: number;
  locale: "de" | "en";
}

function formatDateEmail(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function sendBookingConfirmation(data: ConfirmationEmailData) {
  const de = data.locale === "de";
  const from = process.env.SMTP_FROM || "noreply@snowflow.de";

  const subject = de
    ? `Deine Anfrage bei Snowflow: ${escapeHtml(data.tripTitle)}`
    : `Your inquiry at Snowflow: ${escapeHtml(data.tripTitle)}`;

  const html = `
<!DOCTYPE html>
<html lang="${data.locale}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f5f7;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#04102c 0%,#1a2542 100%);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Snowflow</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">${de ? "Ski- & Snowboardreisen aus Berlin" : "Ski & Snowboard Trips from Berlin"}</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:16px;color:#0f1a37;line-height:1.6;">
        ${de ? `Hey ${escapeHtml(data.firstName)},` : `Hey ${escapeHtml(data.firstName)},`}
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#45464d;line-height:1.7;">
        ${de
          ? "vielen Dank für deine Anfrage! Wir haben sie erhalten und melden uns so schnell wie möglich bei dir."
          : "thank you for your inquiry! We have received it and will get back to you as soon as possible."
        }
      </p>

      <!-- Trip Card -->
      <div style="background:#f8f9fc;border-radius:8px;padding:24px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">
          ${de ? "Deine angefragte Reise" : "Your requested trip"}
        </p>
        <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f1a37;">
          ${escapeHtml(data.tripTitle)}
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#45464d;">
          <tr>
            <td style="padding:6px 0;font-weight:600;width:120px;">${de ? "Hinfahrt" : "Departure"}</td>
            <td style="padding:6px 0;">${formatDateEmail(data.departureDate)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">${de ? "Rückfahrt" : "Return"}</td>
            <td style="padding:6px 0;">${formatDateEmail(data.returnDate)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:600;">${de ? "Personen" : "Persons"}</td>
            <td style="padding:6px 0;">${data.personCount}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 8px;font-size:15px;color:#45464d;line-height:1.7;">
        ${de
          ? "Falls du Fragen hast, antworte einfach auf diese E-Mail oder schreib uns an <a href=\"mailto:info@snowflow.de\" style=\"color:#455d94;\">info@snowflow.de</a>."
          : "If you have any questions, simply reply to this email or write to <a href=\"mailto:info@snowflow.de\" style=\"color:#455d94;\">info@snowflow.de</a>."
        }
      </p>
      <p style="margin:24px 0 0;font-size:15px;color:#45464d;">
        ${de ? "Bis bald im Schnee!" : "See you on the slopes!"}
        <br>
        <strong style="color:#0f1a37;">${de ? "Dein Snowflow Team" : "Your Snowflow Team"}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;background:#f8f9fc;border-top:1px solid #e8e9ee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Snowflow &middot; Berlin &middot; <a href="https://www.snowflow.de" style="color:#455d94;text-decoration:none;">snowflow.de</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from,
    to: data.email,
    subject,
    html,
  });
}
