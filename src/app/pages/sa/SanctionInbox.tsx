import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getApplicationsByStatus, getLeaveTypeById, getUserById, updateApplicationStatus, addWorkflowHistory } from '../../services/mockData';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import type { LeaveApplication } from '../../types';
import { FileText, Clock, User, Calendar, Search, Filter, AlertCircle, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { BulkActionToolbar } from '../../components/BulkActionToolbar';
import { BulkActionDialog } from '../../components/BulkActionDialog';
import { toast } from 'sonner';

export function SanctionInbox() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'sanction' | 'reject'>('sanction');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterLeaveType, filterPriority]);

  const loadApplications = () => {
    // Get applications that are pending sanction
    const pendingApps = getApplicationsByStatus('PendingSanction');
    setApplications(pendingApps);
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLeaveType !== 'all') {
      filtered = filtered.filter((app) => app.leaveTypeId === filterLeaveType);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter((app) => {
        const days = calculateLeaveDays(
          app.leaveFromDate,
          app.leaveFromSession,
          app.leaveToDate,
          app.leaveToSession
        );
        if (filterPriority === 'urgent') return days >= 30;
        if (filterPriority === 'normal') return days < 30;
        return true;
      });
    }

    setFilteredApplications(filtered);
  };

  const viewApplication = (applicationId: string) => {
    navigate(`/sa/sanction/${applicationId}`);
  };

  const getPriorityBadge = (app: LeaveApplication) => {
    const days = calculateLeaveDays(app.leaveFromDate, app.leaveFromSession, app.leaveToDate, app.leaveToSession);
    if (days >= 30) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Urgent
        </Badge>
      );
    }
    return <Badge variant="outline">Normal</Badge>;
  };

  const getDaysFromSubmission = (submittedDate: string): number => {
    const submitted = new Date(submittedDate);
    const now = new Date();
    return Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredApplications.map((app) => app.applicationId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (applicationId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(applicationId);
    } else {
      newSelected.delete(applicationId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = (actionType: 'sanction' | 'reject') => {
    setBulkActionType(actionType);
    setBulkDialogOpen(true);
  };

  const handleBulkConfirm = async (remarks?: string) => {
    setIsProcessing(true);
    const selectedApps = applications.filter((app) => selectedIds.has(app.applicationId));

    try {
      for (const app of selectedApps) {
        if (bulkActionType === 'sanction') {
          updateApplicationStatus(app.applicationId, 'Sanctioned');
          addWorkflowHistory(app.applicationId, {
            action: 'Sanctioned',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'SanctionAuthority',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'Sanctioned',
            remarks: remarks || 'Bulk sanctioned by Sanction Authority',
          });
        } else {
          updateApplicationStatus(app.applicationId, 'Rejected');
          addWorkflowHistory(app.applicationId, {
            action: 'Rejected by SA',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'SanctionAuthority',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'Rejected',
            remarks: remarks || 'Bulk rejected by Sanction Authority',
          });
        }
      }

      toast.success(
        `Successfully ${bulkActionType === 'sanction' ? 'sanctioned' : 'rejected'} ${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''}`
      );

      setSelectedIds(new Set());
      setBulkDialogOpen(false);
      loadApplications();
    } catch (error) {
      toast.error('Failed to process bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedApplications = () => {
    return applications.filter((app) => selectedIds.has(app.applicationId));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sanction Inbox</h1>
              <p className="text-sm opacity-90 mt-1">
                Applications pending your sanction approval
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Sanction</CardDescription>
              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Total applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Urgent</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {
                  applications.filter(
                    (app) =>
                      calculateLeaveDays(app.leaveFromDate, app.leaveFromSession, app.leaveToDate, app.leaveToSession) >=
                      30
                  ).length
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Long duration leaves</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending &gt; 3 Days</CardDescription>
              <CardTitle className="text-3xl text-orange-600">
                {applications.filter((app) => getDaysFromSubmission(app.applicationDate!) > 3).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>This Month</CardDescription>
              <CardTitle className="text-3xl">
                {
                  applications.filter((app) => {
                    const submitted = new Date(app.applicationDate!);
                    const now = new Date();
                    return (
                      submitted.getMonth() === now.getMonth() &&
                      submitted.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">New applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About Sanction Process</h3>
                <p className="text-sm text-muted-foreground">
                  Applications shown here have been verified by HR and are awaiting your final
                  sanction. Review the auto-generated draft order, make edits if needed, and approve
                  or reject the application. All sanctioned applications will be posted to SAP automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application number or employee ID..."
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
                  <SelectItem value="LT-001">Earned Leave</SelectItem>
                  <SelectItem value="LT-002">Half Pay Leave</SelectItem>
                  <SelectItem value="LT-003">Casual Leave</SelectItem>
                  <SelectItem value="LT-004">Medical Leave</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent (&gt;30 days)</SelectItem>
                  <SelectItem value="normal">Normal (&lt;30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Pending Sanction</CardTitle>
            <CardDescription>
              {filteredApplications.length} application{filteredApplications.length !== 1 && 's'}{' '}
              found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          filteredApplications.length > 0 &&
                          selectedIds.size === filteredApplications.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No applications pending sanction
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => {
                      const leaveType = getLeaveTypeById(app.leaveTypeId);
                      const employee = getUserById(app.employeeId);
                      const days = calculateLeaveDays(
                        app.leaveFromDate,
                        app.leaveFromSession,
                        app.leaveToDate,
                        app.leaveToSession
                      );
                      const daysFromSubmission = getDaysFromSubmission(app.applicationDate!);

                      return (
                        <TableRow
                          key={app.applicationId}
                          className={`hover:bg-muted/50 ${
                            selectedIds.has(app.applicationId) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(app.applicationId)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(app.applicationId, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <div>
                              <div className="font-medium font-mono text-sm">
                                {app.applicationNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {app.applicationId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{employee?.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {app.employeeId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(app.leaveFromDate)} ({app.leaveFromSession})
                              </div>
                              <div className="text-muted-foreground">
                                to {formatDate(app.leaveToDate)} ({app.leaveToSession})
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <div className="font-medium">{days} days</div>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            <div className="text-sm">
                              <div>{formatDate(app.applicationDate!)}</div>
                              <div className="text-muted-foreground">
                                {daysFromSubmission} day{daysFromSubmission !== 1 && 's'} ago
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            className="cursor-pointer"
                            onClick={() => viewApplication(app.applicationId)}
                          >
                            {getPriorityBadge(app)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewApplication(app.applicationId);
                              }}
                            >
                              Review
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

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          {
            label: 'Sanction All',
            icon: <CheckCircle className="w-4 h-4 mr-1" />,
            onClick: () => handleBulkAction('sanction'),
            variant: 'default',
          },
          {
            label: 'Reject All',
            icon: <XCircle className="w-4 h-4 mr-1" />,
            onClick: () => handleBulkAction('reject'),
            variant: 'destructive',
          },
        ]}
      />

      {/* Bulk Action Dialog */}
      <BulkActionDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onConfirm={handleBulkConfirm}
        applications={getSelectedApplications()}
        actionType={bulkActionType}
        isProcessing={isProcessing}
      />
    </div>
  );
}
