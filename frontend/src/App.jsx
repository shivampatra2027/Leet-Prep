import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout"
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/privateRoute";
import { ThemeProvider } from "@/components/theme-provider.jsx"
import { Pricing4 } from "./pages/Premium";
import Profile from "./pages/profile";
import ErrorPage from "./ErrorPage";
import FreeDashboard from "./pages/FreeDashboard";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/premium" element={<Pricing4 />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/freedashboard"
            element={
              <PrivateRoute>
                <FreeDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
            } />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

