# CTI website

The public website for Connect, Trade and Invest (CTI). It's plain HTML, CSS and JavaScript, with no framework and no build step. Everything that gets deployed is in `site/`.

## Put it live on Vercel

The site and the contact form function (`api/contact.js`) deploy together. Deploying from GitHub is the easiest route, because every change you push goes live automatically.

### 1. Put the code on GitHub
1. Go to github.com and click **New repository**. Name it `cti-website` and set it to **Private**. Don't add a README.
2. On the new repo page, click **uploading an existing file**, drag in **everything inside** the unzipped `cti-website` folder (not the folder itself), and click **Commit changes**.
   - The `.cursor` folder is hidden. It doesn't matter if it gets left out.
   - Alternatively, use GitHub Desktop or `git push` if you're comfortable with those.

### 2. Import it into Vercel
1. In Vercel, click **Add New → Project** and connect your GitHub account if asked.
2. Pick `cti-website` and click **Import**.
3. Leave **Framework Preset** as "Other" and leave the build settings alone. `vercel.json` handles them.
4. Before clicking Deploy, open **Environment Variables** and add:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | your Resend API key (starts `re_`) |
| `CONTACT_TO_EMAIL` | `hello@ctinvestglobal.com` |
| `CONTACT_FROM_EMAIL` | `CTI <hello@ctinvestglobal.com>` |

5. Click **Deploy**. After about a minute you'll get an address like `cti-website.vercel.app`.

If you add or change an environment variable later, go to **Deployments → ⋯ → Redeploy** so it takes effect.

### 3. Test the form
1. Open the vercel.app address and submit the form using a personal Gmail or Outlook address.
2. Check:
   - The enquiry arrives at hello@ctinvestglobal.com in Zoho. Clicking Reply should address it to the person.
   - The confirmation arrives in the Gmail/Outlook inbox, not spam.
3. If something doesn't arrive, look in Vercel (**Project → Logs**) and Resend (**Logs**). Errors show up there.

### 4. Optional: lock the form to your own site
Once the real domain is connected, add one more environment variable and redeploy:
`ALLOWED_ORIGINS` = `https://ctinvestglobal.com,https://www.ctinvestglobal.com`
This makes the function refuse submissions sent from other websites.

## How the contact form works

`site/index.html` sends the form to `/api/contact`. The function in `api/contact.js`:
- checks every field again on the server, and silently drops anything that fills in the hidden spam trap
- emails the enquiry to `CONTACT_TO_EMAIL`, with reply-to set to the visitor
- sends the visitor a short branded confirmation from hello@ (it doesn't repeat their message back to them)
- if the confirmation fails but the enquiry was sent, the visitor still sees "Thank you"

The email wording is in `api/contact.js` (`internalEmail` and `confirmationEmail`). Resend's free plan allows 100 emails a day and 3,000 a month. Each enquiry uses 2.

## Connect the real domain later

1. In Vercel: **Project → Settings → Domains**, add the domain.
2. Vercel shows the DNS records to add. At IONOS, add **only** those records (usually an A record for `@` and a CNAME for `www`).
3. **Don't change the nameservers, and don't touch the MX, SPF, DKIM or DMARC records.** Those run the team's Zoho email.
4. Replace `https://cti-domain-placeholder.com` with the real domain in `site/index.html` (head section), `site/privacy.html`, `site/404.html`, `site/robots.txt` and `site/sitemap.xml`. If you edit the header or footer in `index.html`, re-run `python3 tools/make_pages.py` to copy them into the other two pages.
5. Afterwards, send a test email to and from a team address to confirm email still works.

## Before you share it publicly

Search the `site/` folder for `[` to find every placeholder:

- Registered company name, number and registered office (legally required)
- Privacy notice details: date, retention period, privacy contact
- Have a solicitor check the footer disclaimer and the investment wording
- Confirm the "How it works" steps match how the platform really works

## Files

| Path | What it is |
|------|-----------|
| `site/index.html` | The main page |
| `site/privacy.html`, `site/404.html` | Privacy notice and not-found page (built from index.html's header and footer by `tools/make_pages.py`) |
| `site/assets/css/styles.css` | All styles. Colours and type are tokens at the top. |
| `site/assets/js/main.js` | Menu, animations, form |
| `site/assets/img/` | Logo, share image |
| `api/contact.js` | Contact form function: sends both emails via Resend |
| `vercel.json` / `netlify.toml` | Hosting config and security headers |
| `docs/` | The brief and copy the site was built from |
| `tools/` | Small helper scripts (not deployed) |
