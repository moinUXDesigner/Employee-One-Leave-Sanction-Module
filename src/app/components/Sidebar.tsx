import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Home,
  FileText,
  Plus,
  CheckSquare,
  Users,
  BookOpen,
  Shield,
  Activity,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';
import logoImage from '../../imports/logo-multi-color-1.png';

export function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Employee menu - always shown
  const employeeItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Plus, label: 'Apply Leave', path: '/employee/apply' },
    { icon: FileText, label: 'My Applications', path: '/employee/applications' },
    { icon: BookOpen, label: 'Leave Account', path: '/employee/leave-account' },
  ];

  // Approval menus - shown only if user has additional role
  const approvalItems = {
    ControllingOfficer: [
      { icon: Home, label: 'Admin Dashboard', path: '/co/dashboard' },
      { icon: CheckSquare, label: 'Review Inbox', path: '/co/review' },
    ],
    HR: [
      { icon: Home, label: 'Admin Dashboard', path: '/hr/dashboard' },
      { icon: FileText, label: 'Verification Queue', path: '/hr/verify' },
    ],
    SanctionAuthority: [
      { icon: Home, label: 'Admin Dashboard', path: '/sa/dashboard' },
      { icon: CheckSquare, label: 'Sanction Inbox', path: '/sa/sanction' },
    ],
    Accounts: [
      { icon: Home, label: 'Admin Dashboard', path: '/accounts/dashboard' },
      { icon: FileText, label: 'Sanctioned Orders', path: '/accounts/queue' },
    ],
    Admin: [
      { icon: Settings, label: 'Admin Panel', path: '/admin/dashboard' },
      { icon: FileText, label: 'Leave Types', path: '/admin/leave-types' },
      { icon: BookOpen, label: 'Regulations', path: '/admin/regulations' },
      { icon: Shield, label: 'Delegation Matrix', path: '/admin/delegation' },
      { icon: Activity, label: 'Audit Logs', path: '/admin/audit' },
      { icon: Settings, label: 'Templates', path: '/admin/templates' },
      { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    ],
  };

  // Check if user has additional role (not just Employee)
  const hasApprovalRole = role && role !== 'Employee';
  const currentApprovalItems = hasApprovalRole && role ? approvalItems[role] || [] : [];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-background"
        >
          {isCollapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-background border-r z-40 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isCollapsed ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          w-64
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="APTRANSCO" className="h-12 w-auto" />
          </div>
          <div className="mt-2">
            <p className="text-sm font-semibold text-primary">Leave Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Employee Menu - Always shown */}
          <div>
            <div className="px-3 mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Employee
              </p>
            </div>
            <div className="space-y-1">
              {employeeItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (window.innerWidth < 1024) {
                        setIsCollapsed(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary text-left"
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approvals Menu - Shown only if user has additional role */}
          {hasApprovalRole && currentApprovalItems.length > 0 && (
            <div>
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Approvals
                </p>
              </div>
              <div className="space-y-1">
                {currentApprovalItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 1024) {
                          setIsCollapsed(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary text-left"
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t space-y-3">
          <div className="px-3 py-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.employeeId}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                Employee
              </Badge>
              {hasApprovalRole && (
                <Badge variant="default" className="text-xs">
                  {role === 'ControllingOfficer'
                    ? 'CO'
                    : role === 'SanctionAuthority'
                    ? 'SA'
                    : role}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
}
