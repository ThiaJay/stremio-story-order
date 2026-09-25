from pathlib import Path
import cv2
import numpy as np
import hashlib
import json
import re
from PIL import Image

src = Path("public/logo.png")
rgba = cv2.imread(str(src), cv2.IMREAD_UNCHANGED)
assert rgba is not None and rgba.shape[:2] == (320, 320)
if rgba.shape[2] == 4:
    alpha = rgba[:, :, 3]
    bgr = rgba[:, :, :3]
else:
    alpha = np.full((320, 320), 255, np.uint8)
    bgr = rgba

poly = np.array([[59,30],[100,25],[291,131],[295,180],[112,281],[64,276],[55,238],[55,80]], np.int32)
mask = np.zeros((320, 320), np.uint8)
cv2.fillPoly(mask, [poly], 255)
mask = cv2.GaussianBlur(mask, (0, 0), sigmaX=2.2)
hard = (mask > 18).astype(np.uint8) * 255

background = cv2.inpaint(bgr, hard, 4, cv2.INPAINT_TELEA)
blurred = cv2.GaussianBlur(background, (0, 0), sigmaX=9)
a_bg = (mask.astype(np.float32) / 255.0)[..., None]
background = (background * (1 - a_bg) + blurred * a_bg).astype(np.uint8)

shift = -17
M = np.float32([[1, 0, shift], [0, 1, 0]])
shifted = cv2.warpAffine(bgr, M, (320, 320), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0))
shifted_mask = cv2.warpAffine(mask, M, (320, 320), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
a = (shifted_mask.astype(np.float32) / 255.0)[..., None]
out = (shifted * a + background * (1 - a)).clip(0, 255).astype(np.uint8)
out_rgba = np.dstack([out, alpha])

tmp = Path("/tmp/story-order-centered.png")
cv2.imwrite(str(tmp), out_rgba)
im = Image.open(tmp).convert("RGB").quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
im.save(src, optimize=True)

data = src.read_bytes()
size = len(data)
gitsha = hashlib.sha1(b"blob " + str(size).encode() + bytes([0]) + data).hexdigest()
sha256 = hashlib.sha256(data).hexdigest()
assert data[:8] == bytes.fromhex("89504e470d0a1a0a")
assert Image.open(src).size == (320, 320)

for alias in ["public/branding/app-icon.png", "public/branding/v3/story-order-app-icon.png"]:
    Path(alias).write_bytes(data)

p = Path("config-page.js")
s = p.read_text(encoding="utf-8").replace("?v=1.0.18", "?v=1.0.19")
p.write_text(s, encoding="utf-8")

p = Path("worker.js")
s = p.read_text(encoding="utf-8").replace('const VERSION = "1.0.18";', 'const VERSION = "1.0.19";')
p.write_text(s, encoding="utf-8")

pkg = json.loads(Path("package.json").read_text(encoding="utf-8"))
pkg["version"] = "1.0.19"
Path("package.json").write_text(json.dumps(pkg, indent=2) + "\n", encoding="utf-8")

p = Path("package-lock.json")
s = p.read_text(encoding="utf-8").replace('"version": "1.0.18"', '"version": "1.0.19"', 2)
p.write_text(s, encoding="utf-8")

p = Path("test-worker.mjs")
s = p.read_text(encoding="utf-8")
s = s.replace("logo.png?v=1.0.18", "logo.png?v=1.0.19")
s = re.sub(r'assert\.equal\(\s*iconGitBlobSha,\s*"[0-9a-f]{40}",', 'assert.equal(\n  iconGitBlobSha,\n  "' + gitsha + '",', s, count=1)
p.write_text(s, encoding="utf-8")

p = Path("test-live.mjs")
s = p.read_text(encoding="utf-8").replace("1.0.18", "1.0.19")
s = re.sub(r'assert\.equal\(liveIconBytes\.length,\d+,"live compact icon must match the approved master size"\);',
           'assert.equal(liveIconBytes.length,' + str(size) + ',"live compact icon must match the approved master size");', s, count=1)
p.write_text(s, encoding="utf-8")

p = Path("BRANDING.md")
s = p.read_text(encoding="utf-8")
note = "- Optically centred v1.0.19 icon Git blob: `" + gitsha + "`. SHA-256: `" + sha256 + "`. The portal artwork is translated left within the unchanged square master to correct its visual centre.\n"
if "Optically centred v1.0.19 icon Git blob" not in s:
    s = s.replace("## Meaning", note + "\n## Meaning", 1)
p.write_text(s, encoding="utf-8")

p = Path("CHANGELOG.md")
s = p.read_text(encoding="utf-8")
entry = """## 1.0.19 - 2026-09-25

Optically centred Story Order emblem.

- Corrects the canonical play portal artwork being visually biased to the right inside its square.
- Translates the existing artwork left without redesigning or restyling it.
- Publishes the same corrected bytes to the canonical logo, app icon alias and v3 icon.
- Cache busts public branding references and locks the corrected icon by Git blob hash.
- Carries forward the Breaking Bad example and cinematic interface refinement.

"""
if "## 1.0.19 - 2026-09-25" not in s:
    s = s.replace("# Changelog\n\n", "# Changelog\n\n" + entry, 1)
p.write_text(s, encoding="utf-8")

print("centered_icon", size, gitsha, sha256)
