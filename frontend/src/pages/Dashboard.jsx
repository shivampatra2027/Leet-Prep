import { useState, useEffect, useCallback } from "react";
import { problemsAPI } from "../lib/api";
import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Layout from "@/components/layout";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: "",
    search: "",
    page: 1,
    limit: 30
  });
  const [pagination, setPagination] = useState(null);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.difficulty && filters.difficulty !== "all") params.difficulty = filters.difficulty;
      if (filters.search) params.q = filters.search;
      params.page = filters.page;
      params.limit = filters.limit;

      const res = await problemsAPI.getAll(params);
      setProblems(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleDifficultyChange = (value) => {
    setFilters(prev => ({ ...prev, difficulty: value, page: 1 }));
  };

  return (
    <>
      <Navbar />
      <Layout>
        <div className="min-h-screen bg-white p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Problems
              </h1>
              <p className="text-muted-foreground">
                {pagination?.totalProblems || 0} problems available
              </p>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-4 items-center">
              <Select value={filters.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulty</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
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
              <DataTable columns={columns} data={problems} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
