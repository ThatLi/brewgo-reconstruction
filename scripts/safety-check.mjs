import { execFileSync } from "node:child_process";
import { extname, normalize, sep } from "node:path";
import { readFileSync } from "node:fs";

const scanAll = process.argv.includes("--all");
const maximumBytes = 1_500_000;
const prohibitedExtensions = new Set([
  ".aab",
  ".apk",
  ".apks",
  ".class",
  ".dex",
  ".dll",
  ".dylib",
  ".exe",
  ".ipa",
  ".jar",
  ".jks",
  ".keystore",
  ".msi",
  ".p12",
  ".pfx",
  ".pem",
  ".smali",
  ".so",
  ".xapk",
]);
const permittedBinaryExtensions = new Set([
  ".gif",
  ".jpeg",
  ".jpg",
  ".otf",
  ".png",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
]);
const prohibitedDirectories = new Set([
  "analysis-raw",
  "decoded",
  "decompiled",
  "extracted",
  "work",
]);

const protectedBrand = ["luck", "in"].join("");
const protectedDomains = [
  ["luck", "incoffee"].join(""),
  ["lk", "coffee"].join(""),
];
const privateKeyHeader = ["-----BEGIN ", "PRIVATE KEY-----"].join("");
const textPatterns = [
  { label: "protected reference branding", expression: new RegExp(protectedBrand, "i") },
  ...protectedDomains.map((domain) => ({
    label: "protected production domain",
    expression: new RegExp(domain.replace(".", "\\."), "i"),
  })),
  { label: "private key material", expression: new RegExp(privateKeyHeader) },
  { label: "AWS access key", expression: /AKIA[0-9A-Z]{16}/ },
  { label: "GitHub access token", expression: /gh[pousr]_[A-Za-z0-9]{36,}/ },
  {
    label: "assigned secret",
    expression: /(?:api[_-]?key|client[_-]?secret|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{16,}["']/i,
  },
];

function gitBytes(args) {
  return execFileSync("git", args, { encoding: "buffer" });
}

function trackedFiles() {
  const bytes = scanAll
    ? gitBytes(["ls-files", "-z"])
    : gitBytes(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]);
  return bytes
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

function fileBytes(file) {
  return scanAll ? readFileSync(file) : gitBytes(["show", `:${file}`]);
}

const violations = [];
for (const file of trackedFiles()) {
  const normalized = normalize(file);
  const segments = normalized.split(sep).map((part) => part.toLowerCase());
  const extension = extname(normalized).toLowerCase();

  if (segments.some((segment) => prohibitedDirectories.has(segment))) {
    violations.push(`${file}: prohibited analysis directory`);
  }
  if (prohibitedExtensions.has(extension)) {
    violations.push(`${file}: prohibited file extension ${extension}`);
  }

  const bytes = fileBytes(file);
  if (bytes.length > maximumBytes) {
    violations.push(`${file}: ${bytes.length} bytes exceeds ${maximumBytes}`);
  }

  const binary = bytes.includes(0);
  if (binary && !permittedBinaryExtensions.has(extension)) {
    violations.push(`${file}: unexpected binary content`);
    continue;
  }
  if (binary) continue;

  const text = bytes.toString("utf8");
  for (const pattern of textPatterns) {
    if (pattern.expression.test(text)) {
      violations.push(`${file}: contains ${pattern.label}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Repository safety check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Repository safety check passed (${scanAll ? "all tracked files" : "staged files"}).`);
