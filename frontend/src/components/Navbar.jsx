// components/Navbar.jsx
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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
              <Link
                to="/"
                className={navigationMenuTriggerStyle()}
              >
                Home
              </Link>
            </NavigationMenuItem>

            {isLoggedIn && (
              <NavigationMenuItem>
                <Link
                  to="/dashboard"
                  className={navigationMenuTriggerStyle()}
                >
                  Dashboard
                </Link>
              </NavigationMenuItem>
            )}
            {isLoggedIn && (
              <NavigationMenuItem>
                <Link
                  to="/profile"
                  className={navigationMenuTriggerStyle()}
                >
                  Profile
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right: Auth Actions + Theme Toggle */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
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