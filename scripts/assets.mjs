// Filename referenced in the .dc.html (uploads/…) → file actually uploaded to Bunny.
// `file` is relative to uploads/ (optimized/ is produced by scripts/optimize-assets.py).
export const BUNNY_DIR = "pelicano/LP/eoy-2026";
export const CDN_BASE = `https://adfinitas.b-cdn.net/${BUNNY_DIR}`;

export const ASSETS = {
  "HarriText-Bold.woff": { file: "HarriText-Bold.woff", remote: "fonts/HarriText-Bold.woff" },
  "HarriText-ExtraBold.woff": { file: "HarriText-ExtraBold.woff", remote: "fonts/HarriText-ExtraBold.woff" },
  "HarriText-BoldItalic.woff": { file: "HarriText-BoldItalic.woff", remote: "fonts/HarriText-BoldItalic.woff" },
  "HarriText-Bold.woff2": { file: "optimized/HarriText-Bold.woff2", remote: "fonts/HarriText-Bold.woff2" },
  "HarriText-ExtraBold.woff2": { file: "optimized/HarriText-ExtraBold.woff2", remote: "fonts/HarriText-ExtraBold.woff2" },
  "HarriText-BoldItalic.woff2": { file: "optimized/HarriText-BoldItalic.woff2", remote: "fonts/HarriText-BoldItalic.woff2" },
  "Pelicano_logotype_baseline-dark_NL.png": { file: "optimized/pelicano-logo-baseline-dark-nl.webp", remote: "img/pelicano-logo-baseline-dark-nl.webp" },
  "Pelicano_logotype_baseline-dark.png": { file: "optimized/pelicano-logo-baseline-dark-fr.webp", remote: "img/pelicano-logo-baseline-dark-fr.webp" },
  "1764519354-65733938-0x0-logo-footer-pelicano.png": { file: "optimized/pelicano-logo-footer.webp", remote: "img/pelicano-logo-footer.webp" },
  "Fondation-Reine-Paola_logo-NL.png": { file: "optimized/fondation-reine-paola-nl.webp", remote: "img/fondation-reine-paola-nl.webp" },
  "Fondation-Reine-Paola_logo-FR.png": { file: "optimized/fondation-reine-paola-fr.webp", remote: "img/fondation-reine-paola-fr.webp" },
  "Logo_NATLOT_RGB_Baseline_Horiz.png": { file: "optimized/loterie-nationale-nl.webp", remote: "img/loterie-nationale-nl.webp" },
  "Logo_LOTNAT_RGB_Baseline_Horiz.png": { file: "optimized/loterie-nationale-fr.webp", remote: "img/loterie-nationale-fr.webp" },
  "shutterstock_2765383761 (1).jpg": { file: "optimized/hero-classe-globe.webp", remote: "img/hero-classe-globe.webp" },
  "shutterstock_2758910499.jpg": { file: "optimized/sport.webp", remote: "img/sport.webp" },
  "shutterstock_573089722.jpg": { file: "optimized/repas-ecole.webp", remote: "img/repas-ecole.webp" },
  "boite_a_tartine.webp": { file: "optimized/boite-a-tartines.webp", remote: "img/boite-a-tartines.webp" },
  "shutterstock_2745758871 (2).jpg": { file: "optimized/portrait-noor.webp", remote: "img/portrait-noor.webp" },
};
