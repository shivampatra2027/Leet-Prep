import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { problemsAPI } from "../lib/api";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: "",
    company: "",
    search: "",
    page: 1,
    limit: 50
  });
  const [pagination, setPagination] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchCompanies = async () => {
    try {
      const res = await problemsAPI.getCompanies();
      setCompanies(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.company) params.company = filters.company;
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
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "hard": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Problems</h2>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search problems..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={filters.company}
              onChange={(e) => handleFilterChange("company", e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Companies</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems Table */}
        {loading ? (
          <div className="text-center py-8">Loading problems...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : problems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No problems found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acceptance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Companies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {problems.map((problem) => (
                  <tr key={problem.id || problem._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{problem.problemId}</td>
                    <td className="px-6 py-4">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {problem.title}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {problem.acceptance ? `${problem.acceptance}%` : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {problem.companies?.slice(0, 3).join(", ")}
                      {problem.companies?.length > 3 && "..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
