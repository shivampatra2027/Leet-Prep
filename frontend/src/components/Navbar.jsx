// components/Navbar.jsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button.jsx";
import { LogOut, Heart, Bell, Menu, X } from "lucide-react";
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
  const [token, setToken] = React.useState(() => localStorage.getItem("authToken"));
  const isLoggedIn = !!token;

  const [likes, setLikes] = React.useState(0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  // Keep token in sync (login/logout/storage)
  React.useEffect(() => {
    const updateToken = () => setToken(localStorage.getItem("authToken"));
    window.addEventListener("storage", updateToken);
    window.addEventListener("focus", updateToken);
    return () => {
      window.removeEventListener("storage", updateToken);
      window.removeEventListener("focus", updateToken);
    };
  }, []);

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

  const closeMobile = () => setMobileOpen(false);

  const mainLinks = [
    { to: "/", label: "Home", auth: "any" },
    { to: "/dashboard", label: "Dashboard", auth: "authed" },
    { to: "/contests", label: "Contests", auth: "authed" },
    { to: "/resume-analyzer", label: "Resume Analyzer", auth: "authed" },
    { to: "/profile", label: "Profile", auth: "authed" },
    { to: "/premium", label: "Premium", auth: "any" },
    { to: "/login", label: "Login", auth: "guest" },
  ].filter((link) => {
    if (link.auth === "any") return true;
    if (link.auth === "authed") return isLoggedIn;
    return !isLoggedIn;
  });

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Logo / Brand */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className="flex items-center">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
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
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                      Dashboard
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/contests" className={navigationMenuTriggerStyle()}>
                      Contests
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/resume-analyzer" className={navigationMenuTriggerStyle()}>
                      Resume Analyzer
                    </Link>
                  </NavigationMenuLink>
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
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 relative">
          <button
            className="md:hidden rounded-lg border px-2 py-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link to="/premium" className="block">
            <Button
              variant="secondary"
              size="sm"
              className="border-primary/40 px-2.5 sm:px-3 md:px-4 text-xs sm:text-sm"
              onClick={closeMobile}
            >
              <span className="hidden xs:inline">Premium</span>
              <span className="xs:hidden">Pro</span>
            </Button>
          </Link>
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
              relative flex items-center gap-1.5 sm:gap-2 border px-2 sm:px-3
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
                h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all duration-300
                ${hasLiked ? "fill-current scale-110" : ""}
                ${loading ? "animate-pulse" : ""}
              `}
            />
            <span className="font-semibold tabular-nums text-xs sm:text-sm">
              {error ? "!" : likes}
            </span>
            {hasLiked && (
              <span className="hidden sm:inline text-xs opacity-80">Thanks!</span>
            )}
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            )}
          </Button>
          
          <div className="relative group hidden sm:block">
            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Dropdown box appears on hover */}
            <div
              className="absolute right-0 mt-2 w-64 sm:w-72 rounded-md border bg-background shadow-lg p-3 sm:p-4 text-xs sm:text-sm opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform -translate-y-2 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto"
            >
              <p className="font-semibold text-foreground">Notifications</p>
              <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                <li>LeetCode Buddy – Profile compare chrome extension rolling out soon</li>
                <li>AI-based Code Editor with debug features coming soon</li>
              </ul>
            </div>
          </div>
          {/* Theme Toggle */}
          <ModeToggle />
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  className="rounded-xl border bg-card/70 px-4 py-3 text-sm font-semibold text-foreground flex items-center justify-center hover:border-primary/40 transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between">
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    closeMobile();
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Link to="/login" onClick={closeMobile}>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              )}

              <ModeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
