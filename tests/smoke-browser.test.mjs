import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const routes = [
  ["command", "Command Center"],
  ["brief", "Morning Brief"],
  ["cases", "Constituent Service"],
  ["infrastructure", "Roads & Infrastructure"],
  ["projects", "Projects"],
  ["field", "Field Desk"],
  ["meetings", "Agenda & Meetings"],
  ["budget", "Budget"],
  ["commitments", "Commitments"],
  ["documents", "Documents"],
  ["reports", "Reports"]
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHttp(url, timeoutMs = 10000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(100);
  }
  throw lastError || new Error(`Timed out waiting for ${url}`);
}

async function connectCdp(debugPort) {
  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`);
  const targets = await (await waitForHttp(`http://127.0.0.1:${debugPort}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
  assert.ok(page?.webSocketDebuggerUrl, "Chrome page target was not available");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    events.push(message);
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  return { send, events, close: () => ws.close() };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime.evaluate failed");
  }
  return result.result.value;
}

function runtimeErrors(events) {
  return events
    .filter((event) => {
      if (event.method === "Runtime.exceptionThrown") return true;
      if (event.method === "Log.entryAdded" && ["error", "warning"].includes(event.params.entry.level)) return true;
      if (event.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(event.params.type)) return true;
      return false;
    })
    .map((event) => JSON.stringify(event.params));
}

async function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    wait(2000).then(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
    })
  ]);
}

test("built Commissioner OS renders and primary navigation works in a browser", async () => {
  execFileSync(process.execPath, ["scripts/build.mjs"], { cwd: process.cwd(), stdio: "inherit" });

  const appPort = 43000 + Math.floor(Math.random() * 1000);
  const debugPort = appPort + 1000;
  const profileDir = mkdtempSync(join(tmpdir(), "commissioner-os-chrome-"));
  const server = spawn(process.execPath, ["server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(appPort) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    `http://127.0.0.1:${appPort}/`
  ]);

  try {
    await waitForHttp(`http://127.0.0.1:${appPort}/`);
    const cdp = await connectCdp(debugPort);
    try {
      await cdp.send("Runtime.enable");
      await cdp.send("Log.enable");
      await cdp.send("Page.enable");
      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${appPort}/` });
      await wait(500);

      const initial = await evaluate(
        cdp,
        `({
          text: document.querySelector("#app")?.innerText || "",
          visible: Boolean(document.querySelector("#app")?.getBoundingClientRect().height)
        })`
      );
      assert.equal(initial.visible, true);
      assert.match(initial.text, /Commissioner Command Center/i);
      assert.match(initial.text, /Waller County Commissioner OS/);

      for (const [route, label] of routes) {
        const view = await evaluate(
          cdp,
          `(async () => {
            document.querySelector('[data-route="${route}"]').click();
            await new Promise((resolve) => setTimeout(resolve, 50));
            return document.querySelector("#app")?.innerText || "";
          })()`
        );
        assert.ok(view.includes(label), `Expected ${label} to render`);
      }

      const searchText = await evaluate(
        cdp,
        `(async () => {
          const input = document.querySelector("#globalSearch");
          input.value = "Macedonia";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          await new Promise((resolve) => setTimeout(resolve, 50));
          return document.querySelector("#app")?.innerText || "";
        })()`
      );
      assert.match(searchText, /Unified Search/i);
      assert.match(searchText, /Macedonia/);
      assert.deepEqual(runtimeErrors(cdp.events), []);
    } finally {
      cdp.close();
    }
  } finally {
    await Promise.all([stopProcess(chrome), stopProcess(server)]);
    rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
