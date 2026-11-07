#!/usr/bin/env python3
"""Create a self-contained HTML snapshot for local/offline opening."""
from pathlib import Path
import json, re
ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text(encoding='utf-8')
css = (ROOT / 'assets/css/theme.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="assets/css/theme.css">', '<style>\n' + css + '\n</style>')
# Replace scripts in exact dependency order with inline source.
for rel in [
    'assets/js/eos/eos.js', 'assets/js/steam/region4.js',
    'assets/js/charts/draw.js', 'assets/js/derive/derivations.js',
    'assets/js/core/app.js'
]:
    tag = f'<script src="{rel}"></script>'
    src = (ROOT / rel).read_text(encoding='utf-8')
    html = html.replace(tag, '<script>\n' + src + '\n</script>')
# Embed the exact JSON dataset into the app's startup data so file:// does not need fetch.
data = json.loads((ROOT / 'data/chemicals/chemicals.json').read_text(encoding='utf-8'))['chemicals']
app_rel = 'assets/js/core/app.js'
app = (ROOT / app_rel).read_text(encoding='utf-8')
# Patch only the first inline app occurrence using a unique marker.
start = html.rfind('<script>\n' + app + '\n</script>')
if start >= 0:
    inline = '<script>\n' + app + '\n</script>'
    new_app = re.sub(r'let DATA=\[.*?\];\nlet lang=', 'let DATA=' + json.dumps(data, ensure_ascii=False) + ';\nlet lang=', app, count=1, flags=re.S)
    html = html[:start] + '<script>\n' + new_app + '\n</script>' + html[start+len(inline):]
# Offline build has no service-worker scope under file://, and that is intentional.
html = html.replace('<link rel="manifest" href="manifest.webmanifest">', '')
html = html.replace('href="legacy/Ver10.1.0-original.html"', 'href="https://untholionleen.github.io/JsPSCES-TJU/"')
out = ROOT / 'build' / 'TJU-ThermoHub-13.1.0-standalone.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out)
