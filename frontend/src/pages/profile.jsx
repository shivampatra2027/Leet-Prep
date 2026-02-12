import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown, Loader2, RefreshCw, Code2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card.jsx";

import Navbar from "@/components/Navbar.jsx";
import api, { profileAPI } from "@/lib/api.js";
import LeetCodeHeatmap from "@/components/Heatmap.jsx";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isEditingLeetcode, setIsEditingLeetcode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const navigate = useNavigate();

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile", {
          withCredentials: true
        });

        setUser(response.data);
        setLeetcodeUsername(response.data.leetcodeUsername || "");
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // ---------------- UPDATE USERNAME ----------------
  const handleUpdateLeetcodeUsername = async () => {
    try {
      setLoading(true);
      setSyncMessage("");

      await profileAPI.updateLeetcodeUsername(leetcodeUsername);

      setUser(prev => ({
        ...prev,
        leetcodeUsername
      }));

      setIsEditingLeetcode(false);
      setSyncMessage("LeetCode username updated successfully!");
      setTimeout(() => setSyncMessage(""), 3000);
    } catch (err) {
      setSyncMessage("Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- 🔥 SYNC SOLVED + HEATMAP ----------------
  const handleSyncLeetcode = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");

      // 1️⃣ Sync solved problems
      const response = await profileAPI.syncLeetcode();

      // 2️⃣ 🔥 Sync heatmap calendar
      await api.post(
        "/api/leetcode/sync-calendar",
        {},
        { withCredentials: true }
      );

      setUser(prev => ({
        ...prev,
        solvedProblemsCount: response.data.solvedCount,
        lastLeetcodeSync: response.data.lastSync
      }));

      setSyncMessage("LeetCode progress & activity synced successfully!");
      setTimeout(() => setSyncMessage(""), 5000);
    } catch (err) {
      setSyncMessage("Failed to sync LeetCode activity");
    } finally {
      setIsSyncing(false);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ---------------- UI ----------------
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Navbar />

      <div className="flex flex-1 justify-center p-4">
        <Card className="w-full max-w-md border-none shadow-xl">
          <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/30" />

          <CardHeader className="relative flex flex-col items-center pb-2">
            <Avatar className="absolute -top-16 h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-4xl font-bold">
                {user.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* ---------- LeetCode Integration ---------- */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">LeetCode Integration</h3>
              </div>

              {!user.leetcodeUsername && !isEditingLeetcode ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditingLeetcode(true)}
                >
                  Add LeetCode Username
                </Button>
              ) : (
                <>
                  {isEditingLeetcode ? (
                    <>
                      <Input
                        value={leetcodeUsername}
                        onChange={e => setLeetcodeUsername(e.target.value)}
                        placeholder="Enter LeetCode username"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          className="flex-1"
                          onClick={handleUpdateLeetcodeUsername}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingLeetcode(false);
                            setLeetcodeUsername(user.leetcodeUsername);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        Username: {user.leetcodeUsername}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solved: {user.solvedProblemsCount || 0}
                      </p>

                      <Button
                        className="w-full mt-2 gap-2"
                        onClick={handleSyncLeetcode}
                        disabled={isSyncing}
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Sync LeetCode Progress
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}

              {syncMessage && (
                <p className="text-sm text-center mt-2 text-green-600">
                  {syncMessage}
                </p>
              )}
            </div>

            {/* ---------- 🔥 HEATMAP ---------- */}
            {user.leetcodeUsername && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">
                  LeetCode Activity
                </h3>
                <LeetCodeHeatmap />
              </div>
            )}

            {/* ---------- TIER ---------- */}
            <div className="border-t pt-6 text-center">
              {user.tier === "premium" ? (
                <Badge className="bg-green-500/20 text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Premium Member
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Crown className="h-4 w-4 mr-1" />
                  Free Plan
                </Badge>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
