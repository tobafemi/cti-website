"""Builds a single self-contained preview file (CSS, JS and font inlined) for sharing a
preview link. Not needed for the real deployment. Run: python3 tools/make_preview.py OUT.html"""
import base64, pathlib, re, sys
site = pathlib.Path(__file__).resolve().parent.parent / "site"
html = (site / "index.html").read_text()
css = (site / "assets/css/styles.css").read_text()
js = (site / "assets/js/main.js").read_text()
font = base64.b64encode((site / "assets/fonts/lexend-latin-wght-normal.woff2").read_bytes()).decode()
css = css.replace('url("/assets/fonts/lexend-latin-wght-normal.woff2")', f'url("data:font/woff2;base64,{font}")')

head = re.search(r"<!--HEAD-START-->(.*?)<!--HEAD-END-->", html, re.S).group(1)
body = re.search(r"<!--BODY-START-->(.*?)<!--BODY-END-->", html, re.S).group(1)
keep = [l for l in head.splitlines() if l.startswith(("<title", '<meta name="claude:viewport', '<meta name="description"'))]
body = (body.replace('href="/#', 'href="#')
            .replace('href="/privacy.html"', 'href="#footer"')
            .replace('href="[LINKEDIN URL]"', 'href="#team"')
            .replace('href="[CTI LINKEDIN URL]"', 'href="#footer"'))
for img in sorted((site / "assets/img/team").glob("*.webp")):
    data = base64.b64encode(img.read_bytes()).decode()
    body = body.replace(f'src="/assets/img/team/{img.name}"', f'src="data:image/webp;base64,{data}"')
body = body.replace(' loading="lazy"', "")
out = "\n".join(keep) + f"\n<style>\n{css}\n</style>\n" + body + \
      "\n<script>window.CTI_PREVIEW = true;</script>\n<script>\n" + js + "\n</script>\n"
pathlib.Path(sys.argv[1]).write_text(out)
print("preview written", len(out)//1024, "KB")
