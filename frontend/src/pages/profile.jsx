import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown, Loader2, Clock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card.jsx";

import Navbar from "@/components/Navbar.jsx";
import api from "@/lib/api.js";
import { calculatePremiumTimeRemaining, formatPremiumExpiryDate } from "@/utils/premiumTimer.js";

const formatProfileDate = (value) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumTimer, setPremiumTimer] = useState(null);

  const navigate = useNavigate();

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile", {
          withCredentials: true
        });

        setUser(response.data);
      } catch (err) {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        {/* <Navbar /> */}
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
      {/* <Navbar /> */}

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
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm font-medium text-foreground">
                  {formatProfileDate(user.createdAt)}
                </span>
              </div>

              {user.tier === "premium" && user.premiumExpiresAt && (
                <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Premium Expires
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatPremiumExpiryDate(user.premiumExpiresAt)}
                  </span>
                </div>
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
