import cron from "node-cron";
import getLeetCode from "../services/contestLeetcode.js";
import getCodeforces from "../services/contestCodeforces.js";
import getCodeChef from "../services/contestCodechef.js";
import getAtCoder from "../services/contestAtcoder.js";
import { setContests } from "../utils/contestStore.js";

async function updateContests() {
  try {
    console.log("🔄 Fetching contests from all platforms...");

    const [lc, cf, cc, ac] = await Promise.allSettled([
      getLeetCode(),
      getCodeforces(),
      getCodeChef(),
      getAtCoder(),
    ]);

    const allContests = [
      ...(lc.status === "fulfilled" ? lc.value : []),
      ...(cf.status === "fulfilled" ? cf.value : []),
      ...(cc.status === "fulfilled" ? cc.value : []),
      ...(ac.status === "fulfilled" ? ac.value : []),
    ];

    setContests(allContests);
    console.log(`✅ Contests updated: ${allContests.length} upcoming contests`);
  } catch (e) {
    console.error("❌ Contest fetch error:", e.message);
  }
}

// Run every 4 hours
cron.schedule("0 */4 * * *", updateContests);

// Initial fetch
updateContests();

export default updateContests;
