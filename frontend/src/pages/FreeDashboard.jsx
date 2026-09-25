import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { problemsAPI, profileAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable.jsx";
import { columns } from "@/components/columns.jsx";
import Navbar from "@/components/Navbar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Progress } from "@/components/ui/progress.jsx";
import { usePremiumStore } from "@/store/usePremiumStore";

export default function FreeDashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCount, setFilteredCount] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const premium = usePremiumStore((s) => s.premium);
  const premiumLoading = usePremiumStore((s) => s.loading);
  const [summary, setSummary] = useState({ solvedCount: 0, totalProblems: 0, progress: 0 });

  useEffect(() => {
    if (!premiumLoading && premium) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, premium, premiumLoading]);

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
      
      const difficultyRank = { Easy: 0, Medium: 1, Hard: 2 };
      const hasAllFields = (p) =>
        Boolean(p?.difficulty) &&
        Number.isFinite(Number(p?.acceptance)) &&
        Array.isArray(p?.topics) &&
        p.topics.length > 0;

      const allProblems = [...(problemsRes.data.data || [])].sort((a, b) => {
        const completeA = hasAllFields(a) ? 1 : 0;
        const completeB = hasAllFields(b) ? 1 : 0;
        if (completeA !== completeB) return completeB - completeA; // complete first

        const rankA = difficultyRank[a.difficulty] ?? 3;
        const rankB = difficultyRank[b.difficulty] ?? 3;
        if (rankA !== rankB) return rankA - rankB;

        const accA = Number(a.acceptance) || 0;
        const accB = Number(b.acceptance) || 0;
        return accB - accA;
      });
      setSolvedProblems(solvedRes.data.solvedProblems || []);
      
      // Limit to 1 problem per company
      const companyProblemCount = new Map();
      const limitedProblems = allProblems.filter((problem) => {
        // Get companies for this problem
        const companies = problem.companies || [];
        
        // Check if any company hasn't reached the limit
        let canInclude = false;
        for (const company of companies) {
          const count = companyProblemCount.get(company) || 0;
          if (count < 1) {
            canInclude = true;
            break;
          }
        }
        
        // If we can include it, increment counts for all its companies
        if (canInclude) {
          for (const company of companies) {
            companyProblemCount.set(company, (companyProblemCount.get(company) || 0) + 1);
          }
          return true;
        }
        
        return false;
      });
      
      // Update summary to reflect only the limited problems available to free users
      const limitedTotal = limitedProblems.length;
      const solvedCount = summaryRes.data.solvedCount || 0;
      setSummary({
        solvedCount: solvedCount,
        totalProblems: limitedTotal,
        progress: limitedTotal > 0 ? solvedCount / limitedTotal : 0,
      });
      
      setProblems(limitedProblems);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

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
      setSolvedProblems((prev) => {
        if (nextChecked) return prev.filter((id) => id !== problemId);
        return Array.from(new Set([...prev, problemId]));
      });
      console.error("Failed to toggle solved state:", err);
    }
  }, []);


  // Don't render for premium users (will be redirected)
  if (premiumLoading || premium) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Upgrade Banner */}
            <div className="mb-4 sm:mb-6 bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 sm:justify-between">
              <div className="flex items-start gap-2 sm:gap-3 flex-1">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-primary text-sm sm:text-base">Free Tier - Limited Access</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">You're viewing 1 problem per company. Upgrade to access all 2200+ problems!</p>
                </div>
              </div>
              <Button onClick={() => navigate("/premium")} className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0 text-sm sm:text-base">
                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Upgrade to Premium
              </Button>
            </div>

            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Problems
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {filteredCount > 0 ? filteredCount : (summary.totalProblems || 0)} problems available (Limited to 1 per company)
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-sm sm:text-base">Solved</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xl sm:text-2xl font-semibold">{summary.solvedCount}</div>
                  <Progress value={summary.progress * 100} />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {Math.round((summary.progress || 0) * 100)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-sm sm:text-base">Total Problems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-semibold">{summary.totalProblems || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 sm:pb-6">
                  <CardTitle className="text-sm sm:text-base">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-semibold">
                    {(summary.totalProblems || 0) - (summary.solvedCount || 0)}
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
