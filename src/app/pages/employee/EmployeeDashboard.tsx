import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leave.service';
import { NotificationBell } from '../../components/NotificationBell';
import { Plus, FileText, Calendar, CheckCircle2, XCircle, Clock, LogOut } from 'lucide-react';
import type { LeaveBalance } from '../../types';

export function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [stats, setStats] = useState({ pending: 0, sanctioned: 0, rejected: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [balancesData, statsData] = await Promise.all([
        leaveService.getLeaveBalances(user.userId),
        leaveService.getDashboardStats(user.userId),
      ]);

      setBalances(balancesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.designation} • {user?.department}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button onClick={() => navigate('/employee/apply')}>
                <Plus className="w-4 h-4 mr-2" />
                Apply Leave
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                Under review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sanctioned</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.sanctioned}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approved
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <XCircle className="w-4 h-4 mr-1" />
                Not approved
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="w-4 h-4 mr-1" />
                All time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Balances */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Balance Summary</CardTitle>
                <CardDescription>Your current leave balances for 2026</CardDescription>
              </div>
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No leave balances available</p>
            ) : (
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div
                    key={balance.balanceId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">
                          {balance.leaveTypeId === 'lt001' && 'Earned Leave (EL)'}
                          {balance.leaveTypeId === 'lt002' && 'Half Pay Leave (HPL)'}
                          {balance.leaveTypeId === 'lt003' && 'Commuted Leave (CL)'}
                          {balance.leaveTypeId === 'lt005' && 'Casual Leave'}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {balance.year}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Opening: {balance.openingBalance}</span>
                        <span>Credits: {balance.credits}</span>
                        <span>Availed: {balance.availed}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{balance.balance}</div>
                      <div className="text-xs text-muted-foreground">days available</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/employee/apply')}>
            <CardHeader>
              <CardTitle className="text-lg">Apply for Leave</CardTitle>
              <CardDescription>Submit a new leave application</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/employee/applications')}>
            <CardHeader>
              <CardTitle className="text-lg">My Applications</CardTitle>
              <CardDescription>View and track your leave applications</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
