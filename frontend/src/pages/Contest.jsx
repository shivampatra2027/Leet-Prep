import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock3,
  ExternalLink,
  CalendarDays,
  Trophy,
  Timer,
  RefreshCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const PLATFORM_PRESET = [
  { value: "leetcode", label: "LeetCode" },
  { value: "codeforces", label: "Codeforces" },
  { value: "codechef", label: "CodeChef" },
  { value: "atcoder", label: "AtCoder" },
];

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("upcoming"); // "upcoming" or "expired"
  const [platformFilter, setPlatformFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const fetchContests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/contests?type=${viewType}`);
      const data = await res.json();
      setContests(data.contests || []);
      setError(null);
    } catch (err) {
      setError("Failed to load contests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, viewType]);

  useEffect(() => {
    fetchContests();
    // Refresh every 5 minutes
    const interval = setInterval(fetchContests, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchContests]);

  function normalizePlatform(value = "") {
    return value.toLowerCase().replace(/\s+/g, "");
  }

  function getTimeLeft(startTime) {
    const diff = startTime - Date.now();
    if (diff < 0) return "Live";

    const days = Math.floor(diff / (24 * 3600000));
    const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function getTimeAgo(endTime) {
    const diff = Date.now() - endTime;

    const days = Math.floor(diff / (24 * 3600000));
    const hours = Math.floor((diff % (24 * 3600000)) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  }

  function formatDateTime(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatGroupDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDuration(seconds) {
    const safeSeconds = Number(seconds) || 0;
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  const platformColors = {
    leetcode:
      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    codeforces:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    codechef:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    atcoder:
      "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  };

  const platformOptions = useMemo(() => {
    const known = new Set(PLATFORM_PRESET.map((p) => p.value));
    const extras = Array.from(
      new Map(
        contests
          .map((contest) => {
            const normalized = normalizePlatform(contest.platform || "");
            const cleanedLabel = (contest.platform || "").trim();
            if (!normalized || !cleanedLabel || known.has(normalized)) return null;
            return [normalized, cleanedLabel];
          })
          .filter(Boolean),
      ).entries(),
    ).map(([value, label]) => ({ value, label }));

    return [
      { value: "all", label: "All" },
      ...PLATFORM_PRESET,
      ...extras,
    ];
  }, [contests]);

  const filteredContests = useMemo(() => {
    const byPlatform =
      platformFilter === "all"
        ? contests
        : contests.filter(
            (contest) => normalizePlatform(contest.platform) === platformFilter,
          );

    const sorted = [...byPlatform].sort((a, b) => {
      if (viewType === "expired") return b.endTime - a.endTime;
      return a.startTime - b.startTime;
    });

    return sorted;
  }, [contests, platformFilter, viewType]);

  const groupedContests = useMemo(() => {
    const grouped = new Map();

    filteredContests.forEach((contest) => {
      const anchor = viewType === "expired" ? contest.endTime : contest.startTime;
      const key = new Date(anchor).toLocaleDateString("en-CA");
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          label: formatGroupDate(anchor),
          items: [],
        });
      }
      grouped.get(key).items.push(contest);
    });

    return Array.from(grouped.values());
  }, [filteredContests, viewType]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading contests...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchContests} className="mt-4">Retry</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border bg-card/85 p-5 shadow-glow sm:p-7">
          <div className="absolute inset-0 bg-grid opacity-25" />
          <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />

          <div className="relative">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                  <Trophy className="h-3.5 w-3.5 text-primary" />
                  Competitive Programming Timeline
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  {viewType === "upcoming" ? "Upcoming Contests" : "Past Contests"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Browse coding contests by platform, track start windows, and jump directly to the event pages.
                </p>
              </div>

              <div className="inline-flex items-center rounded-xl border bg-background/75 p-1">
                <Button
                  variant={viewType === "upcoming" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("upcoming")}
                  className="rounded-lg"
                >
                  Upcoming
                </Button>
                <Button
                  variant={viewType === "expired" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewType("expired")}
                  className="rounded-lg"
                >
                  Past 7 Days
                </Button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {platformOptions.map((platform) => {
                const active = platformFilter === platform.value;
                return (
                  <Button
                    key={platform.value}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlatformFilter(platform.value)}
                    className="rounded-full whitespace-nowrap"
                  >
                    {platform.label}
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground sm:text-sm">
              <div className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {filteredContests.length} contests in this view
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Timer className="h-4 w-4" />
                Auto-refresh every 5 minutes
              </div>
            </div>
          </div>
        </section>

        {groupedContests.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="py-14 text-center">
              <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {viewType === "upcoming"
                  ? "No upcoming contests for this platform selection."
                  : "No past contests found in the last 7 days for this selection."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <section className="relative mt-6 rounded-3xl border bg-card/75 p-4 sm:p-6">
            <div className="absolute left-[10.55rem] top-8 hidden h-[calc(100%-4rem)] w-px bg-border md:block" />

            <div className="space-y-8">
              {groupedContests.map((group) => (
                <div
                  key={group.key}
                  className="grid gap-3 md:grid-cols-[10rem_1fr] md:gap-6"
                >
                  <div className="relative md:pr-5 md:text-right">
                    <p className="text-sm font-semibold tracking-wide text-foreground md:text-base">
                      {group.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.items.length} contest{group.items.length > 1 ? "s" : ""}
                    </p>
                    <span className="absolute -right-[0.70rem] top-1 hidden h-3.5 w-3.5 rounded-full border-2 border-primary bg-background md:block" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((contest, index) => {
                      const normalizedPlatform = normalizePlatform(contest.platform);
                      const badgeClass = platformColors[normalizedPlatform] || "";
                      const contestStatus =
                        viewType === "upcoming"
                          ? getTimeLeft(contest.startTime)
                          : getTimeAgo(contest.endTime);

                      return (
                        <Card
                          key={`${contest.platform}-${contest.name}-${contest.startTime}-${index}`}
                          className="group flex h-full flex-col border-border/80 bg-background/85 transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <CardHeader className="pb-3">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <Badge variant="outline" className={badgeClass}>
                                {contest.platform}
                              </Badge>
                              <Badge variant="secondary" className="inline-flex items-center gap-1">
                                <Clock3 className="h-3 w-3" />
                                {contestStatus}
                              </Badge>
                            </div>

                            <CardTitle className="line-clamp-2 text-base leading-snug sm:text-lg">
                              {contest.name}
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="mt-auto space-y-3">
                            <div className="space-y-1.5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>{formatDateTime(contest.startTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4" />
                                <span>Duration: {formatDuration(contest.duration)}</span>
                              </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a
                                href={contest.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2"
                              >
                                {viewType === "upcoming" ? "Open Contest" : "View Contest"}
                                <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-7 text-center text-sm text-muted-foreground">
          <p>Contest data updates periodically in the backend cache.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchContests}
            className="mt-2 inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>
    </>
  );
}
