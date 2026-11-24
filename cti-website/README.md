# CTI website (v2)

The CTI site is a single page, `site/index.html`, plus a privacy page and one serverless function, `api/contact.js`. The function sends the contact form emails. There's no build step.

## What changed in v2

These changes follow the team meeting and the CTI pitch deck.

- **Section order:** hero, the problem, the opportunity, what we do, why trust CTI, how we work with trade bodies, who we serve, platform, growth path, how it works, team, then register interest.
- **Strapline.** The hero positions CTI as a platform: "The trusted platform for UK–Africa trade and investment".
- **Charts.** The problem section compares infrastructure default rates by region. The opportunity section shows the infrastructure funding gap and Africa's working-age population. Every chart lists its source.
- **Trust.** "Trust is the currency of trade" covers three layers (visual proof, data rooms, upfront checks), followed by the five-step verification flow.
- **Partners.** "Built with chambers and trade bodies, for their members", with a "year-round trade mission" callout. No organisations are named.
- **Hero map.** The UK and Africa with connecting lines from London.
- **Calls to action.** Every section ends with one. On phones there's a sticky "Register" bar.
- **Video slot and platform preview.** Both are placeholders, ready for real content.
- **Colour options.** Three are available: A Light, B Hybrid and C Dark.

## Choosing the colour option

The theme is set on the first line of `site/index.html`:

```html
<html lang="en-GB" class="no-js" data-theme="b">
```

Change `b` to `a` or `c`. Do the same in `site/privacy.html`.

While the team is deciding, you can try any option on the live site:

- the A/B/C switcher shows at the bottom of every page, and remembers the last choice on that browser
- or link straight to an option with `?theme=a`, `?theme=b` or `?theme=c`

Once the option is chosen, set `SHOW_THEME_SWITCHER = false` in `site/assets/js/main.js`, set `data-theme` in both HTML files, and you can delete the small `?theme=` script in the `<head>`.

## Adding the intro video

Search `index.html` for `VIDEO:`. The comment there shows the exact `<video>` tag to use. Put the file at `site/assets/video/cti-intro.mp4` and a poster image at `site/assets/img/intro-poster.jpg`.

## Deploying (Vercel)

1. Upload everything inside this folder to the `cti-website` GitHub repo. Use the folder's contents, not the folder itself, and click **Commit changes**. If the repo already has files, replacing them all is fine.
2. Import the repo in Vercel and leave **Framework Preset** as "Other". `vercel.json` handles the rest.
3. Add these environment variables (Production and Preview):

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | your Resend key (starts `re_`) |
| `CONTACT_TO_EMAIL` | `hello@ctinvestglobal.com` |
| `CONTACT_FROM_EMAIL` | `CTI <hello@ctinvestglobal.com>` (keep the space) |

4. Deploy, then test the form with a personal Gmail address. Check two things: the enquiry lands in Zoho, and the confirmation lands in Gmail.
5. Once the real domain is connected, you can add `ALLOWED_ORIGINS` = `https://ctinvestglobal.com,https://www.ctinvestglobal.com`. This makes the form refuse submissions sent from other sites.

If you change an environment variable later, redeploy: **Deployments → ⋯ → Redeploy**.

## Team section (temporarily removed)

The leadership section is out of this version. To restore it, put back the Team section in `site/index.html`, add `site/assets/img/team/philip.webp`, and add the "Team" links in the header and footer of both pages.

## Still to fill in

- The company name, number and registered office in the footer of both pages, plus the same details in the privacy notice.
- The logo. The "CTI" badge is a placeholder.
- The intro video, and real platform screenshots when they exist.

## Files

| Path | What it is |
|------|------------|
| `site/index.html` | The page |
| `site/privacy.html` | Privacy notice |
| `site/assets/css/styles.css` | Styles; colour tokens and themes are at the top |
| `site/assets/js/main.js` | Menu, map, form, A/B/C switcher |
| `api/contact.js` | Form handler that sends both emails through Resend |
| `vercel.json` | Hosting config and security headers |
