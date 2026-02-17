import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Calendar, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState("upcoming"); // "upcoming" or "expired"

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

  function getTimeLeft(startTime) {
    const diff = startTime - Date.now();
    if (diff < 0) return "Started";
    
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

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  const platformColors = {
    LeetCode: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    Codeforces: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    CodeChef: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    AtCoder: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
        <div className="container mx-auto px-4 py-8">
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              {viewType === "upcoming" ? "Upcoming Contests" : "Past Contests"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Track coding contests from LeetCode, Codeforces, CodeChef, and AtCoder
          </p>
          
          {/* Toggle Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={viewType === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={viewType === "expired" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("expired")}
            >
              Past (Last 7 Days)
            </Button>
          </div>
        </div>

        {contests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {viewType === "upcoming" 
                  ? "No upcoming contests at the moment" 
                  : "No past contests in the last 7 days"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contests.map((contest, i) => (
              <Card 
                key={i} 
                className="hover:shadow-lg transition-shadow duration-200 flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={platformColors[contest.platform] || ""}
                    >
                      {contest.platform}
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {viewType === "upcoming" 
                        ? getTimeLeft(contest.startTime)
                        : getTimeAgo(contest.endTime)
                      }
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {contest.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(contest.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {formatDuration(contest.duration)}</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={contest.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      {viewType === "upcoming" ? "Open Contest" : "View Contest"}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Contest data updates every 4 hours</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchContests}
            className="mt-2"
          >
            Refresh Now
          </Button>
        </div>
      </div>
    </>
  );
}
