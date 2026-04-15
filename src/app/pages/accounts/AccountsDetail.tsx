import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  getApplicationById,
  getLeaveTypeById,
  getUserById,
  getLeaveBalance,
} from '../../services/mockData';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import { toast } from 'sonner';
import type { LeaveApplication } from '../../types';
import {
  ArrowLeft,
  Database,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Send,
} from 'lucide-react';

interface SAPPostingData {
  documentNumber: string;
  postingDate: string;
  fiscalYear: string;
  fiscalPeriod: string;
  companyCode: string;
  costCenter: string;
  glAccount: string;
  amount: number;
  documentType: string;
  referenceDocument: string;
}

export function AccountsDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [sapData, setSapData] = useState<SAPPostingData>({
    documentNumber: '',
    postingDate: new Date().toISOString().split('T')[0],
    fiscalYear: new Date().getFullYear().toString(),
    fiscalPeriod: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    companyCode: 'APTC',
    costCenter: '',
    glAccount: '540000',
    amount: 0,
    documentType: 'LV',
    referenceDocument: '',
  });
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [sapStatus, setSapStatus] = useState<'Pending' | 'Posted' | 'Verified'>('Pending');

  useEffect(() => {
    if (id) {
      loadApplication(id);
    }
  }, [id]);

  const loadApplication = (applicationId: string) => {
    const app = getApplicationById(applicationId);
    if (app) {
      setApplication(app);
      // Auto-populate SAP data
      const employee = getUserById(app.employeeId);
      const docNum = `LV${new Date().getFullYear()}${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')}`;
      setSapData((prev) => ({
        ...prev,
        documentNumber: docNum,
        referenceDocument: app.applicationNumber,
        costCenter: employee?.costCenter || 'CC1000',
      }));
    }
  };

  const handlePostToSAP = () => {
    if (!sapData.documentNumber) {
      toast.error('Document number is required');
      return;
    }

    // Simulate SAP posting
    toast.success('Posting to SAP...');
    setTimeout(() => {
      setSapStatus('Posted');
      toast.success('Successfully posted to SAP');
      setIsPostDialogOpen(false);
    }, 1500);
  };

  const handleVerifyPosting = () => {
    if (!remarks.trim()) {
      toast.error('Verification remarks are required');
      return;
    }

    // Simulate verification
    toast.success('Verifying posting...');
    setTimeout(() => {
      setSapStatus('Verified');
      toast.success('Posting verified successfully');
      setIsVerifyDialogOpen(false);
    }, 1000);
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
              <Button variant="secondary" size="sm" onClick={() => navigate('/accounts/queue')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">SAP Posting</h1>
                <p className="text-sm opacity-90 mt-1">{application.applicationNumber}</p>
              </div>
            </div>
            {sapStatus === 'Pending' && (
              <Badge className="bg-yellow-600">Pending Posting</Badge>
            )}
            {sapStatus === 'Posted' && (
              <Badge className="bg-green-600">Posted to SAP</Badge>
            )}
            {sapStatus === 'Verified' && (
              <Badge className="bg-blue-600">Verified</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          {sapStatus === 'Pending' && (
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsPostDialogOpen(true)}>
              <Send className="w-4 h-4 mr-2" />
              Post to SAP
            </Button>
          )}
          {sapStatus === 'Posted' && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsVerifyDialogOpen(true)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Posting
            </Button>
          )}
          {sapStatus === 'Verified' && (
            <Button variant="outline" disabled>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </Button>
          )}
        </div>

        <Tabs defaultValue="sap" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sap">SAP Posting Details</TabsTrigger>
            <TabsTrigger value="application">Application Details</TabsTrigger>
            <TabsTrigger value="financial">Financial Impact</TabsTrigger>
          </TabsList>

          {/* SAP Posting Tab */}
          <TabsContent value="sap" className="space-y-4">
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">SAP Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter SAP posting details to update leave balances and create accounting
                      entries. All fields are required for successful posting.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
                <CardDescription>SAP document information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Document Number *</label>
                    <Input
                      value={sapData.documentNumber}
                      onChange={(e) =>
                        setSapData({ ...sapData, documentNumber: e.target.value })
                      }
                      placeholder="Enter document number"
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Document Type *</label>
                    <Input
                      value={sapData.documentType}
                      onChange={(e) =>
                        setSapData({ ...sapData, documentType: e.target.value })
                      }
                      placeholder="LV"
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Posting Date *</label>
                    <Input
                      type="date"
                      value={sapData.postingDate}
                      onChange={(e) =>
                        setSapData({ ...sapData, postingDate: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reference Document</label>
                    <Input
                      value={sapData.referenceDocument}
                      onChange={(e) =>
                        setSapData({ ...sapData, referenceDocument: e.target.value })
                      }
                      placeholder="Reference"
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizational Details</CardTitle>
                <CardDescription>Company code, cost center, and accounting details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fiscal Year *</label>
                    <Input
                      value={sapData.fiscalYear}
                      onChange={(e) =>
                        setSapData({ ...sapData, fiscalYear: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fiscal Period *</label>
                    <Input
                      value={sapData.fiscalPeriod}
                      onChange={(e) =>
                        setSapData({ ...sapData, fiscalPeriod: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Company Code *</label>
                    <Input
                      value={sapData.companyCode}
                      onChange={(e) =>
                        setSapData({ ...sapData, companyCode: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cost Center *</label>
                    <Input
                      value={sapData.costCenter}
                      onChange={(e) =>
                        setSapData({ ...sapData, costCenter: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">GL Account *</label>
                    <Input
                      value={sapData.glAccount}
                      onChange={(e) =>
                        setSapData({ ...sapData, glAccount: e.target.value })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      value={sapData.amount}
                      onChange={(e) =>
                        setSapData({ ...sapData, amount: parseFloat(e.target.value) })
                      }
                      className="mt-2"
                      disabled={sapStatus !== 'Pending'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {sapStatus !== 'Pending' && (
              <Card className="border-green-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Posting Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">SAP Document Number</span>
                      <span className="font-mono text-sm">{sapData.documentNumber}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Posting Date</span>
                      <span className="text-sm">{formatDate(sapData.postingDate)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Status</span>
                      {sapStatus === 'Posted' && (
                        <Badge className="bg-green-600">Posted Successfully</Badge>
                      )}
                      {sapStatus === 'Verified' && (
                        <Badge className="bg-blue-600">Verified</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                    <div className="text-sm text-muted-foreground">Cost Center</div>
                    <div className="font-medium">{employee?.costCenter || 'N/A'}</div>
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
                      {formatDate(application.fromDate)} to {formatDate(application.toDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{days} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sanction Memo</div>
                    <div className="font-medium font-mono text-sm">
                      {(application as any).memoNumber || 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Leave Balance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leave Balance Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Before Availing</div>
                    <div className="text-2xl font-bold">
                      {(balance?.openingBalance || 0) + (balance?.credited || 0) - (balance?.availed || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Availing Now</div>
                    <div className="text-2xl font-bold text-red-600">-{days}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">After Availing</div>
                    <div className="text-2xl font-bold text-primary">
                      {(balance?.openingBalance || 0) + (balance?.credited || 0) - (balance?.availed || 0) - days}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Availed (Year)</div>
                    <div className="text-2xl font-bold">
                      {(balance?.availed || 0) + days}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Impact Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Salary & Allowances Impact
                </CardTitle>
                <CardDescription>
                  Financial implications of this leave application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Leave Type Impact</div>
                    <div className="font-medium">
                      {leaveType?.code === 'EL' && 'Full pay and allowances'}
                      {leaveType?.code === 'HPL' && 'Half pay and allowances'}
                      {leaveType?.code === 'CL' && 'Full pay and allowances'}
                      {!['EL', 'HPL', 'CL'].includes(leaveType?.code || '') && 'As per regulations'}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Days Affected</div>
                    <div className="text-2xl font-bold">{days} days</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Effective Month</div>
                    <div className="font-medium">
                      {new Date(application.fromDate).toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-primary rounded-lg">
                  <h4 className="font-medium mb-3">Action Items for Payroll Processing</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Update leave balance in SAP HR module</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Adjust salary for {formatDate(application.fromDate)} to {formatDate(application.toDate)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Create accounting entry for leave salary adjustment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Update attendance records</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post to SAP Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post to SAP</DialogTitle>
            <DialogDescription>
              This will create entries in SAP for leave balance update and accounting documents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Number:</span>
                <span className="font-mono">{sapData.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employee:</span>
                <span>{employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leave Days:</span>
                <span className="font-medium">{days} days</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Ensure all SAP details are correct before posting. This action cannot be undone.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePostToSAP}>
              Confirm Post to SAP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Posting Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify SAP Posting</DialogTitle>
            <DialogDescription>
              Confirm that the SAP posting has been successfully completed and verified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Verification Remarks *</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter verification remarks and confirmation details..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleVerifyPosting}>
              Confirm Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
