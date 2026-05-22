import { lazy, Suspense } from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { IndustryProvider } from "./context/IndustryContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { DemoModeProvider } from "./context/DemoModeContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./Layout.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Leads from "./pages/Leads.jsx";
import Customers from "./pages/Customers.jsx";
import Deals from "./pages/Deals.jsx";
import Reports from "./pages/Reports.jsx";
import Automation from "./pages/Automation.jsx";
import CommandCenter from "./pages/CommandCenter.jsx";
import Settings from "./pages/Settings.jsx";

// Admin — lazy-loaded so the admin bundle only downloads when /admin is hit
const AdminLayout      = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminOverview    = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const AdminTeam        = lazy(() => import("./pages/admin/AdminTeam.jsx"));
const AdminPipelines   = lazy(() => import("./pages/admin/AdminPipelines.jsx"));
const AdminCustomFields = lazy(() => import("./pages/admin/AdminCustomFields.jsx"));
const AdminAuditLogs   = lazy(() => import("./pages/admin/AdminAuditLogs.jsx"));
const AdminAutomation  = lazy(() => import("./pages/admin/AdminAutomation.jsx"));
const AdminTwoFactor   = lazy(() => import("./pages/admin/AdminTwoFactor.jsx"));

function AdminFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-400 text-sm">
      Loading admin console…
    </div>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="deals" element={<Deals />} />
        <Route path="customers" element={<Customers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="automation" element={<Automation />} />
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin console — demo allows any logged-in user to access */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<AdminFallback />}><AdminOverview /></Suspense>} />
        <Route path="team" element={<Suspense fallback={<AdminFallback />}><AdminTeam /></Suspense>} />
        <Route path="pipelines" element={<Suspense fallback={<AdminFallback />}><AdminPipelines /></Suspense>} />
        <Route path="custom-fields" element={<Suspense fallback={<AdminFallback />}><AdminCustomFields /></Suspense>} />
        <Route path="automation" element={<Suspense fallback={<AdminFallback />}><AdminAutomation /></Suspense>} />
        <Route path="audit-logs" element={<Suspense fallback={<AdminFallback />}><AdminAuditLogs /></Suspense>} />
        <Route path="two-factor" element={<Suspense fallback={<AdminFallback />}><AdminTwoFactor /></Suspense>} />
      </Route>
    </>
  )
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IndustryProvider>
          <NotificationProvider>
            <DemoModeProvider>
              <RouterProvider router={router} />
            </DemoModeProvider>
          </NotificationProvider>
        </IndustryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
