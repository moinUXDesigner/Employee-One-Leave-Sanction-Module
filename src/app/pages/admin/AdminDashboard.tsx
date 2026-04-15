import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { DEMO_USERS, LEAVE_TYPES, REGULATIONS, DELEGATION_MATRIX } from '../../services/mockData';
import {
  Settings,
  Users,
  FileText,
  BookOpen,
  Shield,
  Activity,
  ChevronRight,
  BarChart3,
  LogOut,
} from 'lucide-react';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    leaveTypes: 0,
    activeRegulations: 0,
    delegationRules: 0,
    auditLogs: 1234,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setStats({
      totalUsers: DEMO_USERS.length,
      activeUsers: DEMO_USERS.filter((u) => u.isActive).length,
      leaveTypes: LEAVE_TYPES.filter((lt) => lt.isActive).length,
      activeRegulations: REGULATIONS.filter((r) => r.isActive).length,
      delegationRules: DELEGATION_MATRIX.filter((d) => d.isActive).length,
      auditLogs: 1234,
    });
  };

  const adminModules = [
    {
      title: 'Delegation Matrix',
      description: 'Manage delegation of powers for leave sanctions',
      icon: Shield,
      path: '/admin/delegation',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      count: stats.delegationRules,
    },
    {
      title: 'Leave Regulations',
      description: 'View and manage leave regulations library',
      icon: BookOpen,
      path: '/admin/regulations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: stats.activeRegulations,
    },
    {
      title: 'Leave Types Master',
      description: 'Configure leave types and eligibility rules',
      icon: FileText,
      path: '/admin/leave-types',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: stats.leaveTypes,
    },
    {
      title: 'Audit Log Explorer',
      description: 'View system audit trails and activity logs',
      icon: Activity,
      path: '/admin/audit',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      count: stats.auditLogs,
    },
    {
      title: 'Order Templates',
      description: 'Manage document templates for auto-generation',
      icon: Settings,
      path: '/admin/templates',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      count: 5,
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      count: stats.activeUsers,
    },
    {
      title: 'Reports & Analytics',
      description: 'View insights and analytics for leave management',
      icon: BarChart3,
      path: '/admin/reports',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      count: 156,
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">System Administration</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • System Administrator
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {stats.activeUsers} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Leave Types</CardDescription>
              <CardTitle className="text-3xl">{stats.leaveTypes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="w-4 h-4 mr-1" />
                Active types
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Regulations</CardDescription>
              <CardTitle className="text-3xl">{stats.activeRegulations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4 mr-1" />
                Documents
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Delegations</CardDescription>
              <CardTitle className="text-3xl">{stats.delegationRules}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="w-4 h-4 mr-1" />
                Active rules
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Audit Logs</CardDescription>
              <CardTitle className="text-3xl">{stats.auditLogs}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="w-4 h-4 mr-1" />
                This month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Templates</CardDescription>
              <CardTitle className="text-3xl">5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Settings className="w-4 h-4 mr-1" />
                Configured
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Modules */}
        <div>
          <h2 className="text-xl font-bold mb-4">Administration Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminModules.map((module) => {
              const Icon = module.icon;
              return (
                <Card
                  key={module.path}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(module.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg ${module.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${module.color}`} />
                      </div>
                      <Badge variant="outline">{module.count}</Badge>
                    </div>
                    <CardTitle className="mt-4">{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(module.path);
                      }}
                    >
                      Open Module
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-16 justify-start"
                onClick={() => navigate('/admin/reports')}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Reports</div>
                  <div className="text-xs text-muted-foreground">System analytics</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16 justify-start">
                <Settings className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">System Settings</div>
                  <div className="text-xs text-muted-foreground">Configuration</div>
                </div>
              </Button>
              <Button variant="outline" className="h-16 justify-start">
                <Activity className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">View Activity</div>
                  <div className="text-xs text-muted-foreground">Recent logs</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Application Version</div>
                <div className="font-medium">v1.0.0 - Phase 5</div>
              </div>
              <div>
                <div className="text-muted-foreground">Environment</div>
                <div className="font-medium">Development (Mock Data)</div>
              </div>
              <div>
                <div className="text-muted-foreground">Database</div>
                <div className="font-medium">localStorage (Mock)</div>
              </div>
              <div>
                <div className="text-muted-foreground">Last System Update</div>
                <div className="font-medium">April 15, 2026</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
