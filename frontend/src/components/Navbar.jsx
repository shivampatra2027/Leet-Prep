// components/Navbar.jsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button.jsx";
import { LogOut, Heart } from "lucide-react";
import axios from "axios";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const token = React.useMemo(() => localStorage.getItem("authToken"), []);
  const isLoggedIn = !!token;

  const [likes, setLikes] = React.useState(0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  React.useEffect(() => {
    axios
      .get(`${API_URL}/api/likes`)
      .then((res) => setLikes(res.data.totalLikes))
      .catch(() => { });

    const liked = localStorage.getItem("hasLikedSite");
    if (liked) setHasLiked(true);
  }, [API_URL]);

  const handleLike = async () => {
    if (hasLiked || loading) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/likes`);
      setLikes(res.data.totalLikes);
      setHasLiked(true);
      localStorage.setItem("hasLikedSite", "true");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("authToken");
    navigate("/login");
  }, [navigate]);

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className="flex items-center text-lg font-bold">
                Leet-prep
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <NavigationMenu>
          <NavigationMenuList className="gap-6">
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuItem>

            {isLoggedIn && (
              <NavigationMenuItem className="relative">
                <Link to="/freedashboard" className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
                <span
                  className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-green-500 ring-4 ring-background animate-pulse"
                  aria-label="New activity on dashboard"
                />
              </NavigationMenuItem>
            )}

            {isLoggedIn && (
              <NavigationMenuItem>
                <Link to="/profile" className={navigationMenuTriggerStyle()}>
                  Profile
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <div className="relative">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <span
                  className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-4 ring-background animate-pulse"
                  aria-label="Log in to see your dashboard"
                />
              </div>

              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={hasLiked || loading}
            className={`flex items-center gap-2 ${hasLiked ? "text-green-600" : "text-muted-foreground hover:text-foreground"}`}
            aria-label={hasLiked ? "Thank you for liking!" : "Like this site"}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{likes}</span>
            {hasLiked && <span className="text-xs">Thanks!</span>}
          </Button>

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}