import cron from "node-cron";
import User from "../models/User.js"

import {syncLeetCodeUser} from "./service/leetcodeSync.js";


cron.schedule("0 */6 * * *",async()=>{
    const users = await User.find({
        leetcodeUsername: {$exits:true,$ne:null}
    });


    for(const user of users){
        try {
            await syncLeetCodeUser(user);
        } catch (error) {
            console.error("Leetcode sync failed",user.leetcodeUsername);
        }
    }
});