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
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
  });

  // CRITICAL FIX
  if (!response.ok) {
    console.error("LeetCode API HTTP error", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`LeetCode API failed with status ${response.status}`);
  }

  const raw = await response.text();

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error("LeetCode returned non-JSON", {
      snippet: raw?.slice?.(0, 300),
    });
    throw new Error("Unexpected response from LeetCode API");
  }

  if (data.errors) {
    console.error("LeetCode GraphQL errors:", data.errors);
    const errorMsg = data.errors[0]?.message || "Unknown GraphQL error";
    throw new Error(`LeetCode error: ${errorMsg}`);
  }

  const matchedUser = data.data?.matchedUser;
  if (!matchedUser) {
    console.error("User not found on LeetCode", { username });
    throw new Error(`LeetCode user '${username}' not found or is private`);
  }

  const calendarStr = matchedUser.userCalendar?.submissionCalendar;
  if (!calendarStr) {
    console.error("Calendar missing", { username });
    throw new Error(
      "LeetCode calendar data not available (user may be private)",
    );
  }

  let calendar;
  try {
    calendar = JSON.parse(calendarStr);
  } catch {
    throw new Error("Invalid submissionCalendar JSON");
  }

  for (const timestamp in calendar) {
    const date = new Date(Number(timestamp) * 1000).toISOString().split("T")[0];

    try {
      await DailyActivity.updateOne(
        { user: userId, date, platform: "leetcode" },
        { $set: { count: calendar[timestamp] } },
        { upsert: true },
      );
    } catch (err) {
      console.warn("Upsert failed", {
        date,
        err: err.message,
      });
    }
  }
}
