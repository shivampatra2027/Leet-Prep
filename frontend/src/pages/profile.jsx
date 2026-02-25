import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown, Loader2, RefreshCw, Code2, Clock } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card.jsx";

import Navbar from "@/components/Navbar.jsx";
import api, { profileAPI } from "@/lib/api.js";
import { calculatePremiumTimeRemaining, formatPremiumExpiryDate } from "@/utils/premiumTimer.js";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isEditingLeetcode, setIsEditingLeetcode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [premiumTimer, setPremiumTimer] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

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
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.leetcodeUsername) {
        setActivityData([]);
        return;
      }
      try {
        setActivityLoading(true);
        const res = await profileAPI.getLeetcodeActivity(365);
        setActivityData(res.data?.activity || []);
      } catch {
        setActivityData([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, [user?.leetcodeUsername, user?.lastLeetcodeSync]);

  // ---------------- PREMIUM TIMER ----------------
  useEffect(() => {
    if (!user?.premiumExpiresAt || user?.tier !== "premium") {
      setPremiumTimer(null);
      return;
    }

    // Update timer immediately
    const updateTimer = () => {
      const timeRemaining = calculatePremiumTimeRemaining(user.premiumExpiresAt);
      setPremiumTimer(timeRemaining);
    };

    updateTimer();

    // Update every minute if less than 1 day, otherwise every hour
    const timerData = calculatePremiumTimeRemaining(user.premiumExpiresAt);
    const interval = timerData.days < 1 ? 60000 : 3600000; // 1 minute or 1 hour

    const intervalId = setInterval(updateTimer, interval);

    return () => clearInterval(intervalId);
  }, [user?.premiumExpiresAt, user?.tier]);

  // ---------------- UPDATE USERNAME ----------------
  const handleUpdateLeetcodeUsername = async () => {
    if (!leetcodeUsername.trim()) {
      setSyncMessage("Please enter a valid username");
      setTimeout(() => setSyncMessage(""), 3000);
      return;
    }

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
      const errorMsg = err.response?.data?.error || "Failed to update username";
      setSyncMessage(errorMsg);
      setTimeout(() => setSyncMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SYNC SOLVED ----------------
  const handleSyncLeetcode = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");

      const response = await profileAPI.syncLeetcode();

      setUser(prev => ({
        ...prev,
        solvedProblemsCount: response.data.solvedCount,
        lastLeetcodeSync: response.data.lastSync
      }));

      setSyncMessage("LeetCode progress synced successfully!");
      setTimeout(() => setSyncMessage(""), 5000);
    } catch {
      setSyncMessage("Failed to sync LeetCode progress");
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
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1 block">
                          LeetCode Username
                        </label>
                        <Input
                          value={leetcodeUsername}
                          onChange={e => setLeetcodeUsername(e.target.value)}
                          placeholder="Enter LeetCode username"
                          className="w-full"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateLeetcodeUsername();
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={handleUpdateLeetcodeUsername}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingLeetcode(false);
                            setLeetcodeUsername(user.leetcodeUsername || "");
                            setSyncMessage("");
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">
                            Username: {user.leetcodeUsername}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Solved: {user.solvedProblemsCount || 0}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingLeetcode(true)}
                          className="h-8 w-8 p-0"
                          title="Edit username"
                        >
                          <span className="text-lg">Edit</span>
                        </Button>
                      </div>

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

                      <div className="mt-4 rounded-md border p-3">
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          LeetCode Heatmap (Last 365 days)
                        </p>
                        {activityLoading ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        ) : (
                          <>
                            <CalendarHeatmap
                              startDate={new Date(new Date().setDate(new Date().getDate() - 364))}
                              endDate={new Date()}
                              values={activityData}
                              classForValue={(value) => {
                                if (!value || !value.count) return "color-empty";
                                if (value.count >= 10) return "color-github-4";
                                if (value.count >= 6) return "color-github-3";
                                if (value.count >= 3) return "color-github-2";
                                return "color-github-1";
                              }}
                              tooltipDataAttrs={(value) => {
                                if (!value || !value.date) return null;
                                return {
                                  "data-tip": `${value.date}: ${value.count || 0} submissions`,
                                };
                              }}
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                              {activityData.length === 0
                                ? "No synced activity yet. Click Sync to load calendar data."
                                : "Data source: LeetCode submission calendar."}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {syncMessage && (
                <p className={`text-sm text-center mt-2 ${
                  syncMessage.includes('Failed') || syncMessage.includes('error') || syncMessage.includes('Invalid') || syncMessage.includes('Please')
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {syncMessage}
                </p>
              )}
            </div>

            {/* ---------- TIER ---------- */}
            <div className="border-t pt-6">
              <div className="text-center mb-4">
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

              {/* Premium Timer */}
              {user.tier === "premium" && user.premiumExpiresAt && premiumTimer && !premiumTimer.isExpired && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{premiumTimer.display}</span>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    Expires: {formatPremiumExpiryDate(user.premiumExpiresAt)}
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
