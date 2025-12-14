import { useState, useEffect, useCallback } from "react";
import { problemsAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/columns";
import Navbar from "@/components/Navbar";
import Layout from "@/components/layout";

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
      {/* <Layout> */}
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Problems
              </h1>
              <p className="text-muted-foreground">
                {filteredCount > 0 ? filteredCount : (pagination?.totalProblems || 0)} problems available
              </p>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-12 text-center text-red-600">
                {error}
              </div>
            ) : (
              <DataTable columns={columns} data={problems} onFilteredCountChange={setFilteredCount} />
            )}
          </div>
        </div>
      {/* </Layout> */}
    </>
  );
}
