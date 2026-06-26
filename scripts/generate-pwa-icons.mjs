import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

function createIconSvg(size) {
  const radius = Math.round(size * 0.22);
  const dropPath = `M${size / 2} ${size * 0.24} C${size * 0.28} ${size * 0.52} ${size * 0.28} ${size * 0.68} ${size / 2} ${size * 0.78} C${size * 0.72} ${size * 0.68} ${size * 0.72} ${size * 0.52} ${size / 2} ${size * 0.24} Z`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#059669"/>
  <path d="${dropPath}" fill="#ffffff"/>
</svg>`;
}

async function generateIcon(size, filename) {
  const svg = Buffer.from(createIconSvg(size));
  await sharp(svg).png().toFile(join(publicDir, filename));
}

await mkdir(publicDir, { recursive: true });
await Promise.all([
  generateIcon(192, "icon-192x192.png"),
  generateIcon(512, "icon-512x512.png"),
  generateIcon(180, "apple-touch-icon.png"),
]);

await writeFile(
  join(publicDir, "icon.svg"),
  createIconSvg(512),
  "utf8",
);

console.log("Generated PWA icons in public/");
