import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import { randomUUID } from "crypto";
import {
  apiLimiter,
  pollingLimiter,
  strictLimiter,
} from "../src/middlewares/rateLimiters.js";

const PORT = 8099;
const TEST_TAG = `sec-test-${Date.now()}`;

function makeEmail(i) {
  return `${TEST_TAG}-user-${i}@example.com`;
}

async function request(path, { method = "GET", body, ip = "10.0.0.1" } = {}) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { status: res.status, data };
}

function printResult(name, pass, details = "") {
  const label = pass ? "PASS" : "FAIL";
  console.log(`${label} - ${name}${details ? ` (${details})` : ""}`);
}

async function main() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());

  app.use("/api", apiLimiter);

  app.post("/auth/login", async (req, res) => {
    const password = req.body?.password;
    if (password !== "ok") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.json({ ok: true });
  });

  app.get("/auth/google", (req, res) => {
    res.json({ ok: true });
  });
  app.get("/auth/google/callback", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/ping", (req, res) => res.json({ ok: true }));
  app.post("/api/payment/verify", strictLimiter, (req, res) =>
    res.status(400).json({ error: "Invalid payment payload" }),
  );
  app.get("/api/payment/status/:orderId", pollingLimiter, (req, res) =>
    res.json({ ok: true }),
  );
  app.post("/api/payment/webhook", (req, res) => res.json({ ok: true }));

  const server = app.listen(PORT);

  try {
    // 1) 100 normal users login -> ALL allowed
    let normalAllowed = 0;
    for (let i = 0; i < 100; i++) {
      const r = await request("/auth/login", {
        method: "POST",
        body: { email: makeEmail(i), password: "ok" },
        ip: "100.64.0.10",
      });
      if (r.status === 200) normalAllowed++;
    }
    printResult("100 normal users login", normalAllowed === 100, `allowed=${normalAllowed}`);

    // 2) 1 attacker tries 50 passwords -> denied but not rate-limited
    const attackerEmail = `${TEST_TAG}-attacker@example.com`;
    let denied = 0;
    for (let i = 0; i < 50; i++) {
      const r = await request("/auth/login", {
        method: "POST",
        body: { email: attackerEmail, password: "wrong" },
        ip: "100.64.0.11",
      });
      if (r.status === 401) denied++;
    }
    printResult(
      "Attacker 50 password attempts",
      denied === 50,
      `denied=${denied}`,
    );

    // 3) 1 IP spams API requests -> blocked by baseline limiter
    const spamResults = await Promise.all(
      Array.from({ length: 180 }).map(() =>
        request("/api/ping", { ip: "100.64.0.12" }),
      ),
    );
    const spamBlocked = spamResults.filter((r) => r.status === 429).length;
    printResult("IP burst spam blocked", spamBlocked > 0, `blocked=${spamBlocked}`);

    // 4) Razorpay webhook retries -> allowed
    const webhookResults = await Promise.all(
      Array.from({ length: 25 }).map(() =>
        request("/api/payment/webhook", {
          method: "POST",
          ip: "100.64.0.13",
          body: { event: "payment.captured", id: randomUUID() },
        }),
      ),
    );
    const webhookAllAllowed = webhookResults.every((r) => r.status === 200);
    printResult(
      "Webhook retries allowed",
      webhookAllAllowed,
      `ok=${webhookResults.filter((r) => r.status === 200).length}`,
    );

    // 5) Payment verify abuse -> blocked by strict limiter
    const orderId = `${TEST_TAG}-order-1`;
    const payResults = await Promise.all(
      Array.from({ length: 25 }).map(() =>
        request("/api/payment/verify", {
          method: "POST",
          ip: "100.64.0.14",
          body: { razorpay_order_id: orderId },
        }),
      ),
    );
    const payBlocked = payResults.filter((r) => r.status === 429).length;
    printResult("Payment verify abuse blocked", payBlocked > 0, `blocked=${payBlocked}`);

    // 6) OPTIONS preflight is ignored by limiter
    const preflightResults = await Promise.all(
      Array.from({ length: 50 }).map(() =>
        request("/api/payment/verify", {
          method: "OPTIONS",
          ip: "100.64.0.16",
        }),
      ),
    );
    const preflightBlocked = preflightResults.filter((r) => r.status === 429).length;
    printResult("OPTIONS preflight not limited", preflightBlocked === 0, `blocked=${preflightBlocked}`);

    // 7) Polling endpoint has higher threshold and remains available at moderate load
    const pollingResults = await Promise.all(
      Array.from({ length: 150 }).map(() =>
        request(`/api/payment/status/${orderId}`, {
          ip: "100.64.0.17",
        }),
      ),
    );
    const pollingAllAllowed = pollingResults.every((r) => r.status === 200);
    printResult("Polling endpoint high-throughput allowed", pollingAllAllowed);

    // 8) Google OAuth routes allowed
    const g1 = await request("/auth/google", { ip: "100.64.0.15" });
    const g2 = await request("/auth/google/callback", { ip: "100.64.0.15" });
    printResult(
      "Google OAuth routes allowed",
      g1.status === 200 && g2.status === 200,
      `statuses=${g1.status},${g2.status}`,
    );

    console.log("Security test run complete.");
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error("Security test failed:", err);
  process.exit(1);
});




