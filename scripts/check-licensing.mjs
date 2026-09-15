#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "LICENSE",
  "NOTICE",
  "ASSET_LICENSE.md",
  "THIRD_PARTY_NOTICES.md",
  "third_party/licenses/SORA-OFL-1.1.txt",
];

const contents = new Map(
  await Promise.all(requiredFiles.map(async (file) => [file, await readFile(file, "utf8")])),
);
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));

const failures = [];
if (packageJson.license !== "Apache-2.0") failures.push("package.json must declare Apache-2.0");
if (packageLock.packages?.[""]?.license !== "Apache-2.0") {
  failures.push("package-lock.json must declare Apache-2.0 for the root package");
}
if (!contents.get("LICENSE")?.includes("Apache License") || !contents.get("LICENSE")?.includes("Version 2.0")) {
  failures.push("LICENSE must contain Apache License 2.0");
}
if (!contents.get("NOTICE")?.includes("Copyright 2026 Gaurav Dama")) {
  failures.push("NOTICE must retain the owner copyright");
}
if (!contents.get("ASSET_LICENSE.md")?.includes("All rights reserved")) {
  failures.push("ASSET_LICENSE.md must preserve the brand-asset boundary");
}
if (!contents.get("third_party/licenses/SORA-OFL-1.1.txt")?.includes("SIL OPEN FONT LICENSE Version 1.1")) {
  failures.push("The Sora OFL license is missing or incomplete");
}

if (failures.length) {
  failures.forEach((failure) => console.error(`[licensing] ${failure}`));
  process.exit(1);
}

console.log("Verified Apache-2.0 metadata, notices, brand boundary, and Sora attribution.");
