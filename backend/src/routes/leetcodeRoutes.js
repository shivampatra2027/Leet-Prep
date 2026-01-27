import express from "express"

const router = express.Router();
router.get("/:username",async(req,res)=>{
    const {username} = req.params;
    const query = `query getUserProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        problemsSolved {
          title
          titleSlug
          difficulty
        }
      }
    }
    `;
    try {
        const response = await fetch(process.env.LEETCODE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables: { username } }),
        });
        const data = await response.json();
        if(!data.data?.matchedUser){
            return res.status(404).json({
                message:"User not found!"
            })
        }
        res.send(data.data.matchedUser.problemsSolved);
    } catch (error) {
        console.error("LeetCode API error:", error); res.status(500).json({ error: "Failed to fetch solved problems" });
    }
})

export default router;