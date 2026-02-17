import axios from "axios";

async function getLeetCodeContests() {
  try {
    const query = {
      query: `
        query {
          allContests {
            title
            titleSlug
            startTime
            duration
          }
        }
      `,
    };

    const res = await axios.post("https://leetcode.com/graphql", query, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return res.data.data.allContests
      .filter((c) => {
        const endTime = (c.startTime + c.duration) * 1000;
        return c.startTime * 1000 > now || endTime > oneWeekAgo; // Upcoming or ended within last week
      })
      .map((c) => ({
        platform: "LeetCode",
        name: c.title,
        startTime: c.startTime * 1000,
        endTime: (c.startTime + c.duration) * 1000,
        url: `https://leetcode.com/contest/${c.titleSlug}`,
        duration: c.duration,
      }));
  } catch (error) {
    console.error("LeetCode fetch error:", error.message);
    return [];
  }
}

export default getLeetCodeContests;
