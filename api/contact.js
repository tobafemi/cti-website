/**
 * POST /api/contact
 * Receives the website contact form and sends two emails through Resend:
 *   1. the enquiry to the CTI inbox (reply-to set to the visitor)
 *   2. a short confirmation to the visitor
 *
 * Environment variables (Vercel > Project > Settings > Environment Variables):
 *   RESEND_API_KEY     required  Resend API key with sending access
 *   CONTACT_TO_EMAIL   optional  where enquiries go (default hello@ctinvestglobal.com)
 *   CONTACT_FROM_EMAIL optional  sender (default "CTI <hello@ctinvestglobal.com>")
 *   ALLOWED_ORIGINS    optional  comma-separated list, e.g. https://ctinvestglobal.com,https://www.ctinvestglobal.com
 */

const INTERESTS = {
  government: "Presenting a national project (government or agency)",
  investor: "Investing (institution, family office or private equity)",
  "business-africa": "Raising investment for an African business",
  "business-uk": "Trading with or expanding into Africa (UK business)",
  partnership: "Partnering with CTI (chamber or trade body)",
  deck: "Requesting the private profile deck",
  media: "Media enquiry",
  other: "Something else",
};

const LIMITS = { name: 120, title: 120, organisation: 160, country: 80, email: 200, message: 2000 };
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;

function clean(value, max) {
  if (typeof value !== "string") return "";
  // Strip control characters (incl. line breaks in single-line fields) and trim.
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
function oneLine(value) { return value.replace(/[\r\n]+/g, " "); }
function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function validate(body) {
  const f = {
    name: oneLine(clean(body.name, LIMITS.name)),
    title: oneLine(clean(body.title, LIMITS.title)),
    organisation: oneLine(clean(body.organisation, LIMITS.organisation)),
    country: oneLine(clean(body.country, LIMITS.country)),
    email: oneLine(clean(body.email, LIMITS.email)),
    interest: clean(body.interest, 40),
    message: typeof body.message === "string" ? body.message.trim() : "",
  };
  const errors = {};
  if (!f.name) errors.name = "Enter your full name";
  if (!f.organisation) errors.organisation = "Enter your organisation";
  if (!f.email) errors.email = "Enter your email address";
  else if (!EMAIL_RE.test(f.email)) errors.email = "Enter an email address like name@company.com";
  if (!INTERESTS[f.interest]) errors.interest = "Choose what you're interested in";
  if (f.message.length > LIMITS.message) errors.message = "Keep your message under 2,000 characters";
  f.message = clean(f.message, LIMITS.message);
  return { fields: f, errors };
}

/* ---------- Email templates ---------- */
function layout(inner) {
  return `<!doctype html><html lang="en-GB"><body style="margin:0;padding:0;background:#F6F7F9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F9;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
<tr><td style="background:#0C1424;padding:20px 28px;border-bottom:3px solid #D4A13A;">
<span style="display:inline-block;border:1px solid #D4A13A;border-radius:4px;padding:4px 8px;color:#FFFFFF;font-weight:bold;font-size:14px;letter-spacing:1px;">CTI</span>
<span style="color:#FFFFFF;font-size:14px;padding-left:10px;">Connect, Trade and Invest</span>
</td></tr>
<tr><td style="padding:28px;color:#3D4A5C;font-size:15px;line-height:1.6;">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

function internalEmail(f) {
  const rows = [
    ["Name", f.name], ["Job title", f.title || "Not given"], ["Organisation", f.organisation],
    ["Email", f.email], ["Country", f.country || "Not given"], ["Interested in", INTERESTS[f.interest]],
  ];
  const table = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 16px 6px 0;color:#5B6778;white-space:nowrap;vertical-align:top;">${k}</td><td style="padding:6px 0;color:#0C1424;">${esc(v)}</td></tr>`
  ).join("");
  const msg = f.message
    ? `<p style="margin:20px 0 6px;color:#5B6778;">Message</p><div style="padding:14px 16px;background:#F6F7F9;border-radius:6px;color:#0C1424;white-space:pre-wrap;">${esc(f.message)}</div>`
    : `<p style="margin:20px 0 0;color:#5B6778;">No message was included.</p>`;
  const html = layout(
    `<p style="margin:0 0 16px;font-size:18px;color:#0C1424;font-weight:bold;">New website enquiry</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;">${table}</table>${msg}
     <p style="margin:24px 0 0;font-size:13px;color:#5B6778;">Reply to this email to respond to ${esc(f.name)} directly. They've been sent a confirmation saying we'll reply within 2 to 3 working days.</p>`
  );
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nMessage:\n${f.message || "No message was included."}\n\nReply to this email to respond directly.`;
  return { html, text };
}

function confirmationEmail(f) {
  const first = f.name.split(/\s+/)[0];
  const html = layout(
    `<p style="margin:0 0 16px;">Hello ${esc(first)},</p>
     <p style="margin:0 0 16px;">Thank you for getting in touch with Connect, Trade and Invest. We've received your enquiry and a member of the team will reply within 2 to 3 working days.</p>
     <p style="margin:0 0 16px;">If there's anything you'd like to add in the meantime, just reply to this email.</p>
     <p style="margin:0;">Kind regards,<br>The CTI team<br><a href="mailto:hello@ctinvestglobal.com" style="color:#0C1424;">hello@ctinvestglobal.com</a></p>
     <p style="margin:28px 0 0;padding-top:16px;border-top:1px solid #E2E8F0;font-size:12px;color:#5B6778;">You're receiving this because you submitted the contact form at ctinvestglobal.com. We'll only use your details to respond to your enquiry. <a href="https://ctinvestglobal.com/privacy.html" style="color:#5B6778;">Privacy notice</a></p>`
  );
  const text = `Hello ${first},

Thank you for getting in touch with Connect, Trade and Invest. We've received your enquiry and a member of the team will reply within 2 to 3 working days.

If there's anything you'd like to add in the meantime, just reply to this email.

Kind regards,
The CTI team
hello@ctinvestglobal.com

You're receiving this because you submitted the contact form at ctinvestglobal.com. We'll only use your details to respond to your enquiry. Privacy notice: https://ctinvestglobal.com/privacy.html`;
  return { html, text };
}

async function sendEmail(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

/* ---------- Handler ---------- */
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin || "";
  if (allowed.length && origin && !allowed.includes(origin)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return res.status(500).json({ ok: false, error: "Email is not configured" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body && typeof body === "object" ? body : {};

  // Honeypot: bots fill this in. Pretend it worked and send nothing.
  if (body["bot-field"]) return res.status(200).json({ ok: true });

  const { fields, errors } = validate(body);
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const to = process.env.CONTACT_TO_EMAIL || "hello@ctinvestglobal.com";
  const from = process.env.CONTACT_FROM_EMAIL || "CTI <hello@ctinvestglobal.com>";
  const internal = internalEmail(fields);
  const confirm = confirmationEmail(fields);

  try {
    await sendEmail({
      from,
      to: [to],
      reply_to: fields.email,
      subject: `New enquiry: ${INTERESTS[fields.interest]} (${fields.name}, ${fields.organisation})`,
      html: internal.html,
      text: internal.text,
    });
  } catch (err) {
    console.error("Enquiry email failed:", err.message);
    return res.status(502).json({ ok: false, error: "Could not send" });
  }

  // The enquiry has reached CTI, so a failed confirmation shouldn't show the visitor an error.
  try {
    await sendEmail({
      from,
      to: [fields.email],
      reply_to: to,
      subject: "Thanks for contacting CTI",
      html: confirm.html,
      text: confirm.text,
    });
  } catch (err) {
    console.error("Confirmation email failed:", err.message);
  }

  return res.status(200).json({ ok: true });
};

// Exported for testing only.
module.exports._internal = { validate, internalEmail, confirmationEmail };
