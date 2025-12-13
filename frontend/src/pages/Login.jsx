import { useEffect } from "react";
import axios from "axios";

export default function Login() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      window.location.href = "/dashboard";
    }
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post("http://localhost:8080/auth/login", { email, password });
      localStorage.setItem("authToken", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="KIIT Email"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="my-4 text-center text-gray-500">OR</div>

        {/* Google OAuth Button */}
        <a href="http://localhost:8080/auth/google">
          <button className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600">
            Login with Google
          </button>
        </a>
      </div>
    </div>
  );
}
