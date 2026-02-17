import axios from "axios";
import * as cheerio from "cheerio";

async function getCodeChefContests() {
  try {
    const res = await axios.get("https://www.codechef.com/contests", {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const contests = [];
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Find contest rows (both upcoming and recent)
    $("table tbody tr").each((i, elem) => {
      const name = $(elem).find("td").eq(0).text().trim();
      const code = $(elem).find("td").eq(0).find("a").attr("href");
      const start = $(elem).find("td").eq(2).attr("data-start");

      if (name && start && code) {
        const startTime = parseInt(start) * 1000;
        const endTime = startTime + 3 * 60 * 60 * 1000;
        if (startTime > now || endTime > oneWeekAgo) {
          contests.push({
            platform: "CodeChef",
            name: name,
            startTime: startTime,
            endTime: endTime,
            url: `https://www.codechef.com${code}`,
            duration: 3 * 60 * 60,
          });
        }
      }
    });

    return contests;
  } catch (error) {
    console.error("CodeChef fetch error:", error.message);
    return [];
  }
}

export default getCodeChefContests;
