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
import Tasks from './pages/Tasks'
import Notifications from './pages/Notifications'
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

// Phase 6 — Enterprise Operations Pack
import AdminFilters from './pages/admin/AdminFilters.jsx'
import AdminImportExport from './pages/admin/AdminImportExport.jsx'
import AdminDistribution from './pages/admin/AdminDistribution.jsx'
import AdminSessions from './pages/admin/AdminSessions.jsx'
import AdminApprovals from './pages/admin/AdminApprovals.jsx'
import AdminApiDocs from './pages/admin/AdminApiDocs.jsx'

// Phase 7 — Enterprise Integrations Pack
import AdminHelpdesk from './pages/admin/AdminHelpdesk.jsx'
import AdminPortalTokens from './pages/admin/AdminPortalTokens.jsx'

// Customer portal (separate auth)
import PortalLayout from './pages/portal/PortalLayout.jsx'
import PortalLogin from './pages/portal/PortalLogin.jsx'
import PortalDashboard from './pages/portal/PortalDashboard.jsx'
import PortalTickets from './pages/portal/PortalTickets.jsx'
import PortalInvoices from './pages/portal/PortalInvoices.jsx'
import PortalDocuments from './pages/portal/PortalDocuments.jsx'

// Phase 8 — Ecosystem & Intelligence Pack
import AdminKnowledgeBase from './pages/admin/AdminKnowledgeBase.jsx'
import AdminForms from './pages/admin/AdminForms.jsx'
import AdminESignature from './pages/admin/AdminESignature.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminAI from './pages/admin/AdminAI.jsx'
import AdminBackups from './pages/admin/AdminBackups.jsx'
import AdminCloudStorage from './pages/admin/AdminCloudStorage.jsx'
import AdminPlugins from './pages/admin/AdminPlugins.jsx'
import AdminPush from './pages/admin/AdminPush.jsx'
import AdminDashboardBuilder from './pages/admin/AdminDashboardBuilder.jsx'

// Public pages
import PublicForm from './pages/public/PublicForm.jsx'
import PublicSign from './pages/public/PublicSign.jsx'

// i18n
import { LocaleProvider } from './context/LocaleContext.jsx'

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
        <Route path='tasks' element={<Tasks />} />
        <Route path='notifications' element={<Notifications />} />
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

        {/* Phase 6 — Enterprise Operations Pack */}
        <Route path='filters' element={<AdminFilters />} />
        <Route path='import-export' element={<AdminImportExport />} />
        <Route path='distribution' element={<AdminDistribution />} />
        <Route path='sessions' element={<AdminSessions />} />
        <Route path='approvals' element={<AdminApprovals />} />
        <Route path='api-docs' element={<AdminApiDocs />} />

        {/* Phase 7 — Enterprise Integrations Pack */}
        <Route path='helpdesk' element={<AdminHelpdesk />} />
        <Route path='portal-tokens' element={<AdminPortalTokens />} />

        {/* Phase 8 — Ecosystem & Intelligence Pack */}
        <Route path='knowledge-base' element={<AdminKnowledgeBase />} />
        <Route path='forms' element={<AdminForms />} />
        <Route path='esign' element={<AdminESignature />} />
        <Route path='analytics' element={<AdminAnalytics />} />
        <Route path='ai' element={<AdminAI />} />
        <Route path='backups' element={<AdminBackups />} />
        <Route path='cloud-storage' element={<AdminCloudStorage />} />
        <Route path='plugins' element={<AdminPlugins />} />
        <Route path='push' element={<AdminPush />} />
        <Route path='dashboard-builder' element={<AdminDashboardBuilder />} />

        <Route path='reports' element={<AdminReports />} />
        <Route path='system' element={<AdminSystem />} />
      </Route>

      {/* Customer portal — separate auth (Portal token) */}
      <Route path='/portal/login' element={<PortalLogin />} />
      <Route path='/portal' element={<PortalLayout />}>
        <Route index element={<PortalDashboard />} />
        <Route path='tickets' element={<PortalTickets />} />
        <Route path='invoices' element={<PortalInvoices />} />
        <Route path='documents' element={<PortalDocuments />} />
      </Route>

      {/* Public — no auth */}
      <Route path='/forms/:slug' element={<PublicForm />} />
      <Route path='/sign/:token' element={<PublicSign />} />
    </>
  )
)

function App() {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </LocaleProvider>
  )
}

export default App
