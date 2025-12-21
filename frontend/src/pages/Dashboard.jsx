import { useState, useEffect, useCallback } from "react";
import { problemsAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable.jsx";
import { columns } from "@/components/columns.jsx";
import Navbar from "@/components/Navbar.jsx";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filteredCount, setFilteredCount] = useState(0);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 10000 }; // Fetch all problems

      const res = await problemsAPI.getAll(params);
      setProblems(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

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
              <DataTable columns={columns} data={problems} onFilteredCountChange={setFilteredCount} />
            )}
          </div>
        </div>
    </>
  );
}
