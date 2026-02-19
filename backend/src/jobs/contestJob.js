import cron from "node-cron";
import getLeetCode from "../services/contestLeetcode.js";
import getCodeforces from "../services/contestCodeforces.js";
import getCodeChef from "../services/contestCodechef.js";
import getAtCoder from "../services/contestAtcoder.js";
import { setContests } from "../utils/contestStore.js";

let running = false;

async function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

async function updateContests() {
  if (running) return;
  running = true;

  const start = Date.now();
  console.log("🔄 Fetching contests from all platforms...");

  try {
    const [lc, cf, cc, ac] = await Promise.allSettled([
      withTimeout(getLeetCode(), 15000),
      withTimeout(getCodeforces(), 15000),
      withTimeout(getCodeChef(), 15000),
      withTimeout(getAtCoder(), 15000),
    ]);

    const allContests = [
      ...(lc.status === "fulfilled" ? lc.value : []),
      ...(cf.status === "fulfilled" ? cf.value : []),
      ...(cc.status === "fulfilled" ? cc.value : []),
      ...(ac.status === "fulfilled" ? ac.value : []),
    ];

    setContests(allContests);

    console.log(
      `✅ Contests updated: ${allContests.length} upcoming contests (${Date.now() - start}ms)`
    );
  } catch (e) {
    console.error("❌ Contest fetch error:", e.message);
  } finally {
    running = false;
  }
}

// runs every 6 hours
cron.schedule("0 */6 * * *", updateContests);

setTimeout(updateContests, 20000);

export default updateContests;
