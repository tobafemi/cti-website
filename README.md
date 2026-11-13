# CTI website (v2)

The CTI site is a single page, `site/index.html`, plus a privacy page and one serverless function, `api/contact.js`. The function sends the contact form emails. There's no build step.

## What changed in v2

These changes follow the team meeting.

- **Strapline.** The hero now positions CTI as a platform: "The trusted platform for UK–Africa trade and investment". The old "From donor to strategic investor" line is gone.
- **Partners near the top.** A new "Built with chambers and trade bodies, for their members" section sits straight after the hero. It replaces the old "Designed to work within" band, which listed "Industry confederations" and read as if CTI partners with the CBI itself.
- **Trust.** The section is now "Trust is the product", with a five-step "How a business gets verified" flow: business checks, video evidence, CTI review, trade body review, then live with a CTI Verified badge.
- **Hero map.** The hero shows the UK and Africa with connecting lines from London, replacing the code grid. Countries light up in turn, and hovering or tapping a country shows its name.
- **Video slot.** "What we do" now has a slot for the 40-second intro film, labelled "Coming soon".
- **Platform preview.** An illustrated platform screen is built in HTML, based on Philip's concept and the Kenya demo data. It's labelled as an example, and there are no partner logos.
- **Register interest.** The call to action is now "Register interest" / "Join us as we build". The form has a "Hearing about the platform as it launches" option, and Organisation is now optional.
- **Colour options.** There are three colour options: A Light, B Hybrid and C Dark.

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
