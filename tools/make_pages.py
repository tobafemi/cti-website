"""Builds privacy.html and 404.html from the header and footer in index.html,
so all three pages share the same navigation and footer. Run: python3 tools/make_pages.py"""
import pathlib, re
site = pathlib.Path(__file__).resolve().parent.parent / "site"
index = (site / "index.html").read_text()
header = re.search(r"<!--HEADER-START-->.*?<!--HEADER-END-->", index, re.S).group(0)
footer = re.search(r"<!--FOOTER-START-->.*?<!--FOOTER-END-->", index, re.S).group(0)

def page(title, desc, canonical_path, body, robots=""):
    return f"""<!doctype html>
<html lang="en-GB" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0C1424">
{robots}<link rel="canonical" href="https://ctinvestglobal.com{canonical_path}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/lexend-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/styles.css">
<script src="/assets/js/main.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

{header}

<main id="main">
{body}
</main>

{footer}
</body>
</html>
"""

privacy_body = """  <section class="bg-navy page-hero" aria-labelledby="privacy-title">
    <div class="container">
      <p class="eyebrow">Legal</p>
      <h1 id="privacy-title">Privacy notice</h1>
      <p>Last updated: [DATE]</p>
    </div>
  </section>
  <section class="section bg-white">
    <div class="container prose">
      <h2>Who we are</h2>
      <p>[REGISTERED COMPANY NAME] ("CTI", "we") is the controller of the personal data described in this notice. Company number [NUMBER], registered office [ADDRESS]. Contact: hello@ctinvestglobal.com.</p>

      <h2>What we collect</h2>
      <p>When you use the contact form, we collect your name, job title, organisation, email address, country, the option you choose and your message. We do not use cookies or tracking on this website.</p>

      <h2>Why we use it</h2>
      <p>To respond to your enquiry and, where relevant, to continue a business conversation with you. Our lawful basis is our legitimate interest in responding to people who contact us and in developing business relationships.</p>

      <h2>Who we share it with</h2>
      <p>Our website host (Vercel), our email delivery service (Resend), which sends your enquiry to us and a confirmation to you, and our email provider (Zoho). We do not sell your data or share it for marketing.</p>

      <h2>International transfers</h2>
      <p>Our service providers may process data outside the UK. Where they do, appropriate safeguards are in place, such as the UK International Data Transfer Addendum or an adequacy decision.</p>

      <h2>How long we keep it</h2>
      <p>We keep enquiries for up to [24 months] after our last contact with you, unless we enter into a business relationship, in which case we keep records for as long as needed for that relationship and our legal obligations.</p>

      <h2>Your rights</h2>
      <p>You have the right to access, correct or delete your data, to object to or restrict how we use it, and to data portability. To use any of these rights, email hello@ctinvestglobal.com.</p>

      <h2>Complaints</h2>
      <p>If you're unhappy with how we've handled your data, please contact us first. You can also complain to the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" rel="noopener">ico.org.uk</a> or on 0303 123 1113.</p>

      <h2>Changes</h2>
      <p>We may update this notice. The date at the top shows when it was last changed.</p>

      <p><a href="/">Back to home</a></p>
    </div>
  </section>"""

notfound_body = """  <section class="bg-white">
    <div class="container notfound">
      <p class="code">ERROR 404</p>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <a class="btn btn-primary" href="/">Back to the homepage</a>
    </div>
  </section>"""

(site / "privacy.html").write_text(page(
    "Privacy notice | CTI",
    "How Connect, Trade and Invest (CTI) uses the personal data you share through this website.",
    "/privacy.html", privacy_body))
(site / "404.html").write_text(page(
    "Page not found | CTI",
    "The page you're looking for doesn't exist or has moved.",
    "/404.html", notfound_body, robots='<meta name="robots" content="noindex">\n'))
print("built privacy.html and 404.html")
