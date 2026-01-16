// components/Navbar.jsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button.jsx";
import { LogOut, Heart, Bell } from "lucide-react";
import axios from "axios";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const token = React.useMemo(() => localStorage.getItem("authToken"), []);
  const isLoggedIn = !!token;

  const [likes, setLikes] = React.useState(0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  // 🔔 Bell state
  const [showBellBox, setShowBellBox] = React.useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  React.useEffect(() => {
    axios
      .get(`${API_URL}/api/likes`)
      .then((res) => {
        setLikes(res.data.totalLikes || 0);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to fetch likes:", err);
        setError(true);
      });

    if (localStorage.getItem("hasLikedSite") === "true") {
      setHasLiked(true);
    }
  }, [API_URL]);

  const handleLike = async () => {
    if (hasLiked || loading) return;

    setLoading(true);
    setError(false);

    try {
      const res = await axios.post(`${API_URL}/api/likes`);
      setLikes(res.data.totalLikes);
      setHasLiked(true);
      localStorage.setItem("hasLikedSite", "true");
    } catch (err) {
      console.error("Like failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("authToken");
    navigate("/login");
  }, [navigate]);

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo / Brand */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  Leet-Prep
                </span>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Center Navigation Links */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isLoggedIn && (
              <>
                <NavigationMenuItem className="relative">
                  <NavigationMenuLink asChild>
                    <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                  <span
                    className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-background animate-pulse"
                    aria-hidden="true"
                  />
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/profile" className={navigationMenuTriggerStyle()}>
                      Profile
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 relative">
          {/* Auth Buttons */}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="sm:inline-flex">
                Login
              </Button>
            </Link>
          )}

          {/* Like Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            disabled={hasLiked || loading}
            className={`
              relative flex items-center gap-2 border 
              transition-all duration-300
              ${hasLiked
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "hover:border-foreground/30"
              }
              ${error ? "border-red-500/50 text-red-600 dark:text-red-400" : ""}
            `}
            aria-label={hasLiked ? "Thank you for your support!" : "Support this project"}
          >
            <Heart
              className={`
                h-4 w-4 transition-all duration-300
                ${hasLiked ? "fill-current scale-110" : ""}
                ${loading ? "animate-pulse" : ""}
              `}
            />
            <span className="font-semibold tabular-nums">
              {error ? "!" : likes}
            </span>
            {hasLiked && (
              <span className="text-xs opacity-80">Thanks!</span>
            )}
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            )}
          </Button>
          
          <div className="relative group">
            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Dropdown box appears on hover */}
            <div
              className="absolute right-0 mt-2 w-64 rounded-md border bg-background shadow-lg p-4 text-sm opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform -translate-y-2 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto"
            >
              <p className="font-semibold text-foreground">Notifications</p>
              <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>LeetCode Buddy – Profile compare chrome extension rolling out soon 🚀</li>
                <li>AI-based Code Editor with debug features coming soon 🤖</li>
              </ul>
            </div>
          </div>
          {/* Theme Toggle */}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
