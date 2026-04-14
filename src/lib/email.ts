import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateEmail(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface PersonData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface BookingEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  tripTitle: string;
  departureDate: string;
  returnDate: string;
  persons: PersonData[];
  remarks: string;
}

export async function sendBookingNotification(data: BookingEmailData) {
  const personsRows = data.persons
    .map(
      (p, i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#45464d;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#0f1a37;font-weight:500;">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:14px;color:#45464d;">${escapeHtml(p.dateOfBirth ? formatDateEmail(p.dateOfBirth) : "-")}</td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f5f7;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#04102c 0%,#1a2542 100%);padding:28px 36px;">
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Neue Buchungsanfrage</h1>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">Snowflow Admin Benachrichtigung</p>
    </div>

    <div style="padding:32px 36px;">
      <!-- Trip Info -->
      <div style="background:#f0f4ff;border-radius:8px;padding:20px;margin:0 0 24px;border-left:4px solid #455d94;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">Reise</p>
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0f1a37;">${escapeHtml(data.tripTitle)}</p>
        <p style="margin:0;font-size:14px;color:#45464d;">
          ${formatDateEmail(data.departureDate)} &ndash; ${formatDateEmail(data.returnDate)}
        </p>
      </div>

      <!-- Contact -->
      <h3 style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">Ansprechpartner</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;width:120px;">Name</td>
          <td style="padding:6px 0;font-size:14px;color:#0f1a37;font-weight:500;">${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">E-Mail</td>
          <td style="padding:6px 0;font-size:14px;"><a href="mailto:${escapeHtml(data.email)}" style="color:#455d94;">${escapeHtml(data.email)}</a></td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Telefon</td>
          <td style="padding:6px 0;font-size:14px;color:#0f1a37;">${escapeHtml(data.phone)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#6b7280;">Adresse</td>
          <td style="padding:6px 0;font-size:14px;color:#0f1a37;">${escapeHtml(data.street)}, ${escapeHtml(data.postalCode)} ${escapeHtml(data.city)}</td>
        </tr>
      </table>

      <!-- Persons -->
      <h3 style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">Reiseteilnehmer (${data.persons.length})</h3>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr style="background:#f8f9fc;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">#</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Name</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #e5e7eb;">Geburtsdatum</th>
        </tr>
        ${personsRows}
      </table>

      ${data.remarks ? `
      <!-- Remarks -->
      <h3 style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">Anmerkungen</h3>
      <p style="margin:0;font-size:14px;color:#45464d;line-height:1.6;background:#f8f9fc;padding:12px 16px;border-radius:6px;">${escapeHtml(data.remarks)}</p>
      ` : ""}
    </div>

    <!-- Footer -->
    <div style="padding:16px 36px;background:#f8f9fc;border-top:1px solid #e8e9ee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        <a href="https://www.snowflow.de/admin/inquiries" style="color:#455d94;text-decoration:none;">Im Admin Panel ansehen</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || "noreply@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Anfrage: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} - ${escapeHtml(data.tripTitle)} (${data.persons.length} Pers.)`,
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
  persons: PersonData[];
  locale: "de" | "en";
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
    <div style="background:linear-gradient(135deg,#04102c 0%,#1a2542 100%);padding:32px 40px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Snowflow</h1>
      <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.6);">${de ? "Ski- & Snowboardreisen aus Berlin" : "Ski & Snowboard Trips from Berlin"}</p>
    </div>

    <div style="padding:36px 40px;">
      <p style="margin:0 0 20px;font-size:16px;color:#0f1a37;line-height:1.6;">
        Hey ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 24px;font-size:15px;color:#45464d;line-height:1.7;">
        ${de
          ? "vielen Dank für deine Anfrage! Wir haben sie erhalten und melden uns so schnell wie möglich bei dir."
          : "thank you for your inquiry! We have received it and will get back to you as soon as possible."
        }
      </p>

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
        ${data.persons.length > 0 ? `
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;">
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#455d94;">
            ${de ? "Reiseteilnehmer" : "Travelers"}
          </p>
          ${data.persons.map((p) => `<p style="margin:0 0 4px;font-size:14px;color:#0f1a37;">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</p>`).join("")}
        </div>
        ` : ""}
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

    <div style="padding:20px 40px;background:#f8f9fc;border-top:1px solid #e8e9ee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Snowflow &middot; Berlin &middot; <a href="https://www.snowflow.de" style="color:#455d94;text-decoration:none;">snowflow.de</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await getTransporter().sendMail({
    from,
    to: data.email,
    subject,
    html,
  });
}
