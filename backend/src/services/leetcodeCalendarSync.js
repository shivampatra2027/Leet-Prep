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

  // Read raw text first to detect HTML or unexpected responses
  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("LeetCode GraphQL returned non-JSON response", {
      status: response.status,
      snippet: raw?.slice?.(0, 500)
    });
    throw new Error("Unexpected response from LeetCode API");
  }

  if (data.errors) {
    console.error("LeetCode GraphQL errors:", data.errors);
    throw new Error("LeetCode API returned errors");
  }

  const calendarStr = data.data?.matchedUser?.userCalendar?.submissionCalendar;
  if (!calendarStr) {
    console.error("LeetCode calendar missing for user", { username, data });
    throw new Error("LeetCode calendar not found for user");
  }

  let calendar;
  try {
    calendar = JSON.parse(calendarStr);
  } catch (err) {
    console.error("Failed to parse submissionCalendar JSON", {
      username,
      snippet: calendarStr?.slice?.(0, 500)
    });
    throw new Error("Invalid calendar data from LeetCode API");
  }

  for (const timestamp in calendar) {
    try {
      const date = new Date(Number(timestamp) * 1000)
        .toISOString()
        .split("T")[0];

      await DailyActivity.updateOne(
        { user: userId, date, platform: "leetcode" },
        { $set: { count: calendar[timestamp] } },
        { upsert: true }
      );
    } catch (err) {
      console.warn("Failed to upsert daily activity", { username, timestamp, err: err.message });
      // continue processing other days
    }
  }
}
