import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Header } from "../components/layout/Header.jsx";
import { AppProvider, useApp } from "../context/AppContext.jsx";
import { AccountHome } from "../pages/AccountHome.jsx";
import { AdminWorkspace } from "../pages/AdminWorkspace.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { Blog } from "../pages/Blog.jsx";
import { Dashboard } from "../pages/Dashboard.jsx";
import { EditorialPage } from "../pages/EditorialPage.jsx";
import { Home } from "../pages/Home.jsx";
import { Pricing } from "../pages/Pricing.jsx";
import { SignupPage } from "../pages/SignupPage.jsx";

function ProtectedRoute({ children }) {
  const { auth } = useApp();
  return auth ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { auth } = useApp();
  if (!auth) return <Navigate to="/login" replace />;
  return auth.user.role === "ADMIN" ? children : <Navigate to="/app/dashboard" replace />;
}

function Shell() {
  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<EditorialPage type="about" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/methodology" element={<EditorialPage type="about" />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/app" element={<ProtectedRoute><AccountHome /></ProtectedRoute>} />
        <Route path="/app/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/admin" element={<AdminRoute><AdminWorkspace /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
}
