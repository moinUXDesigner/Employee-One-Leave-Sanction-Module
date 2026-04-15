import { useState } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { QuickStats } from '../../components/DashboardWidget';
import { DEMO_USERS, LEAVE_TYPES } from '../../services/mockData';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  PieChart,
  LogOut,
} from 'lucide-react';

export function ReportsAnalytics() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const reportStats = [
    {
      title: 'Total Applications',
      value: 156,
      description: 'This month',
      icon: FileText,
      trend: { value: 12, label: 'vs last month' },
      color: 'info' as const,
    },
    {
      title: 'Sanctioned',
      value: 128,
      description: '82% approval rate',
      icon: TrendingUp,
      trend: { value: 5, label: 'vs last month' },
      color: 'success' as const,
    },
    {
      title: 'Pending',
      value: 18,
      description: 'Awaiting action',
      icon: Calendar,
      trend: { value: -8, label: 'vs last month' },
      color: 'warning' as const,
    },
    {
      title: 'Rejected',
      value: 10,
      description: '6.4% rejection rate',
      icon: Users,
      trend: { value: 2, label: 'vs last month' },
      color: 'danger' as const,
    },
  ];

  const leaveTypeStats = [
    { name: 'Earned Leave', count: 65, percentage: 42 },
    { name: 'Casual Leave', count: 38, percentage: 24 },
    { name: 'Medical Leave', count: 28, percentage: 18 },
    { name: 'HPL', count: 15, percentage: 10 },
    { name: 'Others', count: 10, percentage: 6 },
  ];

  const departmentStats = [
    { name: 'Operations', count: 45, avgDays: 8.5 },
    { name: 'Maintenance', count: 38, avgDays: 7.2 },
    { name: 'Administration', count: 32, avgDays: 6.8 },
    { name: 'Finance', count: 25, avgDays: 5.5 },
    { name: 'HR', count: 16, avgDays: 6.0 },
  ];

  const monthlyTrend = [
    { month: 'Jan', count: 142 },
    { month: 'Feb', count: 138 },
    { month: 'Mar', count: 151 },
    { month: 'Apr', count: 156 },
  ];

  const handleExportReport = () => {
    // Mock export functionality
    alert('Report export functionality - Would download PDF/Excel report');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Insights and analytics for leave management
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
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
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-quarter">This Quarter</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="admin">Administration</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Leave Type</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leave Types</SelectItem>
                    {LEAVE_TYPES.slice(0, 5).map((lt) => (
                      <SelectItem key={lt.leaveTypeId} value={lt.leaveTypeId}>
                        {lt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <QuickStats stats={reportStats} columns={4} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Type Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leave Type Distribution</CardTitle>
                  <CardDescription>Applications by leave type</CardDescription>
                </div>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveTypeStats.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department Statistics</CardTitle>
                  <CardDescription>Applications and average days by department</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{dept.name}</span>
                        <span className="text-sm text-muted-foreground">{dept.count} apps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(dept.count / 45) * 100}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {dept.avgDays} days avg
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Trend</CardTitle>
                  <CardDescription>Leave applications over the last 4 months</CardDescription>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-4 h-48">
                {monthlyTrend.map((month, index) => {
                  const maxCount = Math.max(...monthlyTrend.map((m) => m.count));
                  const heightPercentage = (month.count / maxCount) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-sm font-medium text-primary">{month.count}</div>
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80"
                        style={{ height: `${heightPercentage}%` }}
                      />
                      <div className="text-sm text-muted-foreground">{month.month}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Important trends and observations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">Improved Processing Time</h4>
                    <p className="text-sm text-green-700">
                      Average processing time reduced by 18% compared to last month. Auto-generation
                      is significantly speeding up workflows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Peak Application Period</h4>
                    <p className="text-sm text-blue-700">
                      Most applications are submitted in the first week of each month. Consider
                      resource allocation accordingly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 mb-1">Operations Department</h4>
                    <p className="text-sm text-orange-700">
                      Operations has the highest leave usage. May need additional manpower during
                      peak leave seasons.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900 mb-1">High Approval Rate</h4>
                    <p className="text-sm text-purple-700">
                      82% approval rate indicates good compliance with leave policies and proper
                      balance management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
