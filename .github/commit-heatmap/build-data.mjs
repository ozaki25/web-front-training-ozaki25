#!/usr/bin/env node
/**
 * git log から「日付 × 時間帯」のコミット数を集計して JSON を書き出す。
 *
 *   node tools/commit-heatmap/build-data.mjs --ref origin/draft --out dist/commits.json
 *
 * 集計は --tz（既定 Asia/Tokyo）で行い、実行環境の TZ には依存しない。
 * days はコミットのない日も 0 の行として残した連続した日付。
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SCHEMA = 1;

function parseArgs(argv) {
  const opts = { ref: "origin/draft", out: "dist/commits.json", tz: "Asia/Tokyo", repo: "" };
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    if (!(key in opts)) throw new Error(`unknown option: ${argv[i]}`);
    if (argv[i + 1] === undefined) throw new Error(`missing value for ${argv[i]}`);
    opts[key] = argv[i + 1];
  }
  return opts;
}

/** ISO 日時を指定タイムゾーンの { date, hour } に落とす。 */
function makeLocalizer(timeZone) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  return (iso) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
    return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 };
  };
}

const addDays = (ymd, n) => {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function readCommits(ref) {
  const out = execFileSync("git", ["log", ref, "--pretty=format:%aI"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return out.trim() ? out.trim().split("\n") : [];
}

function detectRepo(explicit) {
  if (explicit) return explicit;
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const url = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    // 末尾 2 セグメントを owner/repo として取る（SSH 形式もミラーの URL も同じ扱いにする）
    const m = url.replace(/\.git$/, "").match(/([^/:]+)\/([^/]+)$/);
    return m ? `${m[1]}/${m[2]}` : "";
  } catch {
    return "";
  }
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const localize = makeLocalizer(opts.tz);
  const commits = readCommits(opts.ref);
  if (commits.length === 0) throw new Error(`no commits found on ref: ${opts.ref}`);

  const byDate = new Map();
  const bucket = (date) => {
    let b = byDate.get(date);
    if (!b) {
      b = { d: date, h: new Array(24).fill(0) };
      byDate.set(date, b);
    }
    return b;
  };

  for (const iso of commits) {
    const { date, hour } = localize(iso);
    bucket(date).h[hour] += 1;
  }

  const dates = [...byDate.keys()].sort();
  const first = dates[0];
  const last = dates[dates.length - 1];

  const days = [];
  for (let d = first; d <= last; d = addDays(d, 1)) {
    days.push(byDate.get(d) ?? { d, h: new Array(24).fill(0) });
  }

  const data = {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    repo: detectRepo(opts.repo),
    ref: opts.ref.replace(/^origin\//, ""),
    timeZone: opts.tz,
    tzLabel: opts.tz === "Asia/Tokyo" ? "JST" : opts.tz,
    total: commits.length,
    days,
  };

  mkdirSync(dirname(opts.out), { recursive: true });
  writeFileSync(opts.out, JSON.stringify(data));

  process.stderr.write(
    `commits=${data.total} days=${days.length} (active ${byDate.size}) range=${first}..${last} -> ${opts.out}\n`,
  );
}

main();
