import DailyActivity from "../models/DailyActivity.js";

export async function syncLeetCodeCalendar(username, userId) {
    const query = `
    query userProfileCalendar($username: String!) {
      matchedUser(username: $username) {
        userCalendar {
          submissionCalendar
        }
      }
    }
  `;

    const response = await fetch(process.env.LEETCODE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query,
            variables: { username }
        })
    });

    const data = await response.json();

    if (!data.data?.matchedUser) {
        throw new Error("LeetCode user not found");
    }

    const calendar = JSON.parse(
        data.data.matchedUser.userCalendar.submissionCalendar
    );

    for (const timestamp in calendar) {
        const date = new Date(timestamp * 1000)
            .toISOString()
            .split("T")[0];

        await DailyActivity.updateOne(
            { user: userId, date, platform: "leetcode" },
            { $set: { count: calendar[timestamp] } },
            { upsert: true }
        );
    }
}
