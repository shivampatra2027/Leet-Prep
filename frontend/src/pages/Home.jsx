import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Leet.IO</h1>
          <Link 
            to="/login" 
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Master Coding Interviews
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice 3000+ problems from top tech companies. Built for KIIT students.
        </p>
        <Link 
          to="/login" 
          className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Get Started
        </Link>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-2">3000+</div>
          <div className="text-gray-600">Problems</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-2">100+</div>
          <div className="text-gray-600">Companies</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
          <div className="text-gray-600">Students</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-600 text-sm">
          © 2025 Leet.IO. Made for KIIT Students.
        </div>
      </footer>
    </div>
  );
}