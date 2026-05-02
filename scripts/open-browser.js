import { exec } from "child_process";
import http from "http";

const URL = process.env.INTEL_HUB_URL || "http://localhost:3001";
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

function openInBrowser(url) {
  const cmd =
    process.platform === "darwin" ? `open "${url}"` :
    process.platform === "win32"  ? `start "" "${url}"` :
                                    `xdg-open "${url}"`;
  exec(cmd, (err) => {
    if (err) console.error(`[open-browser] Failed to open: ${err.message}`);
    else console.log(`[open-browser] Opened ${url}`);
  });
}

const start = Date.now();
function poll() {
  http.get(URL, (res) => {
    res.resume();
    if (res.statusCode && res.statusCode < 500) {
      openInBrowser(URL);
    } else {
      retry();
    }
  }).on("error", retry);
}

function retry() {
  if (Date.now() - start > MAX_WAIT_MS) {
    console.error(`[open-browser] Server didn't respond at ${URL} within ${MAX_WAIT_MS / 1000}s`);
    process.exit(1);
  }
  setTimeout(poll, POLL_INTERVAL_MS);
}

poll();
