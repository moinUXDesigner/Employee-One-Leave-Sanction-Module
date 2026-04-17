import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from '../hooks/useNavigate';
import { EmployeeDashboard } from './employee/EmployeeDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { FileText, Users, CheckSquare, DollarSign, Settings, LogOut, Calendar, ArrowRight, Download, Eye } from 'lucide-react';
import { getApplicationsByStatus, getUserById, getLeaveTypeById, getLeaveBalance } from '../services/mockData';
import { formatDate } from '../utils/leaveCalculations';
import { autoGenerationService } from '../services/autogeneration.service';
import type { LeaveApplication } from '../types';
import { getAppPath } from '../utils/basePath';

// Placeholder dashboards for other roles
function ControllingOfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    // Load applications pending CO review (Submitted status)
    const submittedApps = getApplicationsByStatus('Submitted');
    // Filter for this CO's team members
    const myTeamApps = submittedApps.filter((app) => {
      const employee = getUserById(app.userId);
      return employee?.controllingOfficer === user?.userId;
    });
    setApplications(myTeamApps.slice(0, 3)); // Show max 3
  }, [user]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Controlling Officer Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • {user?.designation}
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Pending Reviews</CardDescription>
              <CardTitle className="text-3xl">5</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Applications awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Reviewed Today</CardDescription>
              <CardTitle className="text-3xl">8</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Forwarded to HR</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Team Size</CardDescription>
              <CardTitle className="text-3xl">23</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Reporting employees</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Leave applications pending your review</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/co/review')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending applications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const employee = getUserById(app.userId);
                  const leaveType = getLeaveTypeById(app.leaveTypeId);
                  return (
                    <div
                      key={app.applicationId}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/co/review/${app.applicationId}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{employee?.name}</h3>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {employee?.employeeId} • {employee?.designation}
                          </p>
                        </div>
                        <Badge>Submitted</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(app.leaveFromDate)} - {formatDate(app.leaveToDate)}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{app.leaveDays} days</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/co/review/${app.applicationId}`);
                          }}
                        >
                          Review Application
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HRDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    // Load applications forwarded to HR
    const forwarded = getApplicationsByStatus('Forwarded');
    setApplications(forwarded.slice(0, 3)); // Show max 3
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HR Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • {user?.designation}
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Pending Verification</CardDescription>
              <CardTitle className="text-3xl">12</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting balance check</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Verified Today</CardDescription>
              <CardTitle className="text-3xl">15</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Forwarded to SA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Auto-Generated</CardDescription>
              <CardTitle className="text-3xl">10</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Notes and orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>SAP Posted</CardDescription>
              <CardTitle className="text-3xl">8</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Successfully synced</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Verification Queue</CardTitle>
                <CardDescription>Applications pending verification and auto-generation</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/hr/verify')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending verifications</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const employee = getUserById(app.userId);
                  const leaveType = getLeaveTypeById(app.leaveTypeId);
                  return (
                    <div
                      key={app.applicationId}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/hr/verify/${app.applicationId}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{employee?.name}</h3>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {employee?.employeeId} • {employee?.designation}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Forwarded by CO</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(app.leaveFromDate)} - {formatDate(app.leaveToDate)}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{app.leaveDays} days</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/hr/verify/${app.applicationId}`);
                          }}
                        >
                          Verify & Generate Note
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SanctionAuthorityDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    // Load applications pending sanction
    const pending = getApplicationsByStatus('PendingSanction');
    setApplications(pending.slice(0, 3)); // Show max 3
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sanction Authority Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • {user?.designation}
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/sa/sanction')}>
            <CardHeader>
              <CardDescription>Pending Sanction</CardDescription>
              <CardTitle className="text-3xl">7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Sanctioned Today</CardDescription>
              <CardTitle className="text-3xl text-green-600">12</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Approved applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Held</CardDescription>
              <CardTitle className="text-3xl text-orange-600">2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pending clarification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-600">1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sanction Inbox</CardTitle>
                <CardDescription>Applications ready for your sanction</CardDescription>
              </div>
              <Button onClick={() => navigate('/sa/sanction')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No applications pending sanction</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const employee = getUserById(app.userId);
                  const leaveType = getLeaveTypeById(app.leaveTypeId);
                  const latestAction = app.workflowHistory[app.workflowHistory.length - 1];
                  return (
                    <div
                      key={app.applicationId}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/sa/sanction/${app.applicationId}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{employee?.name}</h3>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {employee?.employeeId} • {employee?.designation}
                          </p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">Verified by HR</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(app.leaveFromDate)} - {formatDate(app.leaveToDate)}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{app.leaveDays} days</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Last action: {latestAction.actionByName} ({latestAction.role})
                      </div>
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/sa/sanction/${app.applicationId}`);
                          }}
                        >
                          Review & Sanction
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountsDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [sanctionOrder, setSanctionOrder] = useState<string>('');
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    // Load sanctioned applications that need SAP posting
    const sanctioned = getApplicationsByStatus('Sanctioned');
    setApplications(sanctioned.slice(0, 3)); // Show max 3
  }, []);

  const handleViewOrder = async (e: React.MouseEvent, app: LeaveApplication) => {
    e.stopPropagation();
    setSelectedApp(app);
    setIsOrderDialogOpen(true);
    setIsLoadingOrder(true);

    try {
      const employee = getUserById(app.userId);
      const leaveType = getLeaveTypeById(app.leaveTypeId);
      let balance = getLeaveBalance(app.userId, app.leaveTypeId);

      if (!employee || !leaveType) {
        setSanctionOrder('Error: Unable to load order details - Employee or Leave Type not found');
        setIsLoadingOrder(false);
        return;
      }

      // If balance doesn't exist, create a mock balance based on application data
      if (!balance) {
        balance = {
          balanceId: `temp-${app.applicationId}`,
          userId: app.userId,
          leaveTypeId: app.leaveTypeId,
          year: new Date().getFullYear(),
          openingBalance: app.balanceAtApplication || 30,
          credits: 30,
          totalAvailable: app.balanceAtApplication || 60,
          availed: 0,
          pending: 0,
          balance: app.balanceAfterAvailing || app.balanceAtApplication || 30,
          spellsAvailed: 0,
          spellsPending: 0,
          spellsBalance: 10,
          lastUpdated: new Date().toISOString(),
        };
      }

      const controllingOfficer = employee.controllingOfficer
        ? getUserById(employee.controllingOfficer)
        : undefined;

      const regulations = await autoGenerationService.selectApplicableRegulations(app.leaveTypeId);

      const order = await autoGenerationService.generateDraftSanctionOrder({
        application: app,
        user: employee,
        leaveType,
        balance,
        regulations,
        controllingOfficer,
      });

      setSanctionOrder(order);
    } catch (error) {
      setSanctionOrder(`Error: Failed to generate sanction order\n\n${error instanceof Error ? error.message : String(error)}`);
      console.error('Order generation error:', error);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!sanctionOrder || !selectedApp) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }

    const employee = getUserById(selectedApp.userId);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sanction Order - ${selectedApp.applicationId}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              padding: 40px;
              max-width: 210mm;
              margin: 0 auto;
            }
            h1 { text-align: center; margin-bottom: 20px; }
            pre {
              white-space: pre-wrap;
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <pre>${sanctionOrder}</pre>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Accounts Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • {user?.designation}
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-3xl">45</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All sanctioned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl text-primary">28</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Current period</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/accounts/queue')}>
            <CardHeader>
              <CardDescription>View All Orders</CardDescription>
              <CardTitle className="text-3xl text-green-600">→</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Click to view details</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sanctioned Leave Orders</CardTitle>
                <CardDescription>View sanctioned orders from all HR wings</CardDescription>
              </div>
              <Button onClick={() => navigate('/accounts/queue')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sanctioned orders pending SAP posting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const employee = getUserById(app.userId);
                  const leaveType = getLeaveTypeById(app.leaveTypeId);
                  const sapStatus = app.sapPostingStatus || 'Pending';
                  return (
                    <div
                      key={app.applicationId}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/accounts/detail/${app.applicationId}`)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{employee?.name}</h3>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {employee?.employeeId} • {employee?.designation}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Sanctioned</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(app.leaveFromDate)} - {formatDate(app.leaveToDate)}
                          </span>
                        </div>
                        <span>•</span>
                        <span>{app.leaveDays} days</span>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-muted-foreground">
                          SAP Status: <span className="font-medium">{sapStatus}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleViewOrder(e, app)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Order
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sanction Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="w-[75vw] max-w-[75vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sanction Order</DialogTitle>
            <DialogDescription>
              Application ID: {selectedApp?.applicationId}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {isLoadingOrder ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin mb-4">⏳</div>
                  <p className="text-muted-foreground">Generating sanction order...</p>
                </div>
              </div>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6">
                <pre className="whitespace-pre-wrap font-mono text-sm">{sanctionOrder}</pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isLoadingOrder}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminDashboardMain() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.name} • System Administrator
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/leave-types')}>
            <CardHeader>
              <CardDescription>Leave Types</CardDescription>
              <CardTitle className="text-3xl">12</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configured types</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/regulations')}>
            <CardHeader>
              <CardDescription>Regulations</CardDescription>
              <CardTitle className="text-3xl">23</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active regulations</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/delegation')}>
            <CardHeader>
              <CardDescription>Delegations</CardDescription>
              <CardTitle className="text-3xl">8</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active rules</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/audit')}>
            <CardHeader>
              <CardDescription>Audit Logs</CardDescription>
              <CardTitle className="text-3xl">1,234</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/dashboard')}>
            <CardHeader>
              <CardTitle>Complete Admin Panel</CardTitle>
              <CardDescription>Access all administration modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Settings className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Click to view full admin dashboard</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/templates')}>
            <CardHeader>
              <CardTitle>Order Templates</CardTitle>
              <CardDescription>Manage auto-generation templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">5 templates configured</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function DashboardRouter() {
  const { role } = useAuth();
  const currentPath = getAppPath(window.location.pathname);

  // Employee Dashboard - shown for /dashboard route
  if (currentPath === '/dashboard') {
    return <EmployeeDashboard />;
  }

  // Role-specific Approval Dashboards - shown for role-specific routes
  if (currentPath === '/co/dashboard' && role === 'ControllingOfficer') {
    return <ControllingOfficerDashboard />;
  }
  if (currentPath === '/hr/dashboard' && role === 'HR') {
    return <HRDashboard />;
  }
  if (currentPath === '/sa/dashboard' && role === 'SanctionAuthority') {
    return <SanctionAuthorityDashboard />;
  }
  if (currentPath === '/accounts/dashboard' && role === 'Accounts') {
    return <AccountsDashboard />;
  }
  if (currentPath === '/admin/dashboard' && role === 'Admin') {
    return <AdminDashboardMain />;
  }

  // Default fallback based on role
  switch (role) {
    case 'Employee':
      return <EmployeeDashboard />;
    case 'ControllingOfficer':
      return <ControllingOfficerDashboard />;
    case 'HR':
      return <HRDashboard />;
    case 'SanctionAuthority':
      return <SanctionAuthorityDashboard />;
    case 'Accounts':
      return <AccountsDashboard />;
    case 'Admin':
      return <AdminDashboardMain />;
    default:
      return <EmployeeDashboard />;
  }
}
