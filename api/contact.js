// Vercel serverless function: receives the "Register your interest" form
// and emails it to the CTI inbox through Zoho Mail.
//
// Needs these environment variables in Vercel (Settings > Environment Variables):
//   ZOHO_USER   the mailbox that sends, e.g. hello@ctinvestglobal.com
//   ZOHO_PASS   an app-specific password for that mailbox (not your login password)
//   ZOHO_HOST   smtp.zoho.eu (EU/UK accounts) or smtp.zoho.com
//   MAIL_TO     where enquiries go (optional, defaults to ZOHO_USER)

const nodemailer = require("nodemailer");

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
  // strip control characters (stops header injection), trim, cap length
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

  const user = process.env.ZOHO_USER;
  const pass = process.env.ZOHO_PASS;
  if (!user || !pass) {
    console.error("contact: ZOHO_USER or ZOHO_PASS is not set");
    return reply(500, { ok: false, error: "Server not configured" });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_HOST || "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: { user, pass }
  });

  const interestLabel = INTERESTS[data.interest];
  const lines = [
    "New enquiry from the CTI website",
    "",
    "Name:          " + data.name,
    "Email:         " + data.email,
    "Job title:     " + (data.title || "-"),
    "Organisation:  " + (data.organisation || "-"),
    "Country:       " + (data.country || "-"),
    "Interested in: " + interestLabel,
    "Launch updates: " + (data.updates ? "YES, opted in" : "No"),
    "Received:      " + new Date().toISOString(),
    "",
    "Message:",
    data.message || "(none)"
  ];

  try {
    await transporter.sendMail({
      from: '"CTI website" <' + user + ">",
      to: process.env.MAIL_TO || user,
      replyTo: { name: data.name, address: data.email },
      subject: "Website enquiry: " + interestLabel + " (" + data.name + ")",
      text: lines.join("\n")
    });
    return reply(200, { ok: true });
  } catch (err) {
    console.error("contact: send failed", err && err.message);
    return reply(502, { ok: false, error: "Could not send" });
  }
};
