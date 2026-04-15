import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { ApplyLeavePage } from './pages/employee/ApplyLeavePage';
import { MyApplicationsPage } from './pages/employee/MyApplicationsPage';
import { COReviewInbox } from './pages/co/COReviewInbox';
import { COReviewDetail } from './pages/co/COReviewDetail';
import { HRVerificationQueue } from './pages/hr/HRVerificationQueue';
import { HRVerificationDetail } from './pages/hr/HRVerificationDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DelegationMatrix } from './pages/admin/DelegationMatrix';
import { LeaveRegulations } from './pages/admin/LeaveRegulations';
import { LeaveTypesMaster } from './pages/admin/LeaveTypesMaster';
import { AuditLogExplorer } from './pages/admin/AuditLogExplorer';
import { OrderTemplates } from './pages/admin/OrderTemplates';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { SanctionInbox } from './pages/sa/SanctionInbox';
import { SanctionDetail } from './pages/sa/SanctionDetail';
import { AccountsQueue } from './pages/accounts/AccountsQueue';
import { AccountsDetail } from './pages/accounts/AccountsDetail';
import { Toaster } from './components/ui/sonner';

// Simple client-side router for Figma Make environment
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');

  // Simple navigation function
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Make navigate available globally
  if (typeof window !== 'undefined') {
    (window as any).navigate = navigate;
  }

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #1e3a8a',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Route rendering
  const renderRoute = () => {
    // Not authenticated - show login
    if (!isAuthenticated && currentPath !== '/login') {
      return <LoginPage />;
    }

    // Authenticated - route to pages
    switch (currentPath) {
      case '/login':
        return isAuthenticated ? <DashboardRouter /> : <LoginPage />;
      case '/dashboard':
        return <DashboardRouter />;
      case '/employee/apply':
        return <ApplyLeavePage />;
      case '/employee/applications':
        return <MyApplicationsPage />;
      case '/co/review':
        return <COReviewInbox />;
      case '/hr/verify':
        return <HRVerificationQueue />;
      case '/admin/dashboard':
        return <AdminDashboard />;
      case '/admin/delegation':
        return <DelegationMatrix />;
      case '/admin/regulations':
        return <LeaveRegulations />;
      case '/admin/leave-types':
        return <LeaveTypesMaster />;
      case '/admin/audit':
        return <AuditLogExplorer />;
      case '/admin/templates':
        return <OrderTemplates />;
      case '/admin/reports':
        return <ReportsAnalytics />;
      case '/sa/sanction':
        return <SanctionInbox />;
      case '/accounts/queue':
        return <AccountsQueue />;
      default:
        // Check if it's a detail route
        if (currentPath.startsWith('/co/review/')) {
          return <COReviewDetail />;
        }
        if (currentPath.startsWith('/hr/verify/')) {
          return <HRVerificationDetail />;
        }
        if (currentPath.startsWith('/employee/applications/')) {
          return <MyApplicationsPage />;
        }
        if (currentPath.startsWith('/sa/sanction/')) {
          return <SanctionDetail />;
        }
        if (currentPath.startsWith('/accounts/process/')) {
          return <AccountsDetail />;
        }
        // Default route
        return isAuthenticated ? <DashboardRouter /> : <LoginPage />;
    }
  };

  return (
    <>
      {renderRoute()}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}