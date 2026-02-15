import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { problemsAPI, profileAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable.jsx";
import { columns } from "@/components/columns.jsx";
import Navbar from "@/components/Navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Progress } from "@/components/ui/progress.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filteredCount, setFilteredCount] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [userTier, setUserTier] = useState(null);
   const [summary, setSummary] = useState({ solvedCount: 0, totalProblems: 0, progress: 0 });

  // Check user tier on mount
  useEffect(() => {
    const checkUserTier = async () => {
      try {
        const response = await profileAPI.getProfile();
        const tier = response.data.tier || "free";
        setUserTier(tier);
        
        // Redirect free users to free dashboard
        if (tier === "free") {
          navigate("/freedashboard", { replace: true });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        // On error, redirect to free dashboard as safety measure
        navigate("/freedashboard", { replace: true });
      }
    };
    checkUserTier();
  }, [navigate]);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 10000 }; // Fetch all problems

      const [problemsRes, solvedRes, summaryRes] = await Promise.all([
        problemsAPI.getAll(params),
        profileAPI.getSolvedProblems().catch(() => ({ data: { solvedProblems: [] } })),
        profileAPI.getSolvedSummary().catch(() => ({ data: { solvedCount: 0, totalProblems: 0, progress: 0 } }))
      ]);
      
      setProblems(problemsRes.data.data || []);
      setPagination(problemsRes.data.pagination);
      setSolvedProblems(solvedRes.data.solvedProblems || []);
      setSummary({
        solvedCount: summaryRes.data.solvedCount || 0,
        totalProblems: summaryRes.data.totalProblems || (problemsRes.data.pagination?.totalProblems || 0),
        progress: summaryRes.data.progress || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch problems if user is premium
    if (userTier === "premium") {
      fetchProblems();
    }
  }, [fetchProblems, userTier]);

  const toggleSolved = useCallback(async (problemId, nextChecked) => {
    setSolvedProblems((prev) => {
      if (nextChecked) return Array.from(new Set([...prev, problemId]));
      return prev.filter((id) => id !== problemId);
    });
    try {
      if (nextChecked) {
        const res = await profileAPI.addSolvedProblem(problemId);
        setSummary((s) => {
          const newCount = res.data.solvedCount ?? (s.solvedCount + 1);
          return {
            ...s,
            solvedCount: newCount,
            progress: (s.totalProblems || 0) ? newCount / s.totalProblems : s.progress,
          };
        });
      } else {
        const res = await profileAPI.removeSolvedProblem(problemId);
        setSummary((s) => {
          const newCount = res.data.solvedCount ?? Math.max(0, s.solvedCount - 1);
          return {
            ...s,
            solvedCount: newCount,
            progress: (s.totalProblems || 0) ? newCount / s.totalProblems : s.progress,
          };
        });
      }
    } catch (err) {
      // rollback on failure
      setSolvedProblems((prev) => {
        if (nextChecked) return prev.filter((id) => id !== problemId);
        return Array.from(new Set([...prev, problemId]));
      });
      console.error("Failed to toggle solved state:", err);
    }
  }, []);

  // Don't render anything for free users (will be redirected)
  if (userTier !== "premium") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Problems
              </h1>
              <p className="text-muted-foreground">
                {filteredCount > 0 ? filteredCount : (pagination?.totalProblems || 0)} problems available
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solved</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-semibold">{summary.solvedCount}</div>
                  <Progress value={summary.progress * 100} />
                  <p className="text-sm text-muted-foreground">
                    {Math.round((summary.progress || 0) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{summary.totalProblems || pagination?.totalProblems || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {(summary.totalProblems || pagination?.totalProblems || 0) - (summary.solvedCount || 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
              </div>
            ) : error ? (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-12 text-center text-destructive">
                {error}
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={problems} 
                onFilteredCountChange={setFilteredCount}
                solvedProblems={solvedProblems}
                onToggleSolved={toggleSolved}
              />
            )}
          </div>
        </div>
    </>
  );
}
