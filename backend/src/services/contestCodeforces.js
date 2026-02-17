import axios from "axios";

async function getCodeforcesContests() {
  try {
    const res = await axios.get("https://codeforces.com/api/contest.list", {
      timeout: 10000,
    });

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return res.data.result
      .filter((c) => {
        if (c.phase === "BEFORE") return true; // Upcoming
        const endTime = (c.startTimeSeconds + c.durationSeconds) * 1000;
        return c.phase === "FINISHED" && endTime > oneWeekAgo; // Finished within last week
      })
      .map((c) => ({
        platform: "Codeforces",
        name: c.name,
        startTime: c.startTimeSeconds * 1000,
        endTime: (c.startTimeSeconds + c.durationSeconds) * 1000,
        url: `https://codeforces.com/contests/${c.id}`,
        duration: c.durationSeconds,
      }));
  } catch (error) {
    console.error("Codeforces fetch error:", error.message);
    return [];
  }
}

export default getCodeforcesContests;
