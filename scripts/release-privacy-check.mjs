#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const forbiddenFiles = tracked.filter(
  (file) => /^\.env(?:\.|$)/.test(file) && file !== ".env.example",
);
const suspicious = [];
const textExtensions = /\.(?:js|json|md|mjs|ts|tsx|txt|ya?ml)$/;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /AIza[0-9A-Za-z_-]{35}/,
  /(?:access|refresh|identity)[_-]?token\s*[:=]\s*["'][^"']{16,}["']/i,
];

for (const file of tracked.filter((name) => textExtensions.test(name))) {
  const text = await readFile(file, "utf8");
  if (secretPatterns.some((pattern) => pattern.test(text))) suspicious.push(file);
}

const projectRoot = process.cwd();
const supportSource = await readFile(path.join(projectRoot, "app/screens/SettingsScreen.tsx"), "utf8");
const apiTypes = await readFile(path.join(projectRoot, "app/api/types.ts"), "utf8");
const packageJson = await readFile(path.join(projectRoot, "package.json"), "utf8");
const forbiddenSupportPatterns = [
  ["multipart form construction", /\bnew\s+FormData\s*\(/],
  ["file or image picker wiring", /\b(?:ImagePicker|DocumentPicker|launchImageLibraryAsync)\b/],
  ["file field append", /\.append\s*\(\s*["'](?:file|image|photo|screenshot|attachment)["']/i],
  ["attachment response contract", /\b(?:screenshot_url|attachment_url|file_url)\b/i],
];
const supportBoundaryViolations = forbiddenSupportPatterns.flatMap(([label, pattern]) => {
  const matchedFiles = [
    ["app/screens/SettingsScreen.tsx", supportSource],
    ["app/api/types.ts", apiTypes],
  ].filter(([, source]) => pattern.test(source));
  return matchedFiles.map(([file]) => `${label}: ${file}`);
});
const forbiddenPickerPackages = ["expo-image-picker", "expo-document-picker", "expo-image-manipulator"];
for (const dependency of forbiddenPickerPackages) {
  if (packageJson.includes(`"${dependency}"`)) {
    supportBoundaryViolations.push(`picker dependency: ${dependency}`);
  }
}

if (forbiddenFiles.length || suspicious.length || supportBoundaryViolations.length) {
  for (const file of forbiddenFiles) console.error(`Tracked local environment file: ${file}`);
  for (const file of suspicious) console.error(`Possible credential in tracked file: ${file}`);
  for (const violation of supportBoundaryViolations) console.error(`Text-only support boundary violation: ${violation}`);
  process.exit(1);
}

console.log(
  `Checked ${tracked.length} tracked paths; no local env files, common credential forms, or support-upload wiring found.`,
);
