import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button.jsx";
import { LogOut, Heart, Menu, X } from "lucide-react";
import axios from "axios";

export default function Navbar() {
  const sidebarRef = React.useRef(null);
  const navigate = useNavigate();
  const [token, setToken] = React.useState(() => localStorage.getItem("authToken"));
  const isLoggedIn = !!token;

  const [likes, setLikes] = React.useState(0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

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

  React.useEffect(() => {
    const updateToken = () => setToken(localStorage.getItem("authToken"));
    window.addEventListener("storage", updateToken);
    window.addEventListener("focus", updateToken);
    return () => {
      window.removeEventListener("storage", updateToken);
      window.removeEventListener("focus", updateToken);
    };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const handlePointerDown = (event) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileOpen]);

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

  const desktopLinks = [
    { to: "/", label: "Home", auth: "any" },
    { to: "/dashboard", label: "Dashboard", auth: "authed" },
    { to: "/contest", label: "Contest", auth: "authed" },
    { to: "/resume-analyzer", label: "Resume Analyzer", auth: "authed" },
    { to: "/profile", label: "Profile", auth: "authed" },
  ].filter((link) => {
    if (link.auth === "any") return true;
    return isLoggedIn;
  });

  const mobileAccountLinks = [
    { to: "/", label: "Home", auth: "any" },
    { to: "/dashboard", label: "Dashboard", auth: "authed" },
    { to: "/contest", label: "Contest", auth: "authed" },
    { to: "/resume-analyzer", label: "Resume Analyzer", auth: "authed" },
    { to: "/profile", label: "Profile", auth: "authed" },
  ].filter((link) => (link.auth === "any" ? true : isLoggedIn));

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-4 md:px-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Leet-Prep
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {desktopLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/premium" className="block">
              <Button variant="secondary" size="sm" className="min-h-[40px] rounded-xl px-3 text-xs sm:min-h-[48px] sm:px-4 sm:text-sm">
                Pro
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              disabled={hasLiked || loading}
              className={`relative flex min-h-[40px] items-center gap-1.5 rounded-xl border px-2 transition-all duration-300 sm:min-h-[48px] sm:gap-2 sm:px-3 ${
                hasLiked
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "hover:border-foreground/30"
              } ${error ? "border-red-500/50 text-red-600 dark:text-red-400" : ""}`}
              aria-label={hasLiked ? "Thank you for your support!" : "Support this project"}
            >
              <Heart
                className={`h-3.5 w-3.5 transition-all duration-300 sm:h-4 sm:w-4 ${
                  hasLiked ? "fill-current scale-110" : ""
                } ${loading ? "animate-pulse" : ""}`}
              />
              <span className="font-semibold tabular-nums text-xs sm:text-sm">{error ? "!" : likes}</span>
              {hasLiked && <span className="hidden text-xs opacity-80 sm:inline">Thanks!</span>}
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              )}
            </Button>

            <div className="block">
              <ModeToggle />
            </div>

            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden min-h-[48px] rounded-xl text-muted-foreground hover:text-foreground md:inline-flex"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login" className="hidden md:block">
                <Button variant="default" size="sm" className="min-h-[48px] rounded-xl px-4">
                  Login
                </Button>
              </Link>
            )}

            <button
              className="rounded-xl border p-3 text-muted-foreground transition hover:text-foreground hover:border-foreground/30 md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-[90] bg-blue-950/55 backdrop-blur-xl md:hidden" onClick={closeMobile} />

          <aside
            ref={sidebarRef}
            className="fixed inset-y-0 right-0 z-[100] h-screen w-[72%] max-w-[280px] overflow-hidden border-l bg-background shadow-2xl md:hidden"
            aria-label="Mobile sidebar"
          >
            <div className="flex h-full flex-col px-4 py-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-base font-semibold text-foreground">Leet-Prep</span>
                <button
                  onClick={closeMobile}
                  className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 flex-col space-y-6 pt-4">
                <div className="space-y-2">
                  <p className="px-1 text-sm text-muted-foreground">Account</p>
                  {mobileAccountLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={closeMobile}
                      className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 active:scale-[0.98]"
                    >
                      <span className="text-base text-foreground">{link.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-auto border-t pt-4">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobile();
                        handleLogout();
                      }}
                      className="flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 active:scale-[0.98]"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 active:scale-[0.98]"
                    >
                      <span className="text-base text-foreground">Login</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
