import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { ExternalLink, BookOpen, ChevronDown, ChevronRight, Search } from "lucide-react";
import { sheetsAPI } from "@/lib/api.js";

export default function Sheet() {
  const [openTopics, setOpenTopics] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchSheet = async () => {
    try {
      setIsLoading(true);
      setLoadError("");

      const res = await sheetsAPI.getLoveBabbar();
      const nextSheet = res?.data?.data;

      if (!nextSheet || !Array.isArray(nextSheet.topics)) {
        throw new Error("Invalid sheet response");
      }

      setSheetData(nextSheet);
      if (nextSheet.topics.length > 0) {
        setOpenTopics(new Set([nextSheet.topics[0].topic]));
      }
    } catch {
      setSheetData(null);
      setLoadError("Could not load sheet from database. Seed Mongo and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSheet();
  }, []);

  const totalProblems = sheetData?.total_problems ?? 0;
  const totalTopics = sheetData?.total_topics ?? 0;

  const scrapedAtText = useMemo(() => {
    if (!sheetData?.scraped_at) return "-";
    const dt = new Date(sheetData.scraped_at);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleString();
  }, [sheetData?.scraped_at]);

  const toggleTopic = (topic) => {
    setOpenTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  const filteredTopics = useMemo(() => {
    const topics = sheetData?.topics ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return topics;

    return topics
      .map((t) => ({
        ...t,
        problems: t.problems.filter((p) => p.title.toLowerCase().includes(q)),
      }))
      .filter((t) => t.problems.length > 0);
  }, [search, sheetData?.topics]);

  const searchActive = search.trim().length > 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              {sheetData?.title ?? "DSA Sheet"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Practice {totalProblems} DSA questions grouped by topic and open each one directly in a new tab
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
              <span>Scraped: {scrapedAtText}</span>
              {sheetData?.source ? (
                <a
                  href={sheetData.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {isLoading ? <span>Loading from DB...</span> : null}
              {!isLoading && loadError ? <span>{loadError}</span> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">Total Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">{totalProblems}</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {totalTopics} topics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">By Love Babbar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-semibold">Free</div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Curated for interview preparation
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              disabled={!sheetData || isLoading}
            />
          </div>

          {!isLoading && loadError && !sheetData ? (
            <div className="rounded-md border border-border bg-muted/20 p-12 text-center text-muted-foreground">
              <p className="mb-3">{loadError}</p>
              <Button onClick={fetchSheet}>Retry</Button>
            </div>
          ) : null}

          <div className="space-y-3">
            {filteredTopics.map((topicData) => {
              const isOpen = searchActive || openTopics.has(topicData.topic);

              return (
                <Card key={topicData.topic} className="overflow-hidden">
                  <button className="w-full text-left" onClick={() => toggleTopic(topicData.topic)}>
                    <CardHeader className="pb-3 pt-4 px-4 sm:px-6">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <CardTitle className="text-base sm:text-lg truncate">{topicData.topic}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                            {topicData.problems.length} problems
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                  </button>

                  {isOpen && (
                    <CardContent className="px-4 sm:px-6 pb-4 pt-0">
                      <div className="border rounded-lg overflow-hidden">
                        {topicData.problems.map((problem, idx) => {
                          const solveLink =
                            problem.practice_link ||
                            problem.leetcode_link ||
                            problem.article_link;
                          return (
                            <div
                              key={problem.id}
                              className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-accent/50 ${
                                idx !== topicData.problems.length - 1 ? "border-b border-border" : ""
                              }`}
                            >
                              {solveLink ? (
                                <a
                                  href={solveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 text-xs sm:text-sm leading-snug text-foreground underline-offset-4 transition hover:text-primary hover:underline"
                                >
                                  {problem.title}
                                </a>
                              ) : (
                                <span className="flex-1 text-xs sm:text-sm leading-snug text-foreground">
                                  {problem.title}
                                </span>
                              )}
                              <div className="flex items-center gap-1 shrink-0">
                                {problem.article_link ? (
                                  <a
                                    href={problem.article_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Read article"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-amber-500 hover:text-amber-400"
                                      asChild
                                    >
                                      <span>
                                        <BookOpen className="h-3.5 w-3.5" />
                                      </span>
                                    </Button>
                                  </a>
                                ) : (
                                  <span className="w-7" />
                                )}
                                {solveLink ? (
                                  <a
                                    href={solveLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Practice problem"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-green-500 hover:text-green-400"
                                      asChild
                                    >
                                      <span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                      </span>
                                    </Button>
                                  </a>
                                ) : (
                                  <span className="w-7" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}

            {!isLoading && sheetData && filteredTopics.length === 0 ? (
              <div className="rounded-md border border-border bg-muted/20 p-12 text-center text-muted-foreground">
                No problems match &quot;{search}&quot;
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
