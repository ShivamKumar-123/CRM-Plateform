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

// Admin
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminTeam from "./pages/admin/AdminTeam.jsx";
import AdminPipelines from "./pages/admin/AdminPipelines.jsx";
import AdminCustomFields from "./pages/admin/AdminCustomFields.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";
import AdminAutomation from "./pages/admin/AdminAutomation.jsx";
import AdminTwoFactor from "./pages/admin/AdminTwoFactor.jsx";

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
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="pipelines" element={<AdminPipelines />} />
        <Route path="custom-fields" element={<AdminCustomFields />} />
        <Route path="automation" element={<AdminAutomation />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="two-factor" element={<AdminTwoFactor />} />
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
