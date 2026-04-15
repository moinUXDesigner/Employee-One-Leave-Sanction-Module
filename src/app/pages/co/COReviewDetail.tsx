import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leave.service';
import { getUserById, getLeaveTypeById } from '../../services/mockData';
import { formatDate, formatSession, formatDaysDisplay } from '../../utils/leaveCalculations';
import type { LeaveApplication } from '../../types';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Calendar, MapPin, Phone, Info } from 'lucide-react';
import { toast } from 'sonner';

export function COReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [leaveType, setLeaveType] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<'forward' | 'return' | 'hold' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    if (!id) return;

    try {
      const app = await leaveService.getApplicationById(id);
      if (app) {
        setApplication(app);
        const emp = getUserById(app.userId);
        const lt = getLeaveTypeById(app.leaveTypeId);
        setEmployee(emp);
        setLeaveType(lt);
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      toast.error('Failed to load application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForward = async () => {
    if (!application) return;

    setIsSubmitting(true);
    try {
      await leaveService.forwardApplication(application.applicationId, remarks);

      toast.success('Application Forwarded', {
        description: 'Application has been forwarded to HR for verification',
      });

      navigate('/co/review');
    } catch (error) {
      toast.error('Failed to forward application');
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  const handleReturn = async () => {
    if (!application || !remarks.trim()) {
      toast.error('Please provide a reason for returning this application');
      return;
    }

    setIsSubmitting(true);
    try {
      await leaveService.returnApplication(application.applicationId, remarks);

      toast.success('Application Returned', {
        description: 'Application has been returned to employee for correction',
      });

      navigate('/co/review');
    } catch (error) {
      toast.error('Failed to return application');
    } finally {
      setIsSubmitting(false);
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Application Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested application could not be found.
            </p>
            <Button onClick={() => navigate('/co/review')}>
              Back to Inbox
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/co/review')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Inbox
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Review Leave Application</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  Application #{application.applicationId.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <Badge>{application.status}</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{employee.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Employee ID</div>
              <div className="font-medium">{employee.employeeId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Designation</div>
              <div className="font-medium">{employee.designation}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Department</div>
              <div className="font-medium">{employee.department}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Office</div>
              <div className="font-medium">{employee.office}, {employee.zone}</div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leave Details</CardTitle>
              <Badge className="text-base px-3 py-1">
                {leaveType?.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-medium mb-2">Leave Period</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">From</div>
                    <div className="font-medium">
                      {formatDate(application.leaveFromDate)} ({formatSession(application.leaveFromSession)})
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">To</div>
                    <div className="font-medium">
                      {formatDate(application.leaveToDate)} ({formatSession(application.leaveToSession)})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {application.prefixFromDate && (
              <div className="pl-8 border-l-2 border-primary/30">
                <div className="text-sm text-muted-foreground mb-1">Prefix Holidays</div>
                <div className="text-sm">
                  {formatDate(application.prefixFromDate)} to {formatDate(application.prefixToDate)}
                </div>
              </div>
            )}

            {application.suffixFromDate && (
              <div className="pl-8 border-l-2 border-primary/30">
                <div className="text-sm text-muted-foreground mb-1">Suffix Holidays</div>
                <div className="text-sm">
                  {formatDate(application.suffixFromDate)} to {formatDate(application.suffixToDate)}
                </div>
              </div>
            )}

            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Days</span>
                <span className="text-2xl font-bold text-primary">
                  {formatDaysDisplay(application.totalDays)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reason & Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Reason & Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Reason for Leave</div>
              <div className="p-3 bg-muted rounded-lg">
                {application.reasonForLeave}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Address During Leave</div>
                <div className="p-3 bg-muted rounded-lg">
                  {application.leaveAddress}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Contact Number</div>
                <div className="font-medium">{application.contactNumber}</div>
              </div>
            </div>

            {application.isMedicalLeave && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a medical leave. Medical certificate should be attached.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Attached Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {application.attachments && application.attachments.length > 0 ? (
              <div className="space-y-2">
                {application.attachments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <Badge variant="outline">Uploaded</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No documents attached
              </p>
            )}
          </CardContent>
        </Card>

        {/* Workflow History */}
        {application.workflowHistory && application.workflowHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {application.workflowHistory.map((item, index) => (
                  <div key={item.historyId} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      {index < application.workflowHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium">{item.action}</div>
                      <div className="text-sm text-muted-foreground">
                        by {item.actionByName} ({item.actionByRole})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.actionDate)}
                      </div>
                      {item.remarks && (
                        <div className="mt-2 text-sm p-2 bg-muted rounded">
                          {item.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              Forward to HR for verification or return to employee for corrections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setAction('forward')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Forward to HR
              </Button>
              <Button
                variant="destructive"
                onClick={() => setAction('return')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Return for Correction
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction('hold')}
              >
                <Clock className="w-4 h-4 mr-2" />
                Hold
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forward Dialog */}
      <Dialog open={action === 'forward'} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forward to HR</DialogTitle>
            <DialogDescription>
              This application will be forwarded to HR for balance verification and processing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forward-remarks">Remarks (Optional)</Label>
              <Textarea
                id="forward-remarks"
                placeholder="Add any remarks or recommendations..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button onClick={handleForward} disabled={isSubmitting}>
              {isSubmitting ? 'Forwarding...' : 'Forward to HR'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={action === 'return'} onOpenChange={() => setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for Correction</DialogTitle>
            <DialogDescription>
              This application will be returned to the employee for corrections.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-remarks">Reason for Return *</Label>
              <Textarea
                id="return-remarks"
                placeholder="Explain what needs to be corrected..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReturn}
              disabled={!remarks.trim() || isSubmitting}
            >
              {isSubmitting ? 'Returning...' : 'Return to Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
