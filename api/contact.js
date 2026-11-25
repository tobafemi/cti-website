// Vercel serverless function: receives the "Register your interest" form
// and emails it to the CTI inbox through Resend (https://resend.com).
//
// Environment variables (Vercel > Settings > Environment Variables):
//   RESEND_API_KEY      your Resend API key
//   CONTACT_TO_EMAIL    where enquiries go (defaults to hello@ctinvestglobal.com)
//   CONTACT_FROM_EMAIL  the sender, on a domain verified in Resend,
//                       e.g. CTI website <hello@ctinvestglobal.com>

const LIMITS = { name: 120, title: 120, organisation: 160, country: 80, email: 200, interest: 40, message: 2000 };
const INTERESTS = {
  updates: "Hearing about the platform as it launches",
  investor: "Investing (institution, family office or private equity)",
  "business-africa": "Raising investment for an African business",
  "business-uk": "Trading with or expanding into Africa (UK business)",
  partnership: "Partnering with CTI (chamber or trade body)",
  government: "Presenting a national project (government or agency)",
  deck: "Requesting the profile deck",
  media: "Media enquiry",
  other: "Something else"
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value, max) {
  if (typeof value !== "string") return "";
  // strip control characters, trim, cap length
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

module.exports = async function handler(req, res) {
  const isForm = (req.headers["content-type"] || "").includes("application/x-www-form-urlencoded");

  function reply(status, body) {
    // Visitors without JavaScript post the form directly; send them back to the page.
    if (isForm) {
      res.statusCode = 303;
      res.setHeader("Location", status === 200 ? "/?sent=1#contact" : "/?error=1#contact");
      return res.end();
    }
    return res.status(status).json(body);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const b = req.body || {};

  // Honeypot: bots fill this in. Pretend it worked and send nothing.
  if (b["bot-field"]) return reply(200, { ok: true });

  const data = {
    name: clean(b.name, LIMITS.name),
    title: clean(b.title, LIMITS.title),
    organisation: clean(b.organisation, LIMITS.organisation),
    country: clean(b.country, LIMITS.country),
    email: clean(b.email, LIMITS.email),
    interest: clean(b.interest, LIMITS.interest),
    message: clean(b.message, LIMITS.message),
    updates: b.updates === "yes"
  };

  if (!data.name || !EMAIL_RE.test(data.email) || !INTERESTS[data.interest]) {
    return reply(400, { ok: false, error: "Please check the required fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY is not set");
    return reply(500, { ok: false, error: "Server not configured" });
  }
  const to = process.env.CONTACT_TO_EMAIL || "hello@ctinvestglobal.com";
  const from = process.env.CONTACT_FROM_EMAIL || "CTI website <hello@ctinvestglobal.com>";

  const interestLabel = INTERESTS[data.interest];
  const text = [
    "New enquiry from the CTI website",
    "",
    "Name:           " + data.name,
    "Email:          " + data.email,
    "Job title:      " + (data.title || "-"),
    "Organisation:   " + (data.organisation || "-"),
    "Country:        " + (data.country || "-"),
    "Interested in:  " + interestLabel,
    "Launch updates: " + (data.updates ? "YES, opted in" : "No"),
    "Received:       " + new Date().toISOString(),
    "",
    "Message:",
    data.message || "(none)"
  ].join("\n");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: data.email,
        subject: "Website enquiry: " + interestLabel + " (" + data.name + ")",
        text: text
      })
    });
    if (!r.ok) {
      console.error("contact: Resend returned " + r.status + " " + (await r.text()).slice(0, 300));
      return reply(502, { ok: false, error: "Could not send" });
    }
    return reply(200, { ok: true });
  } catch (err) {
    console.error("contact: send failed", err && err.message);
    return reply(502, { ok: false, error: "Could not send" });
  }
};
