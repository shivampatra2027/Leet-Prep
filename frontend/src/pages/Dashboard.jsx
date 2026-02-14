import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { problemsAPI, profileAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable.jsx";
import { columns } from "@/components/columns.jsx";
import Navbar from "@/components/Navbar.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filteredCount, setFilteredCount] = useState(0);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [userTier, setUserTier] = useState(null);

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

      const [problemsRes, solvedRes] = await Promise.all([
        problemsAPI.getAll(params),
        profileAPI.getSolvedProblems().catch(() => ({ data: { solvedProblems: [] } }))
      ]);
      
      setProblems(problemsRes.data.data || []);
      setPagination(problemsRes.data.pagination);
      setSolvedProblems(solvedRes.data.solvedProblems || []);
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
              />
            )}
          </div>
        </div>
    </>
  );
}
