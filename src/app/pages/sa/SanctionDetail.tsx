import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  getApplicationById,
  getLeaveTypeById,
  getUserById,
  getLeaveBalance,
  updateApplicationStatus,
  addWorkflowHistory,
} from '../../services/mockData';
import { generateDraftSanctionOrder } from '../../services/autogeneration.service';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import { toast } from 'sonner';
import type { LeaveApplication } from '../../types';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  Download,
  AlertCircle,
  History,
} from 'lucide-react';

export function SanctionDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [draftOrder, setDraftOrder] = useState<string>('');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editedOrder, setEditedOrder] = useState<string>('');
  const [memoNumber, setMemoNumber] = useState<string>('');
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'hold'>('approve');
  const [actionRemarks, setActionRemarks] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication(id);
    }
  }, [id]);

  const loadApplication = async (applicationId: string) => {
    const app = getApplicationById(applicationId);
    if (app) {
      setApplication(app);
      await generateOrder(app);
      // Auto-generate memo number
      const date = new Date();
      const memoNo = `APTC/HR/LV/${date.getFullYear()}/${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')}`;
      setMemoNumber(memoNo);
    }
  };

  const generateOrder = async (app: LeaveApplication) => {
    setIsGenerating(true);
    try {
      const leaveType = getLeaveTypeById(app.leaveTypeId);
      const employee = getUserById(app.employeeId);
      const balance = getLeaveBalance(app.employeeId, app.leaveTypeId);

      if (!leaveType || !employee || !balance) {
        toast.error('Failed to generate order: Missing data');
        return;
      }

      const days = calculateLeaveDays(app.fromDate, app.fromSession, app.toDate, app.toSession);

      const order = await generateDraftSanctionOrder({
        application: app,
        leaveType,
        employee,
        balance,
        leaveDays: days,
        sanctioningAuthority: user!,
      });

      setDraftOrder(order);
      setEditedOrder(order);
    } catch (error) {
      toast.error('Failed to generate draft order');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditOrder = () => {
    setIsEditingOrder(true);
  };

  const handleSaveOrder = () => {
    setDraftOrder(editedOrder);
    setIsEditingOrder(false);
    toast.success('Draft order updated');
  };

  const openActionDialog = (type: 'approve' | 'reject' | 'hold') => {
    setActionType(type);
    setActionRemarks('');
    setIsActionDialogOpen(true);
  };

  const handleAction = () => {
    if (!application) return;

    let newStatus: any;
    let message = '';

    switch (actionType) {
      case 'approve':
        newStatus = 'Sanctioned';
        message = 'Application sanctioned successfully';
        break;
      case 'reject':
        if (!actionRemarks.trim()) {
          toast.error('Please provide rejection reason');
          return;
        }
        newStatus = 'Rejected';
        message = 'Application rejected';
        break;
      case 'hold':
        if (!actionRemarks.trim()) {
          toast.error('Please provide reason for holding');
          return;
        }
        newStatus = 'Held';
        message = 'Application put on hold';
        break;
    }

    updateApplicationStatus(application.applicationId, newStatus);
    addWorkflowHistory(application.applicationId, {
      actionDate: new Date().toISOString(),
      actionBy: user!.userId,
      actionByName: user!.name,
      action: actionType === 'approve' ? 'Sanctioned' : actionType === 'reject' ? 'Rejected' : 'Held',
      fromStatus: 'PendingSanction',
      toStatus: newStatus,
      remarks: actionRemarks || `${actionType === 'approve' ? 'Sanctioned' : actionType === 'reject' ? 'Rejected' : 'Put on hold'} by Sanction Authority`,
      role: 'SanctionAuthority',
    });

    if (actionType === 'approve') {
      // Store the memo number and final order
      const updatedApp = getApplicationById(application.applicationId);
      if (updatedApp) {
        (updatedApp as any).memoNumber = memoNumber;
        (updatedApp as any).sanctionOrder = editedOrder;
        (updatedApp as any).sanctionDate = new Date().toISOString();
      }
    }

    toast.success(message);
    setIsActionDialogOpen(false);
    navigate('/sa/sanction');
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="sm" onClick={() => navigate('/sa/sanction')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Application Review</h1>
                <p className="text-sm opacity-90 mt-1">{application.applicationNumber}</p>
              </div>
            </div>
            <Badge className="bg-white text-primary">Pending Sanction</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => openActionDialog('approve')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Sanction & Approve
          </Button>
          <Button variant="destructive" onClick={() => openActionDialog('reject')}>
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button variant="outline" onClick={() => openActionDialog('hold')}>
            <Clock className="w-4 h-4 mr-2" />
            Put on Hold
          </Button>
          <Button variant="outline" className="ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Download Order
          </Button>
        </div>

        <Tabs defaultValue="order" className="space-y-4">
          <TabsList>
            <TabsTrigger value="order">Draft Sanction Order</TabsTrigger>
            <TabsTrigger value="application">Application Details</TabsTrigger>
            <TabsTrigger value="workflow">Workflow History</TabsTrigger>
          </TabsList>

          {/* Draft Order Tab */}
          <TabsContent value="order" className="space-y-4">
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">Auto-Generated Draft Order</h3>
                    <p className="text-sm text-muted-foreground">
                      This sanction order has been automatically generated based on applicable
                      regulations and application details. Review and edit if needed before approving.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Memo Number</CardTitle>
                    <CardDescription>This will be the official memo number</CardDescription>
                  </div>
                  {!isEditingOrder && (
                    <Button variant="outline" size="sm" onClick={handleEditOrder}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Order
                    </Button>
                  )}
                  {isEditingOrder && (
                    <Button size="sm" onClick={handleSaveOrder}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  value={memoNumber}
                  onChange={(e) => setMemoNumber(e.target.value)}
                  placeholder="Enter memo number"
                  className="max-w-md"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sanction Order</CardTitle>
                <CardDescription>
                  {isEditingOrder ? 'Make changes to the order as needed' : 'Preview the draft order'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Generating draft order...</p>
                    </div>
                  </div>
                ) : (
                  <Textarea
                    value={isEditingOrder ? editedOrder : draftOrder}
                    onChange={(e) => setEditedOrder(e.target.value)}
                    readOnly={!isEditingOrder}
                    className="font-mono text-sm min-h-[600px] whitespace-pre-wrap"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Application Details Tab */}
          <TabsContent value="application" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Details */}
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
                  <div>
                    <div className="text-sm text-muted-foreground">Office</div>
                    <div className="font-medium">{employee?.office}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Leave Details */}
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
                  {application.prefixDays > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground">Prefix Days</div>
                      <div className="font-medium">{application.prefixDays} days</div>
                    </div>
                  )}
                  {application.suffixDays > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground">Suffix Days</div>
                      <div className="font-medium">{application.suffixDays} days</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reason & Address */}
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
                <CardContent className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{application.leaveAddress}</p>
                  {application.contactNumber && (
                    <div>
                      <div className="text-sm text-muted-foreground">Contact Number</div>
                      <div className="font-medium">{application.contactNumber}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Leave Balance */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Leave Balance Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Opening Balance</div>
                      <div className="text-2xl font-bold">{balance?.openingBalance || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Credited</div>
                      <div className="text-2xl font-bold text-green-600">
                        +{balance?.credited || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Availed</div>
                      <div className="text-2xl font-bold text-red-600">-{balance?.availed || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Available</div>
                      <div className="text-2xl font-bold text-primary">
                        {(balance?.openingBalance || 0) + (balance?.credited || 0) - (balance?.availed || 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
                    >
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
                          <div className="mt-2 text-sm bg-muted p-3 rounded-lg">
                            {item.remarks}
                          </div>
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
              {actionType === 'approve' && 'Sanction & Approve Application'}
              {actionType === 'reject' && 'Reject Application'}
              {actionType === 'hold' && 'Put Application on Hold'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' &&
                'This will sanction the leave application and forward it to Accounts for SAP posting.'}
              {actionType === 'reject' &&
                'This will reject the application. Please provide a reason for rejection.'}
              {actionType === 'hold' &&
                'This will put the application on hold. Please provide a reason.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {actionType !== 'approve' && (
              <div>
                <label className="text-sm font-medium">
                  {actionType === 'reject' ? 'Rejection Reason *' : 'Reason for Hold *'}
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

            {actionType === 'approve' && (
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
                actionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : actionType === 'reject'
                  ? 'bg-destructive'
                  : ''
              }
            >
              {actionType === 'approve' && 'Confirm Sanction'}
              {actionType === 'reject' && 'Confirm Rejection'}
              {actionType === 'hold' && 'Confirm Hold'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
