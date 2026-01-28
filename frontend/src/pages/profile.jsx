import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [isEditingLeetcode, setIsEditingLeetcode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/api/profile");
        setUser(response.data);
        setLeetcodeUsername(response.data.leetcodeUsername || "");
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // The interceptor will handle 401 errors automatically
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdateLeetcodeUsername = async () => {
    try {
      setLoading(true);
      setSyncMessage("");
      await profileAPI.updateLeetcodeUsername(leetcodeUsername);
      setUser({ ...user, leetcodeUsername });
      setIsEditingLeetcode(false);
      setSyncMessage("LeetCode username updated successfully!");
      setTimeout(() => setSyncMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update LeetCode username:", error);
      setSyncMessage(error.response?.data?.error || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLeetcode = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage("");
      const response = await profileAPI.syncLeetcode();
      setUser({ 
        ...user, 
        solvedProblemsCount: response.data.solvedCount,
        lastLeetcodeSync: response.data.lastSync 
      });
      setSyncMessage(`Synced ${response.data.solvedCount} problems successfully!`);
      setTimeout(() => setSyncMessage(""), 5000);
    } catch (error) {
      console.error("Failed to sync LeetCode data:", error);
      setSyncMessage(error.response?.data?.error || "Failed to sync LeetCode data");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/30">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/30">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden border-none shadow-xl">
        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/30" />
        <CardHeader className="relative flex flex-col items-center pb-2">
          <Avatar className="absolute -top-16 h-32 w-32 border-4 border-background shadow-sm">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="text-4xl font-bold">
              {user.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight">{user.username}</h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pb-8">
          {/* LeetCode Integration Section */}
          <div className="w-full border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">LeetCode Integration</h3>
            </div>
            
            {!user.leetcodeUsername && !isEditingLeetcode ? (
              <div className="text-center space-y-3">
                <CardDescription>
                  Connect your LeetCode account to automatically track solved problems
                </CardDescription>
                <Button 
                  onClick={() => setIsEditingLeetcode(true)}
                  variant="outline"
                  className="w-full"
                >
                  Add LeetCode Username
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {isEditingLeetcode ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter LeetCode username"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUpdateLeetcodeUsername}
                        disabled={!leetcodeUsername.trim() || loading}
                        className="flex-1"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingLeetcode(false);
                          setLeetcodeUsername(user.leetcodeUsername || "");
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{user.leetcodeUsername}</p>
                      </div>
                      <Button 
                        onClick={() => setIsEditingLeetcode(true)}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Solved Problems</p>
                        <p className="font-medium">{user.solvedProblemsCount || 0} problems</p>
                        {user.lastLeetcodeSync && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last synced: {new Date(user.lastLeetcodeSync).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSyncLeetcode}
                      disabled={isSyncing}
                      className="w-full gap-2"
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
                  </div>
                )}
                
                {syncMessage && (
                  <p className={`text-sm text-center ${syncMessage.includes("successfully") || syncMessage.includes("Synced") ? "text-green-600" : "text-red-600"}`}>
                    {syncMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tier Section */}
          <div className="w-full border-t pt-6">
            <div className="flex flex-col items-center gap-3">
              {user.tier === 'premium' ? (
                <div className="flex flex-col items-center gap-4 w-full">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-green-500/15 px-4 py-1 text-base font-medium text-green-600 hover:bg-green-500/25 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Premium Member
                  </Badge>
                  <Button onClick={() => navigate('/dashboard')} className="gap-2 w-full">
                    View Full Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  <Badge variant="secondary" className="text-muted-foreground">
                    Free Plan
                  </Badge>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Limited to 2 problems per company
                  </p>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">Get premium to access 1800+ premium problems..</p>
                  <Button className="gap-2 w-full">
                    <Crown className="h-4 w-4" />
                    {/* <Link to='/premium'>Get Premium</Link> */}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Profile;
