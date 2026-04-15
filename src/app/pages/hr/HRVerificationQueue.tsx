import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getApplicationsByStatus, getUserById, getLeaveTypeById, updateApplicationStatus, addWorkflowHistory } from '../../services/mockData';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import type { LeaveApplication } from '../../types';
import { ArrowLeft, Search, Calendar, User as UserIcon, FileText, Sparkles, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { BulkActionToolbar } from '../../components/BulkActionToolbar';
import { BulkActionDialog } from '../../components/BulkActionDialog';
import { toast } from 'sonner';

export function HRVerificationQueue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<LeaveApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'verify' | 'reject' | 'return'>('verify');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const loadPendingApplications = () => {
    // Get applications that are forwarded to HR (status: Forwarded or UnderVerification)
    const forwarded = getApplicationsByStatus('Forwarded');
    const underVerification = getApplicationsByStatus('UnderVerification');
    const allApps = [...forwarded, ...underVerification];

    setApplications(allApps.sort((a, b) =>
      new Date(b.submittedDate!).getTime() - new Date(a.submittedDate!).getTime()
    ));
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter((app) => {
        const employee = getUserById(app.employeeId);
        return (
          app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredApps(filtered);
  };

  const viewApplication = (applicationId: string) => {
    navigate(`/hr/verify/${applicationId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredApps.map((app) => app.applicationId)));
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

  const handleBulkAction = (actionType: 'verify' | 'reject' | 'return') => {
    setBulkActionType(actionType);
    setBulkDialogOpen(true);
  };

  const handleBulkConfirm = async (remarks?: string) => {
    setIsProcessing(true);
    const selectedApps = applications.filter((app) => selectedIds.has(app.applicationId));

    try {
      for (const app of selectedApps) {
        if (bulkActionType === 'verify') {
          updateApplicationStatus(app.applicationId, 'PendingSanction');
          addWorkflowHistory(app.applicationId, {
            action: 'Verified and Forwarded to SA',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'HR',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'PendingSanction',
            remarks: remarks || 'Bulk verified by HR',
          });
        } else if (bulkActionType === 'reject') {
          updateApplicationStatus(app.applicationId, 'Rejected');
          addWorkflowHistory(app.applicationId, {
            action: 'Rejected by HR',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'HR',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'Rejected',
            remarks: remarks || 'Bulk rejected by HR',
          });
        } else {
          updateApplicationStatus(app.applicationId, 'ReturnedForCorrection');
          addWorkflowHistory(app.applicationId, {
            action: 'Returned for Correction',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'HR',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'ReturnedForCorrection',
            remarks: remarks || 'Bulk returned by HR',
          });
        }
      }

      const actionLabel =
        bulkActionType === 'verify'
          ? 'verified'
          : bulkActionType === 'reject'
          ? 'rejected'
          : 'returned';

      toast.success(
        `Successfully ${actionLabel} ${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''}`
      );

      setSelectedIds(new Set());
      setBulkDialogOpen(false);
      loadPendingApplications();
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
              <h1 className="text-2xl font-bold">HR Verification Queue</h1>
              <p className="text-sm opacity-90 mt-1">
                Verify leave applications and forward to Sanction Authority
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Verification</CardDescription>
              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Applications awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Auto-Generation</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-600" />
                ON
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Internal notes ready</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Verified Today</CardDescription>
              <CardTitle className="text-3xl text-green-600">0</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Forwarded to SA</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">HR Verification Process</h3>
                <p className="text-sm text-muted-foreground">
                  Verify leave balance, check eligibility, review auto-generated internal notes, and
                  forward to Sanction Authority. Internal notes are automatically generated for each
                  application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by application number, employee ID, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Pending Verification</CardTitle>
            <CardDescription>
              {filteredApps.length} application{filteredApps.length !== 1 && 's'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={filteredApps.length > 0 && selectedIds.size === filteredApps.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No applications pending verification
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApps.map((app) => {
                      const leaveType = getLeaveTypeById(app.leaveTypeId);
                      const employee = getUserById(app.employeeId);
                      const days = app.leaveDays;

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
                              <UserIcon className="w-4 h-4 text-muted-foreground" />
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
                            <div className="text-sm">{formatDate(app.applicationDate!)}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewApplication(app.applicationId);
                              }}
                            >
                              Verify
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
            label: 'Verify & Forward',
            icon: <CheckCircle className="w-4 h-4 mr-1" />,
            onClick: () => handleBulkAction('verify'),
            variant: 'default',
          },
          {
            label: 'Reject',
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
