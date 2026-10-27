// Uploads the LP assets to Bunny Storage under pelicano/LP/eoy-2026/ (slugged filenames).
// Reads credentials from .env. Usage: node scripts/upload-bunny.mjs
import { readFileSync } from "node:fs";
import { ASSETS, BUNNY_DIR } from "./assets.mjs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => {
    const i = l.indexOf("=");
    return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
  })
);
const host = env.BUNNY_STORAGE_REGION ? `${env.BUNNY_STORAGE_REGION}.storage.bunnycdn.com` : "storage.bunnycdn.com";

for (const { file, remote } of Object.values(ASSETS)) {
  const url = `https://${host}/${env.BUNNY_STORAGE_ZONE}/${BUNNY_DIR}/${remote}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { AccessKey: env.BUNNY_STORAGE_PASSWORD, "Content-Type": "application/octet-stream" },
    body: readFileSync(`uploads/${file}`),
  });
  console.log(res.ok ? "ok  " : `FAIL ${res.status}`, remote);
  if (!res.ok) process.exitCode = 1;
}
