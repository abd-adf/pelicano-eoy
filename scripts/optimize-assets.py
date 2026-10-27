"""Resize/convert LP assets from uploads/ into uploads/optimized/ (WebP images, WOFF2 fonts).
Usage: python scripts/optimize-assets.py   (needs: pillow, fonttools, brotli)"""
from pathlib import Path
from PIL import Image
from fontTools import subset

SRC = Path("uploads")
OUT = SRC / "optimized"
OUT.mkdir(exist_ok=True)

# source file → (output name, max width, quality). Widths ≈ 2× the largest rendered size.
IMAGES = {
    # Licensed 1000px files only — the 1500px "stock-photo-*" files in uploads/ are watermarked previews.
    "shutterstock_2765383761 (1).jpg": ("hero-classe-globe.webp", 1000, 76),
    "shutterstock_2745758871 (2).jpg": ("portrait-noor.webp", 1000, 76),
    "shutterstock_2758910499.jpg": ("sport.webp", 760, 72),
    "shutterstock_573089722.jpg": ("repas-ecole.webp", 760, 72),
    "boite_a_tartine.webp": ("boite-a-tartines.webp", 760, 72),
    "Pelicano_logotype_baseline-dark_NL.png": ("pelicano-logo-baseline-dark-nl.webp", 720, 90),
    "Pelicano_logotype_baseline-dark.png": ("pelicano-logo-baseline-dark-fr.webp", 720, 90),
    "Fondation-Reine-Paola_logo-NL.png": ("fondation-reine-paola-nl.webp", 640, 88),
    "Fondation-Reine-Paola_logo-FR.png": ("fondation-reine-paola-fr.webp", 640, 88),
    "Logo_NATLOT_RGB_Baseline_Horiz.png": ("loterie-nationale-nl.webp", 240, 90),
    "Logo_LOTNAT_RGB_Baseline_Horiz.png": ("loterie-nationale-fr.webp", 240, 90),
    "1764519354-65733938-0x0-logo-footer-pelicano.png": ("pelicano-logo-footer.webp", 1860, 90),
}

for src, (name, max_w, q) in IMAGES.items():
    im = Image.open(SRC / src)
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(OUT / name, "WEBP", quality=q, method=6)
    print(f"{name:40} {im.width}x{im.height} {(OUT / name).stat().st_size // 1024} KB")

# Latin subset (FR/NL accents, €, typographic punctuation, arrows, ×) — ~4× smaller than the full fonts.
UNICODES = "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-21FF,U+2212"
for font in ["HarriText-Bold", "HarriText-ExtraBold", "HarriText-BoldItalic"]:
    out = OUT / f"{font}.woff2"
    subset.main([str(SRC / f"{font}.ttf"), f"--unicodes={UNICODES}", "--flavor=woff2", "--layout-features=*", f"--output-file={out}"])
    print(f"{font}.woff2 {out.stat().st_size // 1024} KB")
