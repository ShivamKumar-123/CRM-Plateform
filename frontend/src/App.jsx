import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'

// Marketing site
import MarketingLayout from './layouts/MarketingLayout.jsx'
import Home from './pages/marketing/Home.jsx'
import Features from './pages/marketing/Features.jsx'
import Industries from './pages/marketing/Industries.jsx'
import Pricing from './pages/marketing/Pricing.jsx'
import About from './pages/marketing/About.jsx'
import Contact from './pages/marketing/Contact.jsx'
import Leads from './pages/Leads'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { Deal } from './components/index.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import SuperAdminRoute from './components/SuperAdminRoute.jsx'

// Admin
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminOverview from './pages/admin/AdminOverview.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminOrganizations from './pages/admin/AdminOrganizations.jsx'
import AdminLeads from './pages/admin/AdminLeads.jsx'
import AdminDeals from './pages/admin/AdminDeals.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'
import AdminSystem from './pages/admin/AdminSystem.jsx'
import AdminAutomation from './pages/admin/AdminAutomation.jsx'
import AdminWhatsApp from './pages/admin/AdminWhatsApp.jsx'
import AdminBilling from './pages/admin/AdminBilling.jsx'
import AdminPipelines from './pages/admin/AdminPipelines.jsx'
import AdminCustomFields from './pages/admin/AdminCustomFields.jsx'
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx'
import AdminTwoFactor from './pages/admin/AdminTwoFactor.jsx'
import AdminLeadScoring from './pages/admin/AdminLeadScoring.jsx'
import AdminSalesTargets from './pages/admin/AdminSalesTargets.jsx'
import AdminCallLogs from './pages/admin/AdminCallLogs.jsx'
import AdminSavedViews from './pages/admin/AdminSavedViews.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Marketing site — shared layout with sticky nav + footer */}
      <Route path='/' element={<MarketingLayout />}>
        <Route index element={<Home />} />
        <Route path='features' element={<Features />} />
        <Route path='industries' element={<Industries />} />
        <Route path='pricing' element={<Pricing />} />
        <Route path='about' element={<About />} />
        <Route path='contact' element={<Contact />} />
      </Route>

      <Route path='/login' element={<Login />} />

      {/* Regular user app */}
      <Route
        path='/app'
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path='leads' element={<Leads />} />
        <Route path='deals' element={<Deal />} />
        <Route path='customers' element={<Customers />} />
        <Route path='reports' element={<Reports />} />
        <Route path='settings' element={<Settings />} />
      </Route>

      {/* Super admin console */}
      <Route
        path='/admin'
        element={
          <SuperAdminRoute>
            <AdminLayout />
          </SuperAdminRoute>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path='organizations' element={<AdminOrganizations />} />
        <Route path='users' element={<AdminUsers />} />
        <Route path='leads' element={<AdminLeads />} />
        <Route path='deals' element={<AdminDeals />} />
        <Route path='customers' element={<AdminCustomers />} />
        <Route path='pipelines' element={<AdminPipelines />} />
        <Route path='custom-fields' element={<AdminCustomFields />} />
        <Route path='automation' element={<AdminAutomation />} />
        <Route path='whatsapp' element={<AdminWhatsApp />} />
        <Route path='billing' element={<AdminBilling />} />
        <Route path='audit-logs' element={<AdminAuditLogs />} />
        <Route path='two-factor' element={<AdminTwoFactor />} />
        <Route path='lead-scoring' element={<AdminLeadScoring />} />
        <Route path='sales-targets' element={<AdminSalesTargets />} />
        <Route path='call-logs' element={<AdminCallLogs />} />
        <Route path='saved-views' element={<AdminSavedViews />} />
        <Route path='reports' element={<AdminReports />} />
        <Route path='system' element={<AdminSystem />} />
      </Route>
    </>
  )
)

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
