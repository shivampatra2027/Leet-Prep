import axios from "axios";
import User from "../models/User.js";
import DailyActivity from "../models/DailyActivity.js";

export async function syncLeetCodeUser(user) {
    if (!user.leetcodeUsername) return;

    const res = await axios.post(
        "https://leetcode.com/graphql",
        {
            query: `
        query userProfileCalendar($username: String!) {
          matchedUser(username: $username) {
            userCalendar {
              submissionCalendar
            }
          }
        }
      `,
            variables: { username: user.leetcodeUsername }
        },
        { headers: { "Content-Type": "application/json" } }
    );

    const raw =
        res?.data?.data?.matchedUser?.userCalendar?.submissionCalendar;

    if (!raw) return;

    const calendar = JSON.parse(raw);

    for (const ts in calendar) {
        const date = new Date(ts * 1000).toISOString().split("T")[0];

        await DailyActivity.updateOne(
            { user: user._id, date, platform: "leetcode" },
            { $set: { count: calendar[ts] } },
            { upsert: true }
        );
    }

    user.lastLeetcodeSync = new Date();
    await user.save();
}
