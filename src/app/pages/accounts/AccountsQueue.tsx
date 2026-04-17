import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { getApplicationsByStatus, getLeaveTypeById, getUserById, getLeaveBalance } from '../../services/mockData';
import { formatDate } from '../../utils/leaveCalculations';
import { autoGenerationService } from '../../services/autogeneration.service';
import type { LeaveApplication } from '../../types';
import {
  FileText,
  User,
  Calendar,
  Search,
  LogOut,
  Eye,
  Download,
} from 'lucide-react';

export function AccountsQueue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [sanctionOrder, setSanctionOrder] = useState<string>('');
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterLeaveType]);

  const loadApplications = () => {
    // Get sanctioned applications
    const sanctionedApps = getApplicationsByStatus('Sanctioned');
    setApplications(sanctionedApps);
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const employee = getUserById(app.userId);
        return (
          app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (filterLeaveType !== 'all') {
      filtered = filtered.filter((app) => app.leaveTypeId === filterLeaveType);
    }

    setFilteredApplications(filtered);
  };

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

      // If balance doesn't exist, create a mock balance
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

  // Get unique leave types for filter
  const leaveTypes = Array.from(new Set(applications.map(app => app.leaveTypeId)))
    .map(id => getLeaveTypeById(id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sanctioned Leave Orders</h1>
              <p className="text-sm opacity-90 mt-1">
                View and manage sanctioned leave applications from all HR wings
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Sanctioned Orders</CardDescription>
              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All HR wings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {applications.filter(app => {
                  const appDate = new Date(app.applicationDate);
                  const now = new Date();
                  return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
                }).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Sanctioned applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Leave Types</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {leaveTypes.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Different categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application ID, employee name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt!.leaveTypeId} value={lt!.leaveTypeId}>
                      {lt!.name} ({lt!.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sanctioned Leave Orders</CardTitle>
            <CardDescription>
              {filteredApplications.length} sanctioned order{filteredApplications.length !== 1 && 's'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Application Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No sanctioned orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => {
                      const leaveType = getLeaveTypeById(app.leaveTypeId);
                      const employee = getUserById(app.userId);

                      return (
                        <TableRow
                          key={app.applicationId}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div className="font-medium font-mono text-sm">
                              {app.applicationId}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{employee?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {employee?.employeeId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(app.leaveFromDate)}
                              </div>
                              <div className="text-muted-foreground">
                                to {formatDate(app.leaveToDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{app.leaveDays} days</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(app.applicationDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">
                              Sanctioned
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleViewOrder(e, app)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Order
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sanction Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-y-auto">
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
