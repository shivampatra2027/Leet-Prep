import axios from "axios";
import * as cheerio from "cheerio";

async function getAtCoderContests() {
  try {
    const res = await axios.get("https://atcoder.jp/contests/", {
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

    // Find upcoming contests
    $("#contest-table-upcoming tbody tr").each((i, elem) => {
      const startStr = $(elem).find("td").eq(0).find("time").text().trim();
      const name = $(elem).find("td").eq(1).find("a").text().trim();
      const link = $(elem).find("td").eq(1).find("a").attr("href");
      const durationStr = $(elem).find("td").eq(2).text().trim();

      if (name && link && startStr) {
        const startTime = new Date(startStr).getTime();
        const duration = parseDuration(durationStr);
        const endTime = startTime + duration * 1000;

        if (startTime > now || endTime > oneWeekAgo) {
          contests.push({
            platform: "AtCoder",
            name: name,
            startTime: startTime,
            endTime: endTime,
            url: `https://atcoder.jp${link}`,
            duration: duration,
          });
        }
      }
    });

    return contests;
  } catch (error) {
    console.error("AtCoder fetch error:", error.message);
    return [];
  }
}

function parseDuration(str) {
  // Parse "01:40" or "100:00" format to seconds
  const match = str.match(/(\d+):(\d+)/);
  if (match) {
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60;
  }
  return 2 * 3600; // Default 2 hours
}

export default getAtCoderContests;
