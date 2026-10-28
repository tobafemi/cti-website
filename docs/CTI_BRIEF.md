# CTI website: project brief

This is the source of truth for the CTI website build. Read it in full before writing code. Page copy is in `docs/CTI_COPY.md`. Where the two disagree, the copy file wins on wording and this file wins on everything else.

---

## 1. What we are building

A single-page website for **Connect, Trade and Invest (CTI)**, plus a privacy notice page and a 404 page.

CTI is a UK–Africa trade and investment platform. It connects UK investors and businesses with verified opportunities across Africa's 54 countries, using short verified videos instead of long paper prospectuses.

The page has two jobs:

1. Explain CTI clearly to anyone who lands on it, whatever their background.
2. Make it easy for each type of stakeholder to get in touch.

Detailed deal information is **not** on the site. It is shared privately after someone gets in touch.

## 2. Audience

The page is for every stakeholder who wants to learn about or engage with CTI:

- UK government bodies and agencies
- African governments, ministries, development banks and investment promotion agencies
- Institutional investors, family offices, private equity, sovereign wealth funds
- African SMEs looking for investment or UK buyers
- UK businesses looking to trade with or expand into Africa
- Chambers of commerce, trade bodies and industry confederations
- Media, potential hires and anyone curious

**Implication:** plain business English throughout. The formal sovereign and ministerial language belongs only in the G2G part of the Platform section. Someone with no finance background should understand what CTI does from the hero alone.

## 3. Positioning and tone

- Core line: **"From donor to strategic investor."**
- Tone: confident, credible, clear, forward-looking. Institutional but welcoming.
- UK English spelling everywhere (organisation, decentralised, rigour, programme).
- No hype or superlatives we can't prove ("premier", "leading", "revolutionary", "world-class").
- No unproven performance claims (for example "due diligence in days").
- Do not write as if live deal flow already exists if the platform is still in demo stage.
- Avoid jargon and invented terms. Write short, direct sentences.

## 4. Things we must NOT do

- **No partner logos or names** of any organisation (CBI, BCC, LSE, UKEF, BII, AfCFTA Secretariat, any government) unless CTI has a written agreement allowing it. The alignment band uses generic descriptions only.
- **Don't use "British Standard"** as a heading or badge. It is closely associated with BSI certification. Use "UK governance" / "City of London rigour".
- **Don't use military wording** ("war rooms"). Use "secure deal rooms".
- **Don't use flag colours** (green/yellow/red) to signal "Africa".
- **No stock photos** of handshakes, globes or city skylines.
- **No cookie-setting third-party scripts** (no Google Analytics, no Facebook pixel). That keeps us free of a cookie banner.
- **No Google Fonts link.** Self-host the font (see section 8).

## 5. Page structure

One page with anchored sections, in this order. IDs are fixed so the navigation and buttons can link to them.

| # | Section | ID | Background |
|---|---------|----|-----------|
| 1 | Header / navigation | `header` | White, sticky |
| 2 | Hero | `top` | **Navy** |
| 3 | What CTI does | `about` | White |
| 4 | Why it matters | `why` | Light surface |
| 5 | How we build trust (three principles) | `principles` | White |
| 6 | Who we work with | `who` | Light surface |
| 7 | How it works | `how` | White |
| 8 | The platform (G2G and B2B tiers) | `platform` | Light surface |
| 9 | Alignment band | `alignment` | White, thin band with top and bottom borders |
| 10 | Team | `team` | White |
| 11 | Get in touch (form) | `contact` | **Navy** |
| 12 | Footer | `footer` | **Deep navy** |

Navigation links: About (`#about`), Who we work with (`#who`), Platform (`#platform`), Team (`#team`). Primary button: **Get in touch** (`#contact`).

On mobile (< 960px) the links collapse into a menu button. The "Get in touch" button stays visible.

### Section notes

- **Hero:** left-aligned text, not centred. On the right (below on mobile), the hero visual. If CTI has real footage, use a still from it. If not, use the **54-country grid** (section 7.4). Size the hero to its content. No full-viewport-height hero.
- **What CTI does:** intro paragraph plus three short points: Find / See / Connect. Not numbered, because they aren't a sequence.
- **Why it matters:** narrative on the left, three figures on the right (54 countries, 1.3bn+ people, ~$3.4tn combined GDP), with a source line underneath.
- **Principles:** three columns. Each has a title, a short tagline, and one paragraph. Not numbered.
- **Who we work with:** four cards. Each card's button scrolls to the contact form **and preselects the matching option** in the "I'm interested in" dropdown.
- **How it works:** two tracks side by side (Investors / Businesses), three numbered steps each. Numbering is fine here because these steps are a real sequence.
- **Platform:** two equal cards: Sovereign tier (G2G) and Commercial tier (B2B). Each card has a label, short intro, three features, and a sectors line.
- **Alignment band:** a small heading "Designed to work within" and four items in a row with a small gold marker. Text only, no logos.
- **Team:** cards with photo, name, role, one-line background and a LinkedIn link. Three or four per row on desktop. Use placeholders until we have real details. If no photos are available, use initials in a navy circle rather than a stock avatar.
- **Contact:** intro text and contact email on the left, form on the right. Stacked on mobile.
- **Footer:** logo and one-liner, links, contact email, LinkedIn, then the legal block (company details and disclaimer) and copyright.

## 6. Design direction

**Modern and clean:** a mostly light page with lots of white space, navy giving structure, and warm gold used sparingly as an accent. Restraint is the point. Clean design is mostly about what you leave out.

- Light page (white and very light grey). Navy is used for the hero, the contact band and the footer only.
- Gold is an accent: thin rules, small labels on navy, icons, the primary button on navy, and markers. **Never use gold for body text on white.**
- Left-aligned layouts. Don't centre everything.
- No gradients, glows, glassmorphism, busy patterns or parallax.
- Subtle borders rather than heavy shadows. A card gets a 1px border and maybe a very soft shadow on hover, nothing more.
- Small radius: 6px on buttons and inputs, 10px on cards.
- Motion: one gentle fade-up of sections as they enter (300ms), buttons with a quick hover state. Content must be **visible by default** if JS fails, so never leave anything at `opacity: 0` waiting for JS. Respect `prefers-reduced-motion`.

## 7. Design system

### 7.1 Colour tokens

All contrast ratios below have been checked against WCAG AA.

```css
:root {
  /* Navy (structure) */
  --navy-900: #070B14;   /* footer */
  --navy-800: #0C1424;   /* primary navy: hero, contact band, headings, primary button on light */
  --navy-700: #142036;   /* raised surfaces on navy: form inputs, cards on navy */

  /* Warm gold (accent, use sparingly) */
  --gold-500: #D4A13A;   /* buttons on navy, rules, markers, icons */
  --gold-300: #E9C46A;   /* small text/labels on navy (11:1 on navy-800) */
  --gold-700: #8A6418;   /* the ONLY gold allowed as text on white (5.4:1) */

  /* Light neutrals */
  --white:    #FFFFFF;   /* page background */
  --surface:  #F6F7F9;   /* alternate section background */
  --border:   #E2E8F0;   /* hairlines, card borders, input borders on light */

  /* Text on light */
  --ink:      #0C1424;   /* headings (18.4:1) */
  --body:     #3D4A5C;   /* body text (9.0:1) */
  --muted:    #5B6778;   /* captions, helper text (5.7:1 on white, 5.4:1 on surface) */

  /* Text on navy */
  --on-navy:        #FFFFFF;
  --on-navy-body:   #B6C0CF;  /* body text on navy (10:1) */
  --on-navy-muted:  #8A96A8;  /* captions on navy (6.1:1) */
  --navy-border:    rgba(255,255,255,0.12);

  /* Feedback */
  --success: #1F7A4D;
  --error:   #B42318;
}
```

Usage rules:

- Primary button **on light**: navy-800 background, white text. Hover: navy-700.
- Primary button **on navy**: gold-500 background, navy-800 text (7.85:1). Hover: gold-300.
- Secondary button: transparent with 1px border (`--border` on light, `--navy-border` on navy), text in `--ink` or `--on-navy`.
- Eyebrow labels: uppercase, letter-spacing 0.08em, 0.75rem, weight 600. `--gold-700` on light, `--gold-300` on navy.
- Links in body text: `--ink` with an underline in `--gold-500`, 2px, offset 3px.

### 7.2 Typography

- **One typeface: Lexend** (variable, weights 400, 500, 600). Self-hosted.
- Fallback stack: `"Lexend", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`.
- Body: 1.0625rem (17px), line-height 1.65, colour `--body`.
- Max line length for running text: 65ch.
- Headings use `text-wrap: balance`, colour `--ink` (or white on navy), weight 600, tight letter-spacing (-0.01em to -0.02em).

Type scale (fluid with `clamp()`):

| Token | Use | Size |
|-------|-----|------|
| `--fs-display` | Hero H1 | `clamp(2.5rem, 1.6rem + 4vw, 4.25rem)`, line-height 1.05 |
| `--fs-h2` | Section headings | `clamp(1.875rem, 1.4rem + 2vw, 2.75rem)`, line-height 1.15 |
| `--fs-h3` | Card titles | `1.25rem`, line-height 1.3 |
| `--fs-lead` | Intro paragraphs, hero subline | `clamp(1.125rem, 1rem + 0.5vw, 1.3125rem)`, line-height 1.55 |
| `--fs-body` | Body | `1.0625rem` |
| `--fs-small` | Captions, helper text, legal | `0.875rem` |
| `--fs-eyebrow` | Eyebrows / tags | `0.75rem`, uppercase |
| `--fs-figure` | Big figures in "Why it matters" | `clamp(2.25rem, 1.8rem + 2vw, 3rem)`, weight 500, tabular numbers |

### 7.3 Layout and spacing

- Container: max-width 1200px, centred, side padding `max(20px, env(safe-area-inset-left))` / right equivalent.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
- Section vertical padding: 96px desktop, 64px mobile.
- Breakpoints: 640px, 960px, 1200px. Mobile-first.
- Use CSS Grid/Flexbox with `gap`, not margins between siblings.
- Grids: principles 3 columns → 1; who 4 → 2 → 1; how 2 → 1; platform 2 → 1; team 4 → 2 → 1.
- No horizontal scrolling at 360px width.
- Sticky header with a white background and a 1px bottom border once scrolled.

### 7.4 Hero visual: 54-country grid (use if no real footage)

A clean panel on the hero's right side:

- A small header row: "London" with coordinates `51.51° N, 0.09° W` in muted text, and a thin gold line leading down into the grid.
- A grid of the **54 African country ISO 3166-1 alpha-3 codes**, 9 columns × 6 rows, in small uppercase Lexend with tabular figures, colour `--on-navy-muted`, each in a cell with a faint border (`--navy-border`).
- Caption below: "54 countries. One corridor."
- On load, a single gentle sweep highlights the codes in gold one after another, then they settle back. This plays once only and is disabled for reduced motion. Codes are fully visible at rest.
- Hovering a code highlights it in `--gold-300`.
- Accessibility: the grid is decorative (`aria-hidden="true"`), and the figure has a text alternative: "A grid of the 54 African countries connected to London."
- Don't highlight specific countries permanently, because that would imply live activity there.

The 54 codes, in alphabetical order by country name:

```
DZA AGO BEN BWA BFA BDI CPV CMR CAF
TCD COM COD COG CIV DJI EGY GNQ ERI
SWZ ETH GAB GMB GHA GIN GNB KEN LSO
LBR LBY MDG MWI MLI MRT MUS MAR MOZ
NAM NER NGA RWA STP SEN SYC SLE SOM
ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE
```

### 7.5 Logo

- Until a real logo exists: a simple SVG wordmark. "CTI" in Lexend 600 inside a small navy square badge with a 1px gold-500 inner border, followed by "Connect, Trade and Invest" in small text. Subtext in the header: "UK–Africa".
- Provide light-background and navy-background versions.
- Swap for the official logo when it's supplied (`/assets/img/logo.svg`).

### 7.6 Icons

Simple 1.5px stroke line icons (inline SVG, Lucide-style), 20–24px, in `--gold-700` on light and `--gold-500` on navy. No emoji. No icon fonts.

### 7.7 Imagery

- Prefer real stills from CTI's own video content: sites, operations, people at work.
- Format WebP (AVIF optional), with explicit `width`/`height`, `loading="lazy"` below the fold, and `decoding="async"`.
- Meaningful `alt` text on every content image, and `alt=""` on decorative ones.

## 8. Technical approach

**Static site: plain HTML, CSS and a small vanilla JS file. No framework, no build step.** It's the fastest, cheapest and easiest option to maintain for a single page, and it easily meets the Lighthouse target.

### 8.1 File structure

```
/                                (repo root, not deployed)
├── README.md
├── netlify.toml                 (publish = "site")
├── .cursor/rules/cti-site.mdc
├── docs/
│   ├── CTI_BRIEF.md
│   └── CTI_COPY.md
└── site/                        (everything here is deployed)
    ├── index.html
    ├── privacy.html
    ├── 404.html
    ├── robots.txt
    ├── sitemap.xml
    ├── favicon.svg
    ├── favicon-32.png
    ├── apple-touch-icon.png     (180×180)
    ├── site.webmanifest
    └── assets/
        ├── css/styles.css
        ├── js/main.js
        ├── fonts/lexend-latin-wght-normal.woff2
        └── img/
            ├── logo.svg
            ├── logo-on-navy.svg
            ├── og-image.png     (1200×630)
            ├── hero.webp        (optional, if real footage)
            └── team/*.webp
```

`netlify.toml` sits at the repo root with `[build] publish = "site"`, so `docs/` and `.cursor/` are never deployed. All paths in the HTML are root-relative to `site/` (for example `/assets/css/styles.css`).

### 8.2 Font

Self-host Lexend (avoids sending visitor data to Google and is faster):

```bash
npm pack @fontsource-variable/lexend
tar -xzf fontsource-variable-lexend-*.tgz
mkdir -p site/assets/fonts
cp package/files/lexend-latin-wght-normal.woff2 site/assets/fonts/
rm -rf package fontsource-variable-lexend-*.tgz
```

```css
@font-face {
  font-family: "Lexend";
  src: url("/assets/fonts/lexend-latin-wght-normal.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

Preload it in `<head>`: `<link rel="preload" href="/assets/fonts/lexend-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>`.

### 8.3 JavaScript (`main.js`, deferred, no libraries)

- Mobile menu toggle (`aria-expanded`, focus management, close on link click and on Escape).
- Header gets a "scrolled" class after 8px of scroll.
- Smooth scrolling via CSS `scroll-behavior: smooth` (disabled for reduced motion), with `scroll-margin-top` on sections equal to the header height.
- Section fade-up using IntersectionObserver. Add the class that hides content only after JS runs, so content is visible without JS.
- Hero grid sweep (once, skipped for reduced motion).
- Audience card buttons: `data-interest="..."` sets the dropdown value, then scrolls to `#contact` and focuses the first empty field.
- The form also accepts `?interest=investor` etc. in the URL, so links in emails can preselect an option.
- Form validation and AJAX submission (section 9).
- No inline scripts. Everything lives in `main.js`, so the CSP can stay strict.

### 8.4 Hosting

- **Netlify** (free plan). Connect the GitHub repo for automatic deploys on push.
- HTTPS is automatic.
- Custom domain: add it in Netlify, then **at IONOS add only the website records** (an A record for `@` and a CNAME for `www`, using the values Netlify shows).
- ⚠️ **Do NOT change the domain's nameservers and do NOT touch the MX, SPF, DKIM or DMARC records.** Team email runs on Zoho, and those records must stay as they are.
- Redirect `www` to the bare domain (or the other way round). Choose one canonical version.

## 9. Contact form

### 9.1 Fields

| Field | Name | Type | Required | Notes |
|-------|------|------|----------|-------|
| Full name | `name` | text | Yes | `autocomplete="name"` |
| Job title | `title` | text | No | `autocomplete="organization-title"` |
| Organisation | `organisation` | text | Yes | `autocomplete="organization"` |
| Work email | `email` | email | Yes | `autocomplete="email"`; helper text: "Please use your work email if you have one." Don't block Gmail etc., because many SMEs use them. |
| Country | `country` | text | No | `autocomplete="country-name"` |
| I'm interested in | `interest` | select | Yes | Options in the copy file. Values are fixed (see copy file). |
| Message | `message` | textarea | No | maxlength 2000, with a live character count |
| Honeypot | `bot-field` | text | n/a | Hidden from people and screen readers |

### 9.2 Behaviour

- Uses **Netlify Forms**: `<form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field">` plus `<input type="hidden" name="form-name" value="contact">`.
- Submit with `fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() })`.
- Client-side validation on submit and on blur after the first attempt. Show errors under each field (`aria-describedby`, `aria-invalid="true"`), and move focus to the first invalid field.
- Disable the button and show "Sending…" while submitting, so it can't be submitted twice.
- On success, replace the form with the success message (focus moves to it, `role="status"`).
- On failure, show the error message above the button (`role="alert"`). Keep everything the visitor typed.
- Trim inputs. Never inject user input into the page as HTML (use `textContent`).
- Netlify does server-side spam filtering. The honeypot is a second layer.
- After deploy: in Netlify, go to **Forms**, turn on **form detection** if it's off, and redeploy. Then add an **email notification** to the team's Zoho inbox. Check the current free-plan submission limits on Netlify's pricing page.

### 9.3 Fallback

If CTI moves off Netlify, swap to Formspree (free tier) by changing the `fetch` URL. Keep the field names the same.

## 10. Legal and compliance (UK)

These are required, not optional. **Have a solicitor review the disclaimer and investment wording before launch.**

1. **Financial promotion.** The site must not read as an invitation to invest. Use the disclaimer text in the copy file in the footer. Avoid wording like "invest now", "returns" or "yield" tied to specific opportunities.
2. **Company disclosures** (Companies Act trading disclosure rules). The footer must show the registered company name, company number, place of registration and registered office address.
3. **Privacy notice** at `/privacy.html`, linked from the footer and from the form. A draft is in the copy file, and it needs the real details filled in.
4. **ICO data protection fee.** Check whether CTI needs to pay it (most organisations that process personal data do).
5. **Cookies.** The site sets no non-essential cookies, so it needs no cookie banner. If analytics are added later, use a cookieless tool (for example Cloudflare Web Analytics) and update the privacy notice.
6. **No third-party logos or names** without written permission (see section 4).
7. **Figures** in "Why it matters" must show their source.

## 11. SEO and sharing

- `<html lang="en-GB">`.
- Title: `CTI | UK–Africa Trade and Investment`.
- Meta description (in the copy file).
- `<link rel="canonical" href="https://[DOMAIN]/">`.
- Open Graph and Twitter card tags: title, description, `og:image` = `/assets/img/og-image.png` (1200×630, navy background, logo and core line), `og:type=website`, `og:locale=en_GB`.
- JSON-LD `Organization` schema: name, url, logo, email, sameAs (LinkedIn).
- `robots.txt` allowing all and pointing to the sitemap. `sitemap.xml` listing `/` and `/privacy.html`.
- One `<h1>` only, with a logical heading order.
- Favicon set plus `site.webmanifest` (`theme_color` #0C1424).
- `404.html` styled to match, with a link home.

## 12. Accessibility (WCAG 2.2 AA)

- Semantic landmarks: `header`, `nav`, `main`, `section` (each with a heading), `footer`.
- "Skip to content" link, visible on focus.
- Visible focus state on everything interactive: a 2px gold-500 outline with a 2px offset, which works on both light and navy.
- All form fields have visible `<label>`s. Placeholders are not labels.
- Tap targets at least 44×44px.
- Colour is never the only signal (errors have text and an icon).
- Everything works by keyboard alone, including the mobile menu.
- Respect `prefers-reduced-motion`.
- Images have proper `alt` text.
- Text resizes to 200% without breaking the layout.

## 13. Performance and security

- Lighthouse 95+ on Performance, Accessibility, Best Practices and SEO (mobile and desktop).
- One CSS file and one JS file (deferred). No libraries.
- Preload the font. Lazy-load below-the-fold images. Set explicit image dimensions (no layout shift).
- Total page weight under 500KB excluding team photos.
- `netlify.toml` security headers:

```toml
[build]
  publish = "site"

[[redirects]]
  from = "https://www.[DOMAIN]/*"
  to = "https://[DOMAIN]/:splat"
  status = 301
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    X-Frame-Options = "DENY"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

(If cookieless analytics are added later, extend `script-src` and `connect-src` for that provider only.)

## 14. Done means

- [ ] All sections built in the order above, with copy from `CTI_COPY.md`
- [ ] Looks right at 360, 390, 768, 1024, 1280 and 1440px, with no horizontal scroll
- [ ] Keyboard-only walkthrough works (menu, links, form)
- [ ] Audience buttons preselect the right form option
- [ ] Form validation, success and error states all work
- [ ] Test submission arrives in Netlify and in the Zoho inbox
- [ ] Lighthouse 95+ on all four categories, mobile and desktop
- [ ] HTML passes the W3C validator with no errors
- [ ] No console errors
- [ ] securityheaders.com grade A
- [ ] Link preview looks right (check on opengraph.xyz or by pasting into WhatsApp/LinkedIn)
- [ ] privacy.html and 404.html done and linked
- [ ] All `[PLACEHOLDERS]` replaced with real content (search the code for `[`)
- [ ] Solicitor has reviewed the disclaimer and investment wording
- [ ] Domain live on HTTPS, and email still working afterwards (send a test email both ways)
