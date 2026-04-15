import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leave.service';
import { getUserById, getLeaveTypeById, updateApplicationStatus, addWorkflowHistory } from '../../services/mockData';
import { formatDate, formatDaysDisplay } from '../../utils/leaveCalculations';
import type { LeaveApplication } from '../../types';
import { ArrowLeft, Search, Calendar, User, FileText, AlertCircle, Send, ArrowLeftCircle } from 'lucide-react';
import { BulkActionToolbar } from '../../components/BulkActionToolbar';
import { BulkActionDialog } from '../../components/BulkActionDialog';
import { toast } from 'sonner';

export function COReviewInbox() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<LeaveApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'forward' | 'return'>('forward');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const loadPendingApplications = async () => {
    try {
      // Get applications at ControllingOfficer stage
      const pending = await leaveService.getPendingApplications('ControllingOfficer');

      // Filter for this CO's team members
      const myTeamApps = pending.filter((app) => {
        const employee = getUserById(app.userId);
        return employee?.controllingOfficer === user?.userId;
      });

      setApplications(myTeamApps.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setIsLoading(false);
    }
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

    setFilteredApps(filtered);
  };

  const getOverdueStatus = (applicationDate: string): boolean => {
    const appDate = new Date(applicationDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 3; // Overdue if more than 3 days old
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

  const handleBulkAction = (actionType: 'forward' | 'return') => {
    setBulkActionType(actionType);
    setBulkDialogOpen(true);
  };

  const handleBulkConfirm = async (remarks?: string) => {
    setIsProcessing(true);
    const selectedApps = applications.filter((app) => selectedIds.has(app.applicationId));

    try {
      for (const app of selectedApps) {
        if (bulkActionType === 'forward') {
          updateApplicationStatus(app.applicationId, 'Forwarded');
          addWorkflowHistory(app.applicationId, {
            action: 'Forwarded to HR',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'ControllingOfficer',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'Forwarded',
            remarks: remarks || 'Bulk forwarded by Controlling Officer',
          });
        } else {
          updateApplicationStatus(app.applicationId, 'ReturnedForCorrection');
          addWorkflowHistory(app.applicationId, {
            action: 'Returned for Correction',
            actionBy: user?.userId || '',
            actionByName: user?.name || '',
            role: 'ControllingOfficer',
            actionDate: new Date().toISOString(),
            fromStatus: app.status,
            toStatus: 'ReturnedForCorrection',
            remarks: remarks || 'Bulk returned by Controlling Officer',
          });
        }
      }

      toast.success(
        `Successfully ${bulkActionType === 'forward' ? 'forwarded' : 'returned'} ${selectedApps.length} application${selectedApps.length !== 1 ? 's' : ''}`
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading applications...</p>
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Review Inbox</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {applications.length} application{applications.length !== 1 && 's'} pending your review
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Search and Select All */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, ID, or application ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {filteredApps.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectedIds.size === filteredApps.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer select-none"
                >
                  Select all {filteredApps.length} application{filteredApps.length !== 1 && 's'}
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No Applications Found' : 'No Pending Reviews'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? 'Try adjusting your search term'
                    : 'All applications have been reviewed'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((application) => {
              const employee = getUserById(application.userId);
              const leaveType = getLeaveTypeById(application.leaveTypeId);
              const isOverdue = getOverdueStatus(application.applicationDate);

              return (
                <Card
                  key={application.applicationId}
                  className={`hover:shadow-md transition-shadow ${
                    isOverdue ? 'border-orange-500' : ''
                  } ${selectedIds.has(application.applicationId) ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div
                        className="pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.has(application.applicationId)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(application.applicationId, checked as boolean)
                          }
                        />
                      </div>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/co/review/${application.applicationId}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-primary" />
                              <CardTitle className="text-lg">
                                {employee?.name}
                              </CardTitle>
                            </div>
                            <CardDescription>
                              {employee?.employeeId} • {employee?.designation}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge>{leaveType?.code}</Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent
                    className="space-y-4 cursor-pointer"
                    onClick={() => navigate(`/co/review/${application.applicationId}`)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Leave Period</div>
                          <div className="font-medium">
                            {formatDate(application.leaveFromDate)} - {formatDate(application.leaveToDate)}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="font-medium">
                          {formatDaysDisplay(application.totalDays)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Applied On</div>
                        <div className="font-medium">
                          {formatDate(application.applicationDate)}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Reason</div>
                      <div className="text-sm line-clamp-2">{application.reasonForLeave}</div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/co/review/${application.applicationId}`);
                        }}
                      >
                        Review Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          {
            label: 'Forward to HR',
            icon: <Send className="w-4 h-4 mr-1" />,
            onClick: () => handleBulkAction('forward'),
            variant: 'default',
          },
          {
            label: 'Return for Correction',
            icon: <ArrowLeftCircle className="w-4 h-4 mr-1" />,
            onClick: () => handleBulkAction('return'),
            variant: 'outline',
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
