#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const sourceRoot = path.join(process.cwd(), "app");
const inventoryPath = path.join(process.cwd(), "docs/product/UI_COPY.md");
const startMarker = "<!-- BEGIN VERIFIED SOURCE COPY -->";
const endMarker = "<!-- END VERIFIED SOURCE COPY -->";
const attributeNames = new Set([
  "accessibilityHint", "accessibilityLabel", "alt", "aria-label", "aria-description",
  "description", "effectiveDate", "errorText", "helperText", "label", "message", "placeholder", "subtitle", "title", "tooltip",
]);
const propertyNames = new Set([
  "accessibilityHint", "accessibilityLabel", "action_label", "alt", "body", "description",
  "emptyText", "errorText", "helperText", "label", "message", "placeholder", "subtitle", "title", "tooltip",
]);

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(absolute));
    else if (/\.tsx?$/.test(entry.name) && !/\.(?:test|spec)\.[tj]sx?$/.test(entry.name)) files.push(absolute);
  }
  return files.sort();
}

const compact = (value) => value.replace(/\s+/g, " ").trim();

function literalText(node, sourceFile) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return compact(node.text);
  if (ts.isTemplateExpression(node)) {
    let value = node.head.text;
    for (const span of node.templateSpans) {
      value += `\${${compact(span.expression.getText(sourceFile))}}${span.literal.text}`;
    }
    return compact(value);
  }
  return null;
}

function collectExpressionStrings(node, sourceFile, output) {
  const value = literalText(node, sourceFile);
  if (value !== null) {
    if (value) output.push({ node, value });
    return;
  }
  if (ts.isConditionalExpression(node)) {
    collectExpressionStrings(node.whenTrue, sourceFile, output);
    collectExpressionStrings(node.whenFalse, sourceFile, output);
  } else if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    collectExpressionStrings(node.left, sourceFile, output);
    collectExpressionStrings(node.right, sourceFile, output);
  }
}

function isVisibleSetter(call) {
  const name = call.expression.getText();
  return /(?:^|\.)(?:alert|confirm|toast|showToast)$/.test(name)
    || /(?:^|\.)(?:set|show)[A-Za-z]*(?:Error|Status|Success|Message|Notice|Feedback)$/.test(name);
}

const escapeCell = (value) => value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/`/g, "\\`");
const entries = [];

for (const file of await collect(sourceRoot)) {
  const source = await readFile(file, "utf8");
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const relative = path.relative(process.cwd(), file).replaceAll(path.sep, "/");
  const found = [];
  const add = (kind, node, value) => value && found.push({ kind, node, value });

  function visit(node) {
    if (ts.isJsxText(node)) add("text", node, compact(node.text));
    if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
      const values = [];
      collectExpressionStrings(node.expression, sourceFile, values);
      for (const item of values) add("text", item.node, item.value);
    }
    if (ts.isJsxAttribute(node) && attributeNames.has(node.name.text) && node.initializer) {
      const expression = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
      if (expression) {
        const values = [];
        collectExpressionStrings(expression, sourceFile, values);
        for (const item of values) add(`attr-${node.name.text}`, item.node, item.value);
      }
    }
    if (ts.isPropertyAssignment(node)) {
      const key = node.name.getText(sourceFile).replace(/["']/g, "");
      if (propertyNames.has(key)) {
        const values = [];
        collectExpressionStrings(node.initializer, sourceFile, values);
        for (const item of values) add(`property-${key}`, item.node, item.value);
      }
    }
    if (ts.isCallExpression(node) && isVisibleSetter(node)) {
      for (const argument of node.arguments) {
        const values = [];
        collectExpressionStrings(argument, sourceFile, values);
        for (const item of values) add("status", item.node, item.value);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  found.sort((a, b) => a.node.getStart(sourceFile) - b.node.getStart(sourceFile));
  found.forEach((item, index) => {
    const line = sourceFile.getLineAndCharacterOfPosition(item.node.getStart(sourceFile)).line + 1;
    entries.push({
      id: `ios.${relative.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]+/g, ".").toLowerCase()}.${String(index + 1).padStart(3, "0")}`,
      location: `${relative}:${line}`,
      kind: item.kind,
      text: item.value,
    });
  });
}

const ids = entries.map(({ id }) => id);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate generated UI-copy IDs.");
const table = [
  startMarker, "",
  "This table is a source-extracted snapshot of current wording. Review changes; do not rewrite it automatically.", "",
  "| Stable ID | Source | Kind | Exact current text |", "|---|---|---|---|",
  ...entries.map((entry) => `| \`${entry.id}\` | \`${entry.location}\` | ${entry.kind} | ${escapeCell(entry.text)} |`),
  "", endMarker,
].join("\n");
const current = await readFile(inventoryPath, "utf8");
const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
const next = markerPattern.test(current) ? current.replace(markerPattern, table) : `${current.trimEnd()}\n\n${table}\n`;

if (process.argv.includes("--write")) {
  await writeFile(inventoryPath, next);
  console.log(`Wrote ${entries.length} exact UI-copy entries to docs/product/UI_COPY.md.`);
} else if (current !== next) {
  console.error("UI-copy inventory is stale. Run: node scripts/inventory-ui-copy.mjs --write");
  process.exit(1);
} else {
  console.log(`Verified ${entries.length} exact UI-copy entries against source.`);
}
