/* commits.json を読んで、横軸に日付・縦軸に 24 時間のヒートマップを描く。 */

(() => {
  "use strict";

  const WD = ["月", "火", "水", "木", "金", "土", "日"];
  // 段は固定。更新をまたいでも同じ色が同じ件数を指すようにする。
  const TH = [1, 2, 3, 5, 8, 12, 18];
  const BIN_LABEL = ["0", "1", "2", "3", "4–5", "6–8", "9–12", "13–18", "19+"];

  const binOf = (t) => {
    if (!t) return 0;
    let b = 1;
    for (const x of TH) if (t > x) b++;
    return b;
  };

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (n) => n.toLocaleString("ja-JP");
  const hh = (h) => String(h).padStart(2, "0");

  /** "YYYY-MM-DD" から曜日を出す（0=月 … 6=日）。文字列を UTC として読むのでタイムゾーンに揺れない。 */
  const wdOf = (ymd) => (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7;

  const state = { range: 90, nums: false, table: false };
  let DATA = null;

  function buildView() {
    const all = DATA.days;
    const days = state.range > 0 ? all.slice(Math.max(0, all.length - state.range)) : all;

    const hourTotals = new Array(24).fill(0);
    let total = 0;
    let peak = { v: 0, d: null, h: 0 };

    for (const day of days) {
      let dayTotal = 0;
      for (let h = 0; h < 24; h++) {
        const v = day.h[h];
        if (!v) continue;
        dayTotal += v;
        hourTotals[h] += v;
        if (v > peak.v) peak = { v, d: day.d, h };
      }
      day._t = dayTotal;
      total += dayTotal;
    }

    return {
      days,
      total,
      hourTotals,
      peak,
      maxDayTotal: days.reduce((m, x) => Math.max(m, x._t), 0),
      maxHourTotal: Math.max(...hourTotals),
    };
  }

  const jstFmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  function relTime(iso) {
    const diff = (new Date(iso).getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat("ja", { numeric: "auto" });
    const abs = Math.abs(diff);
    if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
    if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
    return rtf.format(Math.round(diff / 86400), "day");
  }

  // ---------- 描画 ----------

  function renderUpdated() {
    const el = $("updated");
    el.textContent = `最終更新 ${relTime(DATA.generatedAt)}`;
    el.title = `${jstFmt.format(new Date(DATA.generatedAt))} ${DATA.tzLabel}・${DATA.ref} ブランチ`;
  }

  function renderGrid(view) {
    const days = view.days;
    const grid = $("grid");
    const cw = days.length <= 40 ? 22 : days.length <= 80 ? 16 : 13;
    grid.style.setProperty("--cols", days.length);
    grid.style.setProperty("--col-w", `${cw}px`);

    let s = '<div class="corner c1"></div><div class="corner c2">時間帯計</div>';

    // 月が変わる列にだけ日付ラベルと区切りを置く
    let prevMonth = "";
    for (const day of days) {
      const month = day.d.slice(0, 7);
      const ms = month !== prevMonth;
      prevMonth = month;
      s += `<div class="dlab${ms ? " ms" : ""}">${ms ? day.d.slice(5).replace("-", "/") : ""}</div>`;
    }

    for (let h = 0; h < 24; h++) {
      s += `<div class="hlab${h % 6 === 0 ? " on" : ""}">${hh(h)}</div>`;
      const hv = view.hourTotals[h];
      const w = view.maxHourTotal ? Math.round((hv / view.maxHourTotal) * 26) : 0;
      s += `<div class="htot"><i style="width:${w}px"></i><span>${hv}</span></div>`;
      for (const day of days) {
        const v = day.h[h];
        const hot = day.d === view.peak.d && h === view.peak.h ? " hot" : "";
        s +=
          `<div class="cell${hot}" data-b="${binOf(v)}" data-d="${day.d}"` +
          ` data-h="${h}" data-v="${v}">${v || ""}</div>`;
      }
    }

    s += '<div class="corner c1"></div><div class="corner c2">日計</div>';
    prevMonth = "";
    for (const day of days) {
      const month = day.d.slice(0, 7);
      const ms = month !== prevMonth;
      prevMonth = month;
      const px = view.maxDayTotal ? Math.round((day._t / view.maxDayTotal) * 30) : 0;
      s += `<div class="dtot${ms ? " ms" : ""}" data-d="${day.d}" data-t="${day._t}"><i style="height:${px}px"></i></div>`;
    }

    grid.innerHTML = s;
    grid.classList.toggle("nums", state.nums);
    grid.setAttribute(
      "aria-label",
      `${days[0].d} から ${days[days.length - 1].d} までのコミット数を日付 × 時間帯で表したヒートマップ。計 ${view.total} 件。` +
        (view.peak.d ? `最多は ${view.peak.d} の ${view.peak.h} 時台で ${view.peak.v} 件。` : "") +
        "1 マスごとの件数は「表で見る」から。",
    );

    $("grid-sub").textContent = `${days[0].d} → ${days[days.length - 1].d}・計 ${nf(view.total)} 件`;

    // 直近が見えるように右端へ寄せる
    $("chartview").scrollLeft = $("chartview").scrollWidth;
    trimEdgeLabels();
  }

  /** 固定した左 2 列に隠れて半端に見える月ラベルを消す。 */
  function trimEdgeLabels() {
    const grid = $("grid");
    const corner = grid.querySelector(".corner.c2");
    if (!corner) return;
    const edge = corner.getBoundingClientRect().right;
    for (const el of grid.querySelectorAll(".dlab.ms")) {
      el.style.visibility = el.getBoundingClientRect().left < edge ? "hidden" : "";
    }
  }

  function renderLegend() {
    const sw = BIN_LABEL.map(
      (label, b) => `<span class="sw" data-b="${b}" title="${label} 件"></span>`,
    ).join("");
    $("legend").innerHTML = `<span>少ない</span><div class="swatches">${sw}</div><span>多い</span>`;
  }

  function renderTable(view) {
    const rows = view.days.slice().reverse();
    let s = `<table class="tbl"><caption>日付 × 時間帯のコミット数（${esc(DATA.tzLabel)}）</caption><thead><tr><th scope="col">日付</th>`;
    for (let h = 0; h < 24; h++) s += `<th scope="col">${hh(h)}</th>`;
    s += '<th scope="col">計</th></tr></thead><tbody>';
    for (const day of rows) {
      s += `<tr><th scope="row">${day.d}（${WD[wdOf(day.d)]}）</th>`;
      for (let h = 0; h < 24; h++) s += `<td>${day.h[h]}</td>`;
      s += `<td>${day._t}</td></tr>`;
    }
    s += "</tbody></table>";
    $("tableview").innerHTML = s;
  }

  function renderAll() {
    const view = buildView();
    renderGrid(view);
    if (state.table) renderTable(view);
  }

  // ---------- 操作 ----------

  const THEME_KEY = "heatmap-theme";

  function prefersDark() {
    const saved = (() => {
      try {
        return localStorage.getItem(THEME_KEY);
      } catch {
        return null;
      }
    })();
    if (saved) return saved === "dark";
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncThemeButton() {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const btn = $("themebtn");
    btn.textContent = dark ? "☀" : "☾";
    btn.setAttribute("aria-label", dark ? "ライトテーマに切り替え" : "ダークテーマに切り替え");
  }

  function wireTheme() {
    syncThemeButton();
    $("themebtn").addEventListener("click", () => {
      const next = prefersDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      syncThemeButton();
    });
  }

  function wireControls() {
    document.querySelectorAll(".segbtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.range = Number(btn.dataset.range);
        document
          .querySelectorAll(".segbtn")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        renderAll();
      });
    });

    $("numbtn").addEventListener("click", () => {
      state.nums = !state.nums;
      $("numbtn").setAttribute("aria-pressed", String(state.nums));
      renderAll();
    });

    $("tablebtn").addEventListener("click", () => {
      state.table = !state.table;
      $("tablebtn").setAttribute("aria-pressed", String(state.table));
      $("chartview").hidden = state.table;
      $("tableview").hidden = !state.table;
      if (state.table) renderTable(buildView());
    });

    const tip = $("tip");
    const pane = $("chartview");

    pane.addEventListener("mousemove", (e) => {
      const cell = e.target.closest(".cell, .dtot");
      if (!cell) {
        tip.classList.remove("on");
        return;
      }
      const d = cell.dataset.d;
      const w = WD[wdOf(d)];
      if (cell.classList.contains("dtot")) {
        const t = Number(cell.dataset.t);
        tip.innerHTML = `<b>${d}（${w}）</b> — この日 ${t} 件`;
      } else {
        const v = Number(cell.dataset.v);
        tip.innerHTML = `<b>${d}（${w}） ${cell.dataset.h} 時台</b> — ${v} 件`;
      }
      tip.classList.add("on");
      const r = tip.getBoundingClientRect();
      let left = e.clientX + 14;
      let top = e.clientY + 16;
      if (left + r.width > innerWidth - 8) left = e.clientX - r.width - 14;
      if (top + r.height > innerHeight - 8) top = e.clientY - r.height - 14;
      tip.style.left = Math.max(8, left) + "px";
      tip.style.top = Math.max(8, top) + "px";
    });
    pane.addEventListener("mouseleave", () => tip.classList.remove("on"));

    let queued = false;
    pane.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        trimEdgeLabels();
      });
    });
  }

  // ---------- 起動 ----------

  async function boot() {
    try {
      const res = await fetch("./commits.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      DATA = await res.json();
    } catch (err) {
      $("grid-sub").textContent = `データを読み込めませんでした（${err.message}）`;
      return;
    }

    if (DATA.days.length <= 90) state.range = 0;
    document
      .querySelectorAll(".segbtn")
      .forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.range) === state.range)));

    renderUpdated();
    renderLegend();
    renderAll();
    wireControls();
  }

  wireTheme();
  boot();
})();
