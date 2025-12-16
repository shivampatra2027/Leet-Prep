import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Crown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          // Handle unauthorized or other errors
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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
          <div className="flex flex-col items-center gap-3">
            {user.isPremium ? (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-green-500/15 px-4 py-1 text-base font-medium text-green-600 hover:bg-green-500/25 dark:text-green-400"
              >
                <CheckCircle className="h-4 w-4" />
                Premium Member
              </Badge>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Badge variant="secondary" className="text-muted-foreground">
                  Free Plan
                </Badge>
                <Button className="gap-2">
                  <Crown className="h-4 w-4" />
                  Get Premium
                </Button>
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
