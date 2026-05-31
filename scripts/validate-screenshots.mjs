#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

const screenshotSets = [
  {
    label: "iPhone 6.9-inch portrait",
    dir: "./assets/appstore/screenshots/en-US/iphone-6.9",
    width: 1290,
    height: 2796,
  },
  {
    label: "iPad 13-inch portrait",
    dir: "./assets/appstore/screenshots/en-US/ipad-13",
    width: 2064,
    height: 2752,
  },
];

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch {
    console.error("[screenshots] Sharp is required to validate screenshot dimensions.");
    console.error("[screenshots] Install it with: npm install --save-dev sharp");
    process.exitCode = 1;
    return null;
  }
}

function isImage(fileName) {
  return /\.(png|jpe?g)$/i.test(fileName);
}

async function validateSet(sharp, set) {
  const absoluteDir = path.resolve(projectRoot, set.dir);
  if (!existsSync(absoluteDir)) {
    console.warn(`[screenshots] Missing directory for ${set.label}: ${set.dir}`);
    return false;
  }

  const fileNames = (await readdir(absoluteDir)).filter(isImage).sort();
  if (fileNames.length === 0) {
    console.warn(`[screenshots] No PNG/JPEG screenshots found for ${set.label} in ${set.dir}`);
    return false;
  }

  if (fileNames.length > 10) {
    console.warn(`[screenshots] ${set.label} has ${fileNames.length} screenshots; App Store Connect accepts 1-10.`);
    return false;
  }

  let ok = true;
  for (const fileName of fileNames) {
    const filePath = path.join(absoluteDir, fileName);
    const metadata = await sharp(filePath).metadata();
    const valid = metadata.width === set.width && metadata.height === set.height;
    if (!valid) {
      ok = false;
      console.warn(
        `[screenshots] ${path.relative(projectRoot, filePath)} is ${metadata.width}x${metadata.height}; expected ${set.width}x${set.height}.`,
      );
    } else {
      console.log(`[screenshots] OK ${path.relative(projectRoot, filePath)} (${set.width}x${set.height})`);
    }
  }
  return ok;
}

async function main() {
  const sharp = await loadSharp();
  if (!sharp) {
    return;
  }

  const results = [];
  for (const set of screenshotSets) {
    results.push(await validateSet(sharp, set));
  }

  if (results.every(Boolean)) {
    console.log("[screenshots] All screenshot sets are valid.");
    return;
  }
  console.warn("[screenshots] Fix missing or incorrectly sized screenshots before App Store upload.");
  process.exitCode = 1;
}

await main();
