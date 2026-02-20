import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import { randomUUID } from "crypto";
import floodLimiter from "../src/middlewares/security/floodLimiter.js";
import behaviorDetector from "../src/middlewares/security/behaviorDetector.js";
import paymentVerifyLimiter from "../src/middlewares/security/paymentLimiter.js";
import {
  clearLoginFailures,
  preLoginCheck,
  recordLoginFailure,
} from "../src/middlewares/security/loginLimiter.js";

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
  app.set("trust proxy", true);
  app.use(express.json());

  app.use("/api", behaviorDetector(), floodLimiter());

  app.post("/auth/login", preLoginCheck, async (req, res) => {
    const email = (req.body?.email || "").toLowerCase();
    const password = req.body?.password;
    if (password !== "ok") {
      await recordLoginFailure(email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    await clearLoginFailures(email);
    return res.json({ ok: true });
  });

  app.get("/auth/google", floodLimiter(), (req, res) => {
    res.json({ ok: true });
  });
  app.get("/auth/google/callback", floodLimiter(), (req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/ping", (req, res) => res.json({ ok: true }));
  app.post("/api/payment/verify", paymentVerifyLimiter(), (req, res) =>
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

    // 2) 1 attacker tries 50 passwords -> blocked/captcha
    const attackerEmail = `${TEST_TAG}-attacker@example.com`;
    let blockedOrCaptcha = 0;
    for (let i = 0; i < 50; i++) {
      const r = await request("/auth/login", {
        method: "POST",
        body: { email: attackerEmail, password: "wrong" },
        ip: "100.64.0.11",
      });
      if (r.status === 429 || r.status === 403) blockedOrCaptcha++;
    }
    printResult(
      "Attacker 50 password attempts",
      blockedOrCaptcha > 0,
      `blocked_or_captcha=${blockedOrCaptcha}`,
    );

    // 3) 1 IP spams 100 requests -> blocked
    const spamResults = await Promise.all(
      Array.from({ length: 100 }).map(() =>
        request("/api/ping", { ip: "100.64.0.12" }),
      ),
    );
    const spamBlocked = spamResults.filter((r) => r.status === 429).length;
    printResult("IP burst spam 100 requests", spamBlocked > 0, `blocked=${spamBlocked}`);

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

    // 5) Payment verify spam -> blocked
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
    printResult("Payment verify spam blocked", payBlocked > 0, `blocked=${payBlocked}`);

    // 6) Google OAuth routes allowed
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




