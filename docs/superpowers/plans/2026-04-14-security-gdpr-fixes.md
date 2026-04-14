# Security & GDPR Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the public booking endpoint against spam/bots, switch email from Resend to nodemailer/SMTP, and satisfy Art. 13 DSGVO on the booking form.

**Architecture:** Rate limiting and honeypot live in the booking API route (module-level Map for rate state, no extra dependency). Email is a drop-in swap in `src/lib/email.ts` — nodemailer is already installed. GDPR notice is a small addition to the booking form component and i18n message files. Privacy policy is a direct JSX edit.

**Tech Stack:** Next.js 16 App Router, nodemailer (already installed), next-intl (existing i18n), no new dependencies required.

---

### Task 1: Rate limiting on POST /api/booking

**Goal:** Reject more than 5 submissions from the same IP per hour with HTTP 429.

**Files:**
- Modify: `src/app/api/booking/route.ts`

**Acceptance Criteria:**
- [ ] A single IP submitting 6+ times within an hour gets a 429 response
- [ ] The 6th attempt does NOT create a DB record or send an email
- [ ] A first-time IP succeeds normally
- [ ] After the rate window resets (simulated by manipulating time), submissions succeed again

**Verify:** `npm run build` — no TypeScript errors

**Steps:**

- [ ] **Step 1: Add rate-limit state and helper at the top of the route file**

Open `src/app/api/booking/route.ts`. Add this block directly after the imports, before the `POST` function:

```typescript
const ipRequests = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}
```

- [ ] **Step 2: Extract the IP and apply the check at the top of the POST handler**

At the very start of the `POST` function body, before `const body = await request.json()`, add:

```typescript
const forwarded = request.headers.get("x-forwarded-for");
const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

if (isRateLimited(ip)) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/booking/route.ts
git commit -m "feat: add IP-based rate limiting to booking API (5 req/hr)"
```

---

### Task 2: Honeypot field on booking form

**Goal:** Silently reject bot submissions that fill a hidden form field, without telling the bot it was blocked.

**Files:**
- Modify: `src/components/booking/booking-form.tsx`
- Modify: `src/app/api/booking/route.ts`

**Acceptance Criteria:**
- [ ] A submission with `website` field populated returns `{ success: true }` (HTTP 200) but saves nothing to DB
- [ ] A normal submission (empty `website`) proceeds as before
- [ ] The hidden field is not visible or focusable by keyboard users

**Verify:** `npm run build` — no TypeScript errors

**Steps:**

- [ ] **Step 1: Add honeypot state to the form component**

In `src/components/booking/booking-form.tsx`, add one new state variable after the existing state declarations (around line 73):

```typescript
const [honeypot, setHoneypot] = useState("");
```

- [ ] **Step 2: Add the hidden input to the JSX**

Inside the `<form>` element, add this block right after the opening `<form>` tag (before the `{submitError && ...}` block):

```tsx
{/* Honeypot — hidden from humans, filled by bots */}
<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
  style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
/>
```

- [ ] **Step 3: Include honeypot in the fetch payload**

In the `handleSubmit` function, find where `body: JSON.stringify(result.data)` is called and change it to include the honeypot:

```typescript
body: JSON.stringify({ ...result.data, website: honeypot }),
```

- [ ] **Step 4: Check honeypot in the API route before parsing**

In `src/app/api/booking/route.ts`, after `const body = await request.json()` and before `const data = bookingSchema.parse(body)`, add:

```typescript
// Honeypot check — bots fill this, humans don't
if (body.website) {
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/components/booking/booking-form.tsx src/app/api/booking/route.ts
git commit -m "feat: add honeypot field to booking form for bot detection"
```

---

### Task 3: Switch email from Resend to nodemailer/SMTP

**Goal:** Replace the Resend SDK with nodemailer so email works with Netcup SMTP — no new packages needed (nodemailer + @types/nodemailer are already in package.json).

**Files:**
- Modify: `src/lib/email.ts`

**Acceptance Criteria:**
- [ ] `email.ts` has no import from `resend`
- [ ] `sendBookingNotification` and `sendBookingConfirmation` use nodemailer's `transporter.sendMail()`
- [ ] The transporter reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` from env
- [ ] `npm run build` passes

**Verify:** `npm run build` — no TypeScript errors

**Steps:**

- [ ] **Step 1: Replace the entire top of email.ts**

Replace lines 1–3 of `src/lib/email.ts` (the Resend import and `getResend` function):

```typescript
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
```

- [ ] **Step 2: Replace the send call in sendBookingNotification**

Find this block near the end of `sendBookingNotification` (around line 129):

```typescript
  await getResend().emails.send({
    from: process.env.SMTP_FROM || "noreply@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Anfrage: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} - ${escapeHtml(data.tripTitle)} (${data.persons.length} Pers.)`,
    html,
  });
```

Replace with:

```typescript
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || "noreply@snowflow.de",
    to: process.env.CONTACT_EMAIL || "info@snowflow.de",
    subject: `Neue Anfrage: ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)} - ${escapeHtml(data.tripTitle)} (${data.persons.length} Pers.)`,
    html,
  });
```

- [ ] **Step 3: Replace the send call in sendBookingConfirmation**

Find this block near the end of `sendBookingConfirmation` (around line 231):

```typescript
  await getResend().emails.send({
    from,
    to: data.email,
    subject,
    html,
  });
```

Replace with:

```typescript
  await getTransporter().sendMail({
    from,
    to: data.email,
    subject,
    html,
  });
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: switch email from Resend to nodemailer SMTP"
```

---

### Task 4: Privacy notice on booking form (Art. 13 DSGVO)

**Goal:** Add a short privacy notice below the submit button linking to the Datenschutzerklärung, as required by Art. 13 DSGVO.

**Files:**
- Modify: `src/components/booking/booking-form.tsx`
- Modify: `src/messages/de.json`
- Modify: `src/messages/en.json`

**Acceptance Criteria:**
- [ ] A privacy notice is visible below the submit button in both DE and EN
- [ ] The notice links to `/{locale}/privacy`
- [ ] Text is translated via next-intl (not hardcoded)
- [ ] `npm run build` passes

**Verify:** `npm run build` — no TypeScript errors

**Steps:**

- [ ] **Step 1: Add translation keys to de.json**

Open `src/messages/de.json`. In the `"booking"` object, add after `"newInquiry"`:

```json
"privacyNotice": "Mit dem Absenden stimmst du der Verarbeitung deiner Daten gemäß unserer {link} zu.",
"privacyLinkText": "Datenschutzerklärung"
```

- [ ] **Step 2: Add translation keys to en.json**

Open `src/messages/en.json`. In the `"booking"` object, add the same keys:

```json
"privacyNotice": "By submitting, you agree to the processing of your data in accordance with our {link}.",
"privacyLinkText": "Privacy Policy"
```

- [ ] **Step 3: Add the notice JSX to the booking form**

In `src/components/booking/booking-form.tsx`, add `Link` from `next/link` to the imports at the top:

```typescript
import Link from "next/link";
```

Then find the `{/* Submit */}` block and add the notice directly after the `<Button>`:

```tsx
{/* Submit */}
<Button type="submit" className="w-full hover:bg-primary/80 transition-colors" disabled={submitting}>
  {submitting ? t("submitting") : t("submit")}
</Button>

<p className="text-center text-xs text-muted-foreground">
  {t.rich("privacyNotice", {
    link: (chunks) => (
      <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
        {chunks}
      </Link>
    ),
  })}
</p>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/components/booking/booking-form.tsx src/messages/de.json src/messages/en.json
git commit -m "feat: add Art. 13 DSGVO privacy notice to booking form"
```

---

### Task 5: Update privacy policy — remove Resend, fix section 3

**Goal:** Replace the "Resend Inc., USA" section in the privacy policy with Netcup own mail server, and remind about the unfilled controller placeholder.

**Files:**
- Modify: `src/app/[locale]/privacy/page.tsx`

**Acceptance Criteria:**
- [ ] Section 3 no longer mentions Resend or USA data transfer
- [ ] Section 3 states email is sent via Netcup mail server (Germany)
- [ ] Section 1 has a visible `TODO` comment so the placeholder is easy to find
- [ ] `npm run build` passes

**Verify:** `npm run build` — no TypeScript errors

**Steps:**

- [ ] **Step 1: Add TODO comment on controller placeholder in section 1**

In `src/app/[locale]/privacy/page.tsx`, find the section 1 block that contains the placeholder lines. Add a comment above the `<p>` tag:

```tsx
{/* TODO: Fill in real name and address before going live */}
<p>
  Snowflow<br />
  [Vor- und Nachname des Verantwortlichen]<br />
  [Straße und Hausnummer]<br />
  [PLZ Ort]<br />
  E-Mail: info@snowflow.de
</p>
```

- [ ] **Step 2: Replace section 3 body (DE)**

Find the German paragraph in section 3 that says:

```
"Bei Eingang einer Buchungsanfrage wird eine Benachrichtigung per E-Mail an uns gesendet. Dazu werden deine Anfragedaten über den E-Mail-Dienst Resend (Resend Inc., USA) übermittelt."
```

Replace with:

```
"Bei Eingang einer Buchungsanfrage wird eine Benachrichtigung per E-Mail an uns gesendet. Der E-Mail-Versand erfolgt über unseren eigenen Mailserver, der bei der Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Deutschland gehostet wird. Es findet keine Datenübermittlung in Drittländer statt."
```

- [ ] **Step 3: Replace section 3 body (EN)**

Find the English paragraph that says:

```
"When a booking inquiry is received, a notification is sent to us via email. Your inquiry data is transmitted via the email service Resend (Resend Inc., USA)."
```

Replace with:

```
"When a booking inquiry is received, a notification is sent to us via email. Email delivery is handled via our own mail server hosted at Netcup GmbH, Daimlerstraße 25, 76185 Karlsruhe, Germany. No data is transferred to third countries."
```

- [ ] **Step 4: Update section 3 heading and legal basis to match**

The section 3 heading says "E-Mail-Benachrichtigungen" / "Email Notifications" — this is still accurate, no change needed.

The legal basis paragraph (Art. 6(1)(f)) is still accurate for sending notifications — no change needed.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0, no TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/privacy/page.tsx
git commit -m "fix: update privacy policy — replace Resend with Netcup SMTP, add controller TODO"
```

---

## After all tasks

- Fill in the controller details in section 1 of the privacy policy manually (name, street, postal code, city of the responsible person)
- Test email delivery end-to-end by submitting a booking with real Netcup SMTP credentials in `.env.local`
- Mark `Configure real SMTP credentials` as done in `STATUS.md` once tested
