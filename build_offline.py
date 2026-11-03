"""
Bundles index.html, styles.css, swarm.js, script.js, and assets into Vision 2040 - Offline.html
with base64 embedded assets so it runs anywhere with zero internet or server required.
"""
from pathlib import Path
import base64
import re

root = Path(__file__).resolve().parent

html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'styles.css').read_text(encoding='utf-8')
script = (root / 'script.js').read_text(encoding='utf-8')

# Inline styles
html = re.sub(r'<link rel="stylesheet" href="styles.css[^"]*">', f'<style>\n{css}\n</style>', html)

# Inline scripts
html = re.sub(r'<script src="script.js[^"]*"[^>]*></script>', f'<script>\n{script}\n</script>', html)

# Embed images as base64
def embed_img(match):
    full = match.group(0)
    src = match.group(1)
    # clean query string
    src_clean = src.split('?')[0]
    file_path = root / src_clean
    if file_path.is_file():
        ext = file_path.suffix.lower().lstrip('.')
        mime = 'image/svg+xml' if ext == 'svg' else f'image/{ext}'
        b64 = base64.b64encode(file_path.read_bytes()).decode('ascii')
        data_uri = f'data:{mime};base64,{b64}'
        return full.replace(src, data_uri)
    return full

html = re.sub(r'src="([^"]+\.(?:webp|png|jpg|jpeg|svg)[^"]*)"', embed_img, html)
html = re.sub(r'href="([^"]+\.svg)"', embed_img, html)

output_file = root / 'Vision 2040 - Offline.html'
output_file.write_text(html, encoding='utf-8')
print(f'Successfully built offline bundle: {output_file.name} ({output_file.stat().st_size / 1024 / 1024:.2f} MB)')
