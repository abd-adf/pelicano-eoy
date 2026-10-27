// Builds the static site into dist/ for Netlify:
//   dist/index.html     → NL (default) from "Dream Pelicano NL.dc.html"
//   dist/fr/index.html  → FR from "Dream Pelicano FR.dc.html"
// The Claude Design exports (.dc.html) are flattened to plain HTML: no support.js / React / Babel,
// the donor-counter popup is re-implemented in vanilla JS, and uploads/* point to Bunny CDN.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { ASSETS, CDN_BASE } from "./scripts/assets.mjs";

const LANGS = {
  nl: {
    src: "Dream Pelicano NL.dc.html",
    out: "dist/index.html",
    locale: "nl-BE",
    ogLocale: "nl_BE",
    title: "Geef een kind de kans om zijn toekomst op te bouwen · Pelicano",
    description: "In België groeien meer dan 300.000 kinderen op in armoede. Dankzij uw gift krijgt een kind wat het nodig heeft om te leren, deel te nemen en vooruit te gaan. Fiscaal aftrekbaar vanaf € 40.",
    ogImageAlt: "Kinderen ontdekken een wereldbol in de klas",
    switchFrom: '<span style="opacity:.5">FR</span>&nbsp;·&nbsp;NL',
    switchTo: '<a href="/fr/" hreflang="fr" lang="fr" style="opacity:.5;text-decoration:none">FR</a>&nbsp;·&nbsp;NL',
  },
  fr: {
    src: "Dream Pelicano FR.dc.html",
    out: "dist/fr/index.html",
    locale: "fr-BE",
    ogLocale: "fr_BE",
    title: "Donnez à un enfant les moyens de construire son avenir · Pelicano",
    description: "En Belgique, plus de 300.000 enfants grandissent dans la pauvreté. Grâce à votre don, un enfant reçoit ce dont il a besoin pour apprendre, participer et progresser. Déductible fiscalement dès 40 €.",
    ogImageAlt: "Enfants découvrant un globe en classe",
    switchFrom: 'FR&nbsp;·&nbsp;<span style="opacity:.5">NL</span>',
    switchTo: 'FR&nbsp;·&nbsp;<a href="/" hreflang="nl" lang="nl" style="opacity:.5;text-decoration:none">NL</a>',
  },
};

// iRaiser donation form, one URL per language.
LANGS.nl.donateUrl = "https://donate.pelicano.be/PROSP_ADF/~mijn-donatie";
LANGS.fr.donateUrl = "https://donate.pelicano.be/PROSP_ADF/~mon-don";
// "Discover the Foundation" link: URL not provided yet, left as "#".
LANGS.nl.foundationText = "Ontdek de Stichting";
LANGS.fr.foundationText = "Découvrir la Fondation";

// Socials as listed on pelicano.be (no LinkedIn account there, so that icon is dropped).
const SOCIALS = {
  Facebook: "https://www.facebook.com/pelicano.be/",
  Instagram: "https://www.instagram.com/pelicano.be/",
};

const OG_IMAGE = `${CDN_BASE}/img/hero-classe-globe.jpg`;

const TRACKING_HEAD = `<!-- Microsoft Clarity -->
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "x0ns0jomow");
</script>
<!-- End Microsoft Clarity -->
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KGQHX4S');</script>
<!-- End Google Tag Manager -->
<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '353126878625619');
</script>
<!-- End Meta Pixel -->`;

const TRACKING_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KGQHX4S"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

// Vanilla port of the DCLogic component from the .dc.html files.
const popupScript = (locale) => `<script>
(function () {
  var popup = document.getElementById('dc-popup');
  var countEl = document.getElementById('dc-count');
  var now = new Date();
  // seed grows through the winter: start Nov 1, ~34 donateurs/jour + slow intra-day drift
  var start = new Date(now.getFullYear(), 10, 1);
  var days = Math.max(0, Math.floor((now - start) / 86400000));
  if (days > 150) days = days % 150; // wrap after the campaign window
  var drift = Math.floor((now.getHours() * 60 + now.getMinutes()) / 8);
  var count = 1287 + days * 34 + drift;
  function render() { countEl.textContent = count.toLocaleString('${locale}'); }
  render();
  var t = setTimeout(function () { popup.hidden = false; }, 3500);
  var i = setInterval(function () { if (Math.random() < 0.55) { count++; render(); } }, 9000);
  document.getElementById('dc-dismiss').addEventListener('click', function () {
    clearTimeout(t); clearInterval(i); popup.hidden = true;
  });
})();
</script>`;

function replaceOnce(html, from, to) {
  const count = html.split(from).length - 1;
  if (count !== 1) throw new Error(`build: expected exactly 1 match, found ${count}: ${from.slice(0, 80)}`);
  return html.replace(from, to);
}

function between(html, start, end) {
  const a = html.indexOf(start);
  const b = html.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`build: markers not found: ${start} … ${end}`);
  return html.slice(a + start.length, b);
}

function build(lang) {
  const cfg = LANGS[lang];
  let src = readFileSync(cfg.src, "utf8");

  for (const [local, remote] of Object.entries(ASSETS)) {
    src = src.split(`uploads/${local}`).join(`${CDN_BASE}/${remote}`);
  }
  const leftover = src.match(/uploads\/[^"')]+/);
  if (leftover) throw new Error(`build: asset not mapped in scripts/assets.mjs: ${leftover[0]}`);

  const headExtra = between(src, "<helmet data-dc-atomics>", "</helmet>");
  let body = between(src, "</template>", "</x-dc>");

  body = replaceOnce(body, cfg.switchFrom, cfg.switchTo);
  body = replaceOnce(body, '<sc-if value="{{ showPopup }}" hint-placeholder-val="{{ false }}">', '<div id="dc-popup" hidden>');
  body = replaceOnce(body, "</sc-if>", "</div>");
  body = replaceOnce(body, "{{ countText }}", '<span id="dc-count">—</span>');
  body = replaceOnce(body, 'onClick="{{ dismiss }}"', 'id="dc-dismiss" type="button"');
  if (body.includes("{{")) throw new Error(`build: unresolved template expression in ${cfg.src}`);

  for (const [label, url] of Object.entries(SOCIALS)) {
    body = replaceOnce(body, `<a href="#" aria-label="${label}"`, `<a href="${url}" target="_blank" rel="noopener" aria-label="${label}"`);
  }
  const linkedin = body.match(/\s*<a href="#" aria-label="LinkedIn"[\s\S]*?<\/a>/);
  if (!linkedin) throw new Error("build: LinkedIn icon not found");
  body = body.replace(linkedin[0], "");

  // Every remaining "#" link is a donation CTA, except the Foundation link.
  let donateLinks = 0;
  body = body.replace(/<a href="#"([^>]*)>([^<]*)/g, (m, attrs, text) => {
    if (text.includes(cfg.foundationText)) return m;
    donateLinks++;
    return `<a href="${cfg.donateUrl}"${attrs}>${text}`;
  });
  if (donateLinks !== 5) throw new Error(`build: expected 5 donation links, found ${donateLinks} in ${cfg.src}`);

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
${TRACKING_HEAD}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${cfg.title}</title>
<meta name="description" content="${cfg.description}">
<link rel="alternate" hreflang="nl-BE" href="/">
<link rel="alternate" hreflang="fr-BE" href="/fr/">
<link rel="alternate" hreflang="x-default" href="/">
<link rel="icon" href="/favicon.ico">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Pelicano">
<meta property="og:locale" content="${cfg.ogLocale}">
<meta property="og:title" content="${cfg.title}">
<meta property="og:description" content="${cfg.description}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:alt" content="${cfg.ogImageAlt}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://adfinitas.b-cdn.net" crossorigin>
${headExtra.trim()}
<style>[hidden]{display:none!important}</style>
</head>
<body>
${TRACKING_BODY}
${body.trim()}
${popupScript(cfg.locale)}
</body>
</html>
`;
  writeFileSync(cfg.out, html);
}

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/fr", { recursive: true });
build("nl");
build("fr");
copyFileSync("favicon.ico", "dist/favicon.ico");
console.log("build: dist/index.html (NL) + dist/fr/index.html (FR)");
