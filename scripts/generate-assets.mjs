#!/usr/bin/env node

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const iconSource = path.resolve(projectRoot, process.env.ICON_SOURCE || "./assets/source/icon-master.png");
const splashSource = path.resolve(projectRoot, process.env.SPLASH_SOURCE || "./assets/source/splash-master.png");
const darkSplashSource = path.resolve(projectRoot, "./assets/source/splash-master-dark.png");
const outputDir = path.resolve(projectRoot, "./assets/images");
const iconOutput = path.join(outputDir, "icon.png");
const splashOutput = path.join(outputDir, "splash-icon.png");
const darkSplashOutput = path.join(outputDir, "splash-icon-dark.png");

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    console.error("[assets] Sharp is required to generate assets.");
    console.error("[assets] Install it with: npm install --save-dev sharp");
    process.exitCode = 1;
    return null;
  }
}

function explainMissingSources() {
  console.error("[assets] Missing required source artwork.");
  console.error(`[assets] Expected icon source: ${path.relative(projectRoot, iconSource)}`);
  console.error(`[assets] Expected splash source: ${path.relative(projectRoot, splashSource)}`);
  console.error("[assets] Add high-resolution square PNG masters, then run: npm run assets:generate");
  console.error("[assets] Optional dark splash source: assets/source/splash-master-dark.png");
}

async function main() {
  const missing = [iconSource, splashSource].filter((file) => !existsSync(file));
  if (missing.length) {
    explainMissingSources();
    process.exitCode = 1;
    return;
  }

  const sharp = await loadSharp();
  if (!sharp) {
    return;
  }

  await mkdir(outputDir, { recursive: true });

  await sharp(iconSource)
    .resize(1024, 1024, { fit: "cover", position: "center" })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(iconOutput);
  console.log(`[assets] Wrote ${path.relative(projectRoot, iconOutput)}`);

  await sharp(splashSource)
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(splashOutput);
  console.log(`[assets] Wrote ${path.relative(projectRoot, splashOutput)}`);

  if (existsSync(darkSplashSource)) {
    await sharp(darkSplashSource)
      .resize(1024, 1024, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(darkSplashOutput);
    console.log(`[assets] Wrote ${path.relative(projectRoot, darkSplashOutput)}`);
  } else {
    console.log("[assets] No dark splash source found; skipped assets/images/splash-icon-dark.png");
  }
}

await main();
