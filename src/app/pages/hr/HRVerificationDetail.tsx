import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  getApplicationById,
  getLeaveTypeById,
  getUserById,
  getLeaveBalance,
  updateApplicationStatus,
  addWorkflowHistory,
  REGULATIONS,
} from '../../services/mockData';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import { toast } from 'sonner';
import type { LeaveApplication, Regulation } from '../../types';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  History,
  BookOpen,
} from 'lucide-react';

export function HRVerificationDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [internalNote, setInternalNote] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'verify' | 'return' | 'reject'>('verify');
  const [actionRemarks, setActionRemarks] = useState('');
  const [applicableRegulations, setApplicableRegulations] = useState<Regulation[]>([]);

  useEffect(() => {
    if (id) {
      loadApplication(id);
    }
  }, [id]);

  const loadApplication = async (applicationId: string) => {
    const app = getApplicationById(applicationId);
    if (app) {
      setApplication(app);
      await generateInternalNote(app);
      loadApplicableRegulations(app);
    }
  };

  const generateInternalNote = async (app: LeaveApplication) => {
    setIsGenerating(true);
    try {
      const leaveType = getLeaveTypeById(app.leaveTypeId);
      const employee = getUserById(app.employeeId);
      const balance = getLeaveBalance(app.employeeId, app.leaveTypeId);
      const days = calculateLeaveDays(app.fromDate, app.fromSession, app.toDate, app.toSession);

      if (!leaveType || !employee || !balance) {
        toast.error('Failed to generate note: Missing data');
        return;
      }

      const note = `INTERNAL NOTE

TO: Sanctioning Authority
FROM: HR Department
DATE: ${formatDate(new Date().toISOString())}
SUBJECT: Verification of ${leaveType.name} application of ${employee.name}

*****

REFERENCE:
Application No: ${app.applicationNumber}
Submitted Date: ${formatDate(app.applicationDate!)}

EMPLOYEE DETAILS:
Name: ${employee.name}
Employee ID: ${employee.employeeId}
Designation: ${employee.designation}
Department: ${employee.department}
Office: ${employee.office}

LEAVE DETAILS:
Type: ${leaveType.name} (${leaveType.code})
Period: ${formatDate(app.fromDate)} (${app.fromSession}) to ${formatDate(app.toDate)} (${app.toSession})
Duration: ${days} days
Reason: ${app.reason}

LEAVE ADDRESS:
${app.leaveAddress}
Contact: ${app.contactNumber || 'N/A'}

LEAVE BALANCE VERIFICATION:
Opening Balance: ${balance.openingBalance} days
Credited: ${balance.credited} days
Availed (Current Year): ${balance.availed} days
Available Balance: ${balance.openingBalance + balance.credited - balance.availed} days
Applied For: ${days} days
Balance After Sanction: ${balance.openingBalance + balance.credited - balance.availed - days} days

ELIGIBILITY CHECK:
✓ Employee is eligible for ${leaveType.name}
✓ Sufficient leave balance available
✓ Application is in order
${leaveType.requiresMedicalCertificate ? '✓ Medical certificate required (to be verified)' : ''}
${app.prefixDays > 0 ? `✓ Prefix holidays: ${app.prefixDays} days` : ''}
${app.suffixDays > 0 ? `✓ Suffix holidays: ${app.suffixDays} days` : ''}

RECOMMENDATION:
The leave balance has been verified and found to be in order. The application may be forwarded to the Sanctioning Authority for approval.

${user?.name}
HR Department
${formatDate(new Date().toISOString())}`;

      setInternalNote(note);
    } catch (error) {
      toast.error('Failed to generate internal note');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadApplicableRegulations = (app: LeaveApplication) => {
    const leaveType = getLeaveTypeById(app.leaveTypeId);
    if (leaveType && leaveType.applicableRegulations) {
      const regs = REGULATIONS.filter((r) =>
        leaveType.applicableRegulations?.includes(r.regulationId)
      );
      setApplicableRegulations(regs);
    }
  };

  const openActionDialog = (type: 'verify' | 'return' | 'reject') => {
    setActionType(type);
    setActionRemarks('');
    setIsActionDialogOpen(true);
  };

  const handleAction = () => {
    if (!application) return;

    let newStatus: any;
    let action = '';
    let message = '';

    switch (actionType) {
      case 'verify':
        newStatus = 'PendingSanction';
        action = 'Verified and Forwarded';
        message = 'Application verified and forwarded to Sanction Authority';
        break;
      case 'return':
        if (!actionRemarks.trim()) {
          toast.error('Please provide reason for returning');
          return;
        }
        newStatus = 'ReturnedForCorrection';
        action = 'Returned for Correction';
        message = 'Application returned to employee for correction';
        break;
      case 'reject':
        if (!actionRemarks.trim()) {
          toast.error('Please provide rejection reason');
          return;
        }
        newStatus = 'Rejected';
        action = 'Rejected by HR';
        message = 'Application rejected';
        break;
    }

    updateApplicationStatus(application.applicationId, newStatus);
    addWorkflowHistory(application.applicationId, {
      actionDate: new Date().toISOString(),
      actionBy: user!.userId,
      actionByName: user!.name,
      action,
      fromStatus: application.status,
      toStatus: newStatus,
      remarks: actionRemarks || `${action} by HR`,
      role: 'HR',
    });

    toast.success(message);
    setIsActionDialogOpen(false);
    navigate('/hr/verify');
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  const leaveType = getLeaveTypeById(application.leaveTypeId);
  const employee = getUserById(application.employeeId);
  const balance = getLeaveBalance(application.employeeId, application.leaveTypeId);
  const days = calculateLeaveDays(
    application.fromDate,
    application.fromSession,
    application.toDate,
    application.toSession
  );

  const availableBalance = balance
    ? balance.openingBalance + balance.credited - balance.availed
    : 0;
  const balanceAfter = availableBalance - days;
  const hasBalance = balanceAfter >= 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => navigate('/hr/verify')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">HR Verification</h1>
                <p className="text-sm opacity-90 mt-1">{application.applicationNumber}</p>
              </div>
            </div>
            <Badge className={hasBalance ? 'bg-green-600' : 'bg-red-600'}>
              {hasBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => openActionDialog('verify')}
            disabled={!hasBalance}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify & Forward to SA
          </Button>
          <Button variant="outline" onClick={() => openActionDialog('return')}>
            <Send className="w-4 h-4 mr-2" />
            Return for Correction
          </Button>
          <Button variant="destructive" onClick={() => openActionDialog('reject')}>
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>

        <Tabs defaultValue="application" className="space-y-4">
          <TabsList className="inline-flex h-auto p-1 bg-muted rounded-full">
            <TabsTrigger value="application" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Application Details</TabsTrigger>
            <TabsTrigger value="balance" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Balance Verification</TabsTrigger>
            <TabsTrigger value="regulations" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Regulations</TabsTrigger>
            <TabsTrigger value="workflow" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Workflow</TabsTrigger>
            <TabsTrigger value="note" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Internal Note</TabsTrigger>
          </TabsList>

          {/* Internal Note Tab */}
          <TabsContent value="note" className="space-y-4">
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Auto-Generated Internal Note</h3>
                    <p className="text-sm text-muted-foreground">
                      This note has been automatically generated for HR verification and record keeping.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Internal Note</CardTitle>
                <CardDescription>For office records and sanction authority</CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Generating internal note...</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={internalNote}
                    readOnly
                    className="font-mono text-sm min-h-[500px] whitespace-pre-wrap"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Details Tab */}
          <TabsContent value="application" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{employee?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Employee ID</div>
                    <div className="font-medium">{employee?.employeeId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Designation</div>
                    <div className="font-medium">{employee?.designation}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Department</div>
                    <div className="font-medium">{employee?.department}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Leave Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Leave Type</div>
                    <div className="font-medium">
                      {leaveType?.name} ({leaveType?.code})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Period</div>
                    <div className="font-medium">
                      {formatDate(application.fromDate)} ({application.fromSession}) to{' '}
                      {formatDate(application.toDate)} ({application.toSession})
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{days} days</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reason for Leave</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{application.reason}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Leave Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm whitespace-pre-wrap">{application.leaveAddress}</p>
                  {application.contactNumber && (
                    <div>
                      <div className="text-sm text-muted-foreground">Contact</div>
                      <div className="font-medium">{application.contactNumber}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Balance Verification Tab */}
          <TabsContent value="balance" className="space-y-4">
            <Card className={!hasBalance ? 'border-red-600' : 'border-green-600'}>
              <CardHeader>
                <CardTitle>Leave Balance Status</CardTitle>
                <CardDescription>
                  {hasBalance
                    ? 'Employee has sufficient leave balance'
                    : 'WARNING: Insufficient leave balance'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Opening</div>
                    <div className="text-2xl font-bold">{balance?.openingBalance || 0}</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Credited</div>
                    <div className="text-2xl font-bold text-green-600">
                      +{balance?.credited || 0}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Availed</div>
                    <div className="text-2xl font-bold text-red-600">-{balance?.availed || 0}</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Available</div>
                    <div className="text-2xl font-bold text-blue-600">{availableBalance}</div>
                  </div>
                  <div
                    className={`text-center p-4 rounded-lg ${
                      hasBalance ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="text-sm text-muted-foreground mb-1">After</div>
                    <div
                      className={`text-2xl font-bold ${
                        hasBalance ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {balanceAfter}
                    </div>
                  </div>
                </div>

                {!hasBalance && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Insufficient Balance</h4>
                      <p className="text-sm text-red-700">
                        Employee does not have sufficient leave balance. Application should be
                        returned or rejected.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regulations Tab */}
          <TabsContent value="regulations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Applicable Regulations
                </CardTitle>
                <CardDescription>
                  Regulations governing this leave type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicableRegulations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specific regulations found</p>
                ) : (
                  <div className="space-y-3">
                    {applicableRegulations.map((reg) => (
                      <div key={reg.regulationId} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="font-mono">
                            {reg.regulationNumber}
                          </Badge>
                          {reg.isActive && <Badge className="bg-green-600">Active</Badge>}
                        </div>
                        <h4 className="font-medium mb-1">{reg.title}</h4>
                        <p className="text-sm text-muted-foreground">{reg.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflow History Tab */}
          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Application Workflow
                </CardTitle>
                <CardDescription>Complete processing history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.workflowHistory.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{item.action}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.actionByName} ({item.role})
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(item.actionDate)}
                          </div>
                        </div>
                        {item.remarks && (
                          <div className="mt-2 text-sm bg-muted p-3 rounded-lg">{item.remarks}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'verify' && 'Verify & Forward to Sanction Authority'}
              {actionType === 'return' && 'Return for Correction'}
              {actionType === 'reject' && 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'verify' &&
                'This will verify the leave balance and forward the application to the Sanction Authority.'}
              {actionType === 'return' &&
                'This will return the application to the employee for corrections.'}
              {actionType === 'reject' &&
                'This will reject the application. Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType !== 'verify' && (
              <div>
                <label className="text-sm font-medium">
                  {actionType === 'return' ? 'Reason for Return *' : 'Rejection Reason *'}
                </label>
                <Textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter reason..."
                  className="mt-2"
                  rows={4}
                />
              </div>
            )}

            {actionType === 'verify' && (
              <div>
                <label className="text-sm font-medium">Additional Remarks (Optional)</label>
                <Textarea
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter any additional remarks..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={
                actionType === 'verify'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionType === 'reject'
                  ? 'bg-destructive'
                  : ''
              }
            >
              {actionType === 'verify' && 'Confirm Verification'}
              {actionType === 'return' && 'Confirm Return'}
              {actionType === 'reject' && 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
