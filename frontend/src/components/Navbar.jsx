// components/Navbar.jsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button.jsx";
import { LogOut } from "lucide-react";

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

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem("authToken");
    navigate("/login");
  }, [navigate]);

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo / Home */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className="flex items-center text-lg font-bold">
                Leet.io
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Center: Navigation Links */}
        <NavigationMenu>
          <NavigationMenuList className="gap-6">
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuItem>

            {isLoggedIn && (
              <NavigationMenuItem className="relative">
                <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
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

        {/* Right: Auth Actions + Theme Toggle */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <>
              {/* Login Button with Green Dot when NOT logged in */}
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

          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}