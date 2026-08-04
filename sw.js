/*
 * 毎日更新されるサイトなので、キャッシュは対象ごとに方針を分ける。
 *
 *   commits.json     ネットワーク優先。オフラインのときだけ前回分を出す
 *   画面遷移(HTML)   ネットワーク優先。オフラインのときだけキャッシュを出す
 *   その他           キャッシュ優先。app.js と styles.css は URL に ?v= が付くので
 *                    更新版は別 URL として取得される
 *
 * SHELL のキャッシュ名にバージョンを含めるため、サイトのソースが変わると
 * 古いキャッシュは activate で丸ごと捨てられる。
 */

const VERSION = "24c2406";
const SHELL = `heatmap-shell-${VERSION}`;
const DATA = "heatmap-data";

const SHELL_FILES = [
  "./",
  "./index.html",
  `./styles.css?v=${VERSION}`,
  `./app.js?v=${VERSION}`,
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];

const isData = (url) => url.pathname.endsWith("/commits.json");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== SHELL && k !== DATA).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // 画面遷移: HTTP キャッシュも通さずに取り直す
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(url.href, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            event.waitUntil(caches.open(SHELL).then((c) => c.put("./index.html", copy)));
          }
          return res;
        })
        .catch(() => caches.match("./index.html").then((hit) => hit || caches.match("./"))),
    );
    return;
  }

  // データ: 常に取り直し、失敗したときだけ前回分を返す
  if (isData(url)) {
    event.respondWith(
      fetch(url.href, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            event.waitUntil(caches.open(DATA).then((c) => c.put(req, copy)));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || Response.error())),
    );
    return;
  }

  // バージョン付きのアセットと画像: キャッシュ優先
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          event.waitUntil(caches.open(SHELL).then((c) => c.put(req, copy)));
        }
        return res;
      });
    }),
  );
});
