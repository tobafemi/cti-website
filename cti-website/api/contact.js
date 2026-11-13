// Contact / register-interest form handler (Vercel serverless function).
// Sends two emails through Resend:
//   1. the enquiry to CONTACT_TO_EMAIL (reply-to is the visitor)
//   2. a short confirmation to the visitor
// Environment variables: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL,
// optional ALLOWED_ORIGINS (comma-separated, e.g. https://ctinvestglobal.com).

const INTERESTS = {
  updates: "Hearing about the platform as it launches",
  investor: "Investing",
  "business-africa": "Raising investment for an African business",
  "business-uk": "Trading with or expanding into Africa (UK business)",
  partnership: "Partnering with CTI (chamber or trade body)",
  government: "Presenting a national project",
  deck: "Requesting the profile deck",
  media: "Media enquiry",
  other: "Something else",
};

const LIMITS = { name: 120, title: 120, organisation: 160, country: 80, email: 200, message: 2000 };

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function clean(v, max) {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch { return {}; }
}

async function send(apiKey, payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}

function internalEmail(d) {
  const rows = [
    ["Name", d.name], ["Job title", d.title], ["Organisation", d.organisation],
    ["Country", d.country], ["Email", d.email], ["Interested in", INTERESTS[d.interest] || d.interest],
  ].filter(([, v]) => v);
  const html = `<div style="font-family:Arial,sans-serif;color:#0C1424;max-width:600px">
  <h2 style="margin:0 0 16px;font-size:20px">New website enquiry</h2>
  <table style="border-collapse:collapse;width:100%;font-size:14px">${rows.map(([k, v]) =>
    `<tr><td style="padding:8px 12px 8px 0;color:#5B6778;vertical-align:top;width:140px">${esc(k)}</td><td style="padding:8px 0">${esc(v)}</td></tr>`).join("")}</table>
  ${d.message ? `<h3 style="margin:24px 0 8px;font-size:15px">Message</h3><p style="white-space:pre-wrap;font-size:14px;line-height:1.6;margin:0">${esc(d.message)}</p>` : ""}
  <p style="margin-top:24px;font-size:12px;color:#8A96A8">Reply to this email to answer ${esc(d.name)} directly.</p></div>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n") + (d.message ? `\n\nMessage:\n${d.message}` : "");
  return { html, text };
}

function confirmationEmail(d) {
  const first = esc(d.name.split(/\s+/)[0]);
  const html = `<div style="background:#F5F6F8;padding:32px 16px;font-family:Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden">
    <div style="background:#0C1424;padding:20px 28px;border-bottom:3px solid #D4A13A">
      <span style="color:#fff;font-weight:bold;font-size:16px;letter-spacing:.5px">CTI</span>
      <span style="color:#B6C0CF;font-size:13px;margin-left:8px">Connect Trade and Invest</span>
    </div>
    <div style="padding:28px;color:#3D4A5C;font-size:15px;line-height:1.6">
      <p style="margin:0 0 16px;color:#0C1424">Dear ${first},</p>
      <p style="margin:0 0 16px">Thank you for getting in touch with CTI. We've received your details and a member of the team will reply within 2 to 3 working days.</p>
      <p style="margin:0 0 16px">If it's urgent, you can reply to this email.</p>
      <p style="margin:0">Kind regards,<br>The CTI team</p>
    </div>
  </div></div>`;
  const text = `Dear ${d.name.split(/\s+/)[0]},\n\nThank you for getting in touch with CTI. We've received your details and a member of the team will reply within 2 to 3 working days.\n\nIf it's urgent, you can reply to this email.\n\nKind regards,\nThe CTI team`;
  return { html, text };
}

module.exports = async function handler(req, res) {
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin || "";
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }
  if (allowed.length && origin && !allowed.includes(origin)) return res.status(403).json({ ok: false });

  const body = await readBody(req);
  // Spam trap: pretend it worked.
  if (body["bot-field"]) return res.status(200).json({ ok: true });

  const d = {};
  for (const [k, max] of Object.entries(LIMITS)) d[k] = clean(body[k], max);
  d.interest = clean(body.interest, 40);

  const errors = [];
  if (!d.name) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.push("email");
  if (!INTERESTS[d.interest]) errors.push("interest");
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error("Contact form: missing environment variables");
    return res.status(500).json({ ok: false });
  }

  const label = INTERESTS[d.interest];
  try {
    const inner = internalEmail(d);
    await send(RESEND_API_KEY, {
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: d.email,
      subject: `Website enquiry: ${label} (${d.name})`,
      html: inner.html,
      text: inner.text,
    });
  } catch (err) {
    console.error("Contact form: enquiry email failed", err);
    return res.status(502).json({ ok: false });
  }

  try {
    const conf = confirmationEmail(d);
    await send(RESEND_API_KEY, {
      from: CONTACT_FROM_EMAIL,
      to: [d.email],
      reply_to: CONTACT_TO_EMAIL,
      subject: "Thanks for contacting CTI",
      html: conf.html,
      text: conf.text,
    });
  } catch (err) {
    // The enquiry reached the team, so the visitor still sees "Thank you".
    console.error("Contact form: confirmation email failed", err);
  }

  return res.status(200).json({ ok: true });
};
