import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, normalize, relative, sep } from "node:path";
import { presetFor } from "../src/chaos-core/plan.ts";
import { gemmaConfigured, interpretExperiment } from "./gemma.ts";

loadEnvFile();

const port = Number(process.env.CHAOS_CORE_PORT || 8787);
const host = process.env.CHAOS_CORE_HOST || "127.0.0.1";
const distDir = join(process.cwd(), "dist");
const hits = new Map<string, number[]>();

const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".png": "image/png",
};

function loadEnvFile(): void {
  const path = join(process.cwd(), ".env");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "Cache-Control": "no-store",
  });
  response.end(payload);
}

function clientAddress(request: IncomingMessage): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() || "local";
  }
  return request.socket.remoteAddress ?? "local";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 8) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    request.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > 4096) {
        reject(new Error("too-large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function fileInsideDist(urlPath: string): string | null {
  const decoded = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const full = normalize(join(distDir, decoded));
  const fromRoot = relative(distDir, full);
  if (fromRoot.startsWith("..") || fromRoot.includes(`..${sep}`)) return null;
  return full;
}

function serveStatic(request: IncomingMessage, response: ServerResponse): void {
  if (!existsSync(distDir)) {
    sendJson(response, 404, { error: "Build the lab with npm run build before serving it from the API process." });
    return;
  }
  const requested = fileInsideDist(request.url ?? "/");
  if (!requested) {
    response.writeHead(403).end();
    return;
  }
  const path = existsSync(requested) && statSync(requested).isFile() ? requested : join(distDir, "index.html");
  if (!existsSync(path)) {
    sendJson(response, 404, { error: "Lab files were not found." });
    return;
  }
  const body = readFileSync(path);
  response.writeHead(200, { "Content-Type": mime[extname(path)] ?? "application/octet-stream" });
  response.end(body);
}

const server = createServer(async (request, response) => {
  const url = request.url?.split("?")[0] ?? "/";
  if (request.method === "GET" && url === "/api/chaos-core") {
    sendJson(response, 200, { configured: gemmaConfigured() });
    return;
  }
  if (request.method === "POST" && url === "/api/chaos-core") {
    try {
      const raw = await readBody(request);
      const body: unknown = raw ? JSON.parse(raw) : null;
      const prompt = typeof (body as { prompt?: unknown } | null)?.prompt === "string"
        ? (body as { prompt: string }).prompt.trim()
        : "";
      if (!prompt) {
        sendJson(response, 400, { error: "Describe an experiment first." });
        return;
      }
      if (prompt.length > 400) {
        sendJson(response, 400, { error: "Keep the experiment under 400 characters." });
        return;
      }
      if (rateLimited(clientAddress(request))) {
        sendJson(response, 200, {
          source: "preset",
          notice: "Gemma is rate-limited, so a preset experiment was used.",
          plan: presetFor(prompt),
        });
        return;
      }
      const result = await interpretExperiment(prompt);
      console.info(`chaos-core ${result.source}`);
      sendJson(response, 200, result);
    } catch (error) {
      const tooLarge = error instanceof Error && error.message === "too-large";
      if (tooLarge) {
        sendJson(response, 413, { error: "That request is too large." });
        return;
      }
      sendJson(response, 400, { error: "Send a JSON object with a prompt string." });
    }
    return;
  }
  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }
  response.writeHead(405).end();
});

server.listen(port, host, () => {
  console.info(`CHAOS CORE listening on http://${host}:${port}`);
});
