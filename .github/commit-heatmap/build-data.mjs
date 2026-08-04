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
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const SCHEMA = 1;

// 国民の祝日は内閣府の CSV を一次情報として使う。春分・秋分・振替休日・国民の休日・
// 年ごとの特例まで含まれるので、自前で計算するより確実。
const HOLIDAY_URL = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";

function parseArgs(argv) {
  const opts = {
    ref: "origin/draft",
    out: "dist/commits.json",
    tz: "Asia/Tokyo",
    repo: "",
    holidays: HOLIDAY_URL,
    holidaysCsv: "",
  };
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

/** マージコミットは除く。PR のマージやブランチ同期は作業そのものではないため。 */
function readCommits(ref) {
  const out = execFileSync("git", ["log", ref, "--no-merges", "--pretty=format:%aI"], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  return out.trim() ? out.trim().split("\n") : [];
}

/**
 * 内閣府の CSV を { "YYYY-MM-DD": "名称" } に変換する。
 * 想定は Shift_JIS・CRLF・「YYYY/M/D,名称」。見出し行や想定外の行は落とす。
 */
function parseHolidayCsv(bytes) {
  let text;
  try {
    text = new TextDecoder("shift_jis").decode(bytes);
  } catch {
    text = Buffer.from(bytes).toString("latin1");
  }
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const comma = line.indexOf(",");
    if (comma < 0) continue;
    const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(line.slice(0, comma).trim().replace(/^﻿/, ""));
    if (!m) continue;
    const key = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    out[key] = line.slice(comma + 1).trim();
  }
  return out;
}

/** 取得に失敗しても集計は止めない。祝日の色分けが消えるだけ。 */
async function loadHolidays(opts) {
  try {
    let bytes;
    if (opts.holidaysCsv) {
      bytes = readFileSync(opts.holidaysCsv);
    } else if (opts.holidays) {
      const res = await fetch(opts.holidays);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      bytes = new Uint8Array(await res.arrayBuffer());
    } else {
      return {};
    }
    const all = parseHolidayCsv(bytes);
    const n = Object.keys(all).length;
    if (n === 0) throw new Error("祝日を 1 件も読めなかった");
    process.stderr.write(`holidays: ${n} 件を読み込み\n`);
    return all;
  } catch (err) {
    process.stderr.write(`holidays: 取得できなかったので祝日なしで続行します (${err.message})\n`);
    return {};
  }
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

async function main() {
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

  const allHolidays = await loadHolidays(opts);
  const holidays = {};
  for (const day of days) {
    if (allHolidays[day.d]) holidays[day.d] = allHolidays[day.d];
  }

  const data = {
    schema: SCHEMA,
    generatedAt: new Date().toISOString(),
    repo: detectRepo(opts.repo),
    ref: opts.ref.replace(/^origin\//, ""),
    timeZone: opts.tz,
    tzLabel: opts.tz === "Asia/Tokyo" ? "JST" : opts.tz,
    total: commits.length,
    holidays,
    days,
  };

  mkdirSync(dirname(opts.out), { recursive: true });
  writeFileSync(opts.out, JSON.stringify(data));

  process.stderr.write(
    `commits=${data.total} days=${days.length} (active ${byDate.size}) ` +
      `holidays=${Object.keys(holidays).length} range=${first}..${last} -> ${opts.out}\n`,
  );
}

await main();
