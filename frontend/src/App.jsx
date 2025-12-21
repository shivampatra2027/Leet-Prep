import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout"
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/privateRoute";
import { ThemeProvider } from "@/components/theme-provider"
import { Pricing4 } from "./pages/Premium";
import Profile from "./pages/profile";

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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

