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

    // 🔥 CRITICAL FIX
    if (!response.ok) {
        console.error("LeetCode API HTTP error", {
            status: response.status,
            statusText: response.statusText
        });
        throw new Error(`LeetCode API failed with status ${response.status}`);
    }

    const raw = await response.text();

    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        console.error("LeetCode returned non-JSON", {
            snippet: raw?.slice?.(0, 300)
        });
        throw new Error("Unexpected response from LeetCode API");
    }

    if (data.errors) {
        console.error("LeetCode GraphQL errors:", data.errors);
        throw new Error("LeetCode API returned errors");
    }

    const calendarStr =
        data.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!calendarStr) {
        console.error("Calendar missing", { username });
        throw new Error("LeetCode calendar not found");
    }

    let calendar;
    try {
        calendar = JSON.parse(calendarStr);
    } catch {
        throw new Error("Invalid submissionCalendar JSON");
    }

    for (const timestamp in calendar) {
        const date = new Date(Number(timestamp) * 1000)
            .toISOString()
            .split("T")[0];

        try {
            await DailyActivity.updateOne(
                { user: userId, date, platform: "leetcode" },
                { $set: { count: calendar[timestamp] } },
                { upsert: true }
            );
        } catch (err) {
            console.warn("Upsert failed", {
                date,
                err: err.message
            });
        }
    }
}
