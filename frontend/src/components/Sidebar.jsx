import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">LeetIO</div>
      <nav className="flex-1">
        <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
        <Link to="/company" className="block px-4 py-2 hover:bg-gray-700">Companies</Link>
        <Link to="/problem" className="block px-4 py-2 hover:bg-gray-700">Problems</Link>
      </nav>
      <button
        onClick={() => {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }}
        className="m-4 bg-red-500 px-4 py-2 rounded"
      >
        Logout
      </button>
    </aside>
  );
}
