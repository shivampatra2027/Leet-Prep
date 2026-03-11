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
import { useEffect } from "react"
import Profile from "./pages/profile";
import ErrorPage from "./ErrorPage";
import FreeDashboard from "./pages/FreeDashboard";
import PaymentButton from "./components/PaymentButton";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import PaymentProcessing from "./pages/PaymentProcessing";
import Contest from "./pages/Contest";
import Support from "./pages/Support";
import Referral from "./pages/Referral";
import ReferralRedirect from "./pages/ReferralRedirect";
import OAuthSuccess from "./pages/OAuthSuccess";
import Sheet from "./pages/Sheet";
import useAppInit from "./store/useAppInit";

function App() {
  useAppInit();

  // useEffect(() => {
  //   const checkDevTools = setInterval(() => {
  //     const threshold = 160;
  //     if (window.outerWidth - window.innerWidth > threshold ||
  //       window.outerHeight - window.innerHeight > threshold) {
  //       location.reload();
  //     }
  //   }, 100);
  //   return () => clearInterval(checkDevTools);
  // }, []);
  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault(); document.addEventListener("contextmenu", disableRightClick);
    return () => { document.removeEventListener("contextmenu", disableRightClick); };
  }, []);


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          {/* <Route path="/signup" element={<Signup />} /> */}
          <Route path="/premium" element={
            <PrivateRoute>
              <Pricing4 />
            </PrivateRoute>
          } />
          <Route path="/payment-processing" element={
            <PrivateRoute>
              <PaymentProcessing />
            </PrivateRoute>
          } />
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
          {/* <Route
            path="/resume-analyzer"
            element={
              <PrivateRoute>
                <ResumeAnalyzer />
              </PrivateRoute>
            }
          /> */}
          <Route
            path="/contest"
            element={
              <PrivateRoute>
                <Contest />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/support" element={<Support />} />
          <Route path="/r/:code" element={<ReferralRedirect />} />
          <Route path="/referral" element={
            <PrivateRoute>
              <Referral />
            </PrivateRoute>
          } />
          {/* <Route
            path="/sheet"
            element={
              <PrivateRoute>
                <Sheet />
              </PrivateRoute>
            }
          /> */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

