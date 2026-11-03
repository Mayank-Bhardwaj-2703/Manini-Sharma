"""Copy the buildless site into dist; no network or third-party libraries."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parent
dist = root / 'dist'
if dist.exists():
    shutil.rmtree(dist)
dist.mkdir(exist_ok=True)

for name in ['index.html', 'styles.css', 'script.js', 'RESEARCH.md', 'vercel.json']:
    if (root / name).exists():
        shutil.copy2(root / name, dist / name)

dist_assets = dist / 'assets'
dist_assets.mkdir(parents=True, exist_ok=True)

# Copy all assets recursively
if (root / 'assets').exists():
    shutil.copytree(root / 'assets', dist_assets, dirs_exist_ok=True)

print('Built dist:', sum(f.stat().st_size for f in dist.rglob('*') if f.is_file()), 'bytes')

