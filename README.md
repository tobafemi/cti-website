# CTI website

Static site, no build step. Open `index.html` in a browser, or run a local server from this folder:

    npx serve .          # or: python3 -m http.server 8080

## Structure

- `index.html`: all page content, plus the inline Africa map SVG
- `css/styles.css`: all styles. Colour themes are set by `data-theme="a|b|c"` on `<html>` (currently `b`, Hybrid)
- `js/main.js`: menu, scroll reveal, map hover, chart tooltips, theme switcher, contact form
- `assets/fonts/`: Lexend variable font (self-hosted)

## Things to know

- The contact form posts to `api/contact.js`, a Vercel function that emails enquiries to the CTI inbox through Zoho. It needs the environment variables listed at the top of that file. When the site is opened as a local file or on claude.ai, the form runs in preview mode and sends nothing.
- The colour-option switcher (A/B/C bar at the bottom of the page) is controlled by `SHOW_THEME_SWITCHER` in `js/main.js`. Set it to `false` once the team has picked a theme, and set `data-theme` on `<html>`.
- The intro video slot in the "What we do" section has a comment showing how to swap in a real `<video>`.
- `privacy.html`: privacy notice. Add the ICO registration number once the fee is paid (see the TODO comment near the top).
