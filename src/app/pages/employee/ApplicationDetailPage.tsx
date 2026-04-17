import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { leaveService } from '../../services/leave.service';
import { getUserById, getLeaveTypeById } from '../../services/mockData';
import { formatDate, formatDaysDisplay } from '../../utils/leaveCalculations';
import { getAppPath } from '../../utils/basePath';
import type { LeaveApplication } from '../../types';
import { ArrowLeft, Calendar, FileText, MapPin, Phone, CheckCircle2, XCircle, Clock, AlertCircle, User } from 'lucide-react';

export function ApplicationDetailPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<LeaveApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      // Extract application ID from URL
      const pathParts = getAppPath(window.location.pathname).split('/');
      const applicationId = pathParts[pathParts.length - 1];

      const app = await leaveService.getApplicationById(applicationId);
      setApplication(app);
    } catch (error) {
      console.error('Failed to load application:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sanctioned':
      case 'Closed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Rejected':
      case 'Held':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'ReturnedForCorrection':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Draft: 'secondary',
      Submitted: 'default',
      UnderReview: 'default',
      Forwarded: 'default',
      UnderVerification: 'default',
      PendingSanction: 'default',
      Sanctioned: 'outline',
      Rejected: 'destructive',
      Held: 'destructive',
      ReturnedForCorrection: 'destructive',
      Cancelled: 'secondary',
      Closed: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="text-xs">
        {status.replace(/([A-Z])/g, ' $1').trim()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Application Not Found</h3>
          <Button onClick={() => navigate('/employee/applications')}>
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const leaveType = getLeaveTypeById(application.leaveTypeId);
  const applicant = getUserById(application.userId);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/employee/applications')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Application Details</h1>
            <p className="text-sm text-muted-foreground">
              #{application.applicationId.slice(-8).toUpperCase()}
            </p>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStatusIcon(application.status)}
              <div>
                <CardTitle className="text-base">
                  {application.status === 'Sanctioned' ? 'Application Sanctioned' :
                   application.status === 'Rejected' ? 'Application Rejected' :
                   application.status === 'Held' ? 'Application Held' :
                   application.status === 'ReturnedForCorrection' ? 'Action Required' :
                   'Application In Progress'}
                </CardTitle>
                <CardDescription>
                  Current Stage: {application.currentStage}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Leave Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Leave Type</p>
                <p className="text-sm font-medium">{leaveType?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-sm font-medium">{formatDaysDisplay(application.totalDays)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Leave Period</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(application.leaveFromDate)} ({application.leaveFromSession})</span>
                <span>→</span>
                <span>{formatDate(application.leaveToDate)} ({application.leaveToSession})</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Reason for Leave</p>
              <p className="text-sm">{application.reasonForLeave}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Leave Address</p>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{application.leaveAddress}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Contact Number</p>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{application.contactNumber}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Application Date</p>
              <p className="text-sm">{formatDate(application.applicationDate)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Timeline</CardTitle>
            <CardDescription>Track your application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.workflowHistory.length > 0 ? (
                application.workflowHistory.map((history, index) => {
                  const actor = getUserById(history.actorId);
                  const isLast = index === application.workflowHistory.length - 1;

                  return (
                    <div key={history.historyId} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          history.action === 'Rejected' || history.action === 'Held' || history.action === 'Returned'
                            ? 'bg-red-100 dark:bg-red-900'
                            : history.action === 'Sanctioned' || history.action === 'Verified'
                            ? 'bg-green-100 dark:bg-green-900'
                            : 'bg-blue-100 dark:bg-blue-900'
                        }`}>
                          {history.action === 'Rejected' || history.action === 'Held' || history.action === 'Returned' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : history.action === 'Sanctioned' || history.action === 'Verified' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 h-full min-h-[40px] bg-border mt-1" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-sm font-medium">
                              {history.action.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              by {actor?.name || 'Unknown'} ({history.stage})
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(history.timestamp)}
                          </p>
                        </div>
                        {history.remarks && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <p className="font-medium mb-1">Remarks:</p>
                            <p className="text-muted-foreground">{history.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No workflow history available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        {application.attachments && application.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {application.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm flex-1">{attachment.fileName}</span>
                    <Badge variant="outline" className="text-xs">
                      {attachment.fileType}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applicant Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applicant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{applicant?.name}</p>
                <p className="text-xs text-muted-foreground">{applicant?.employeeId}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>{applicant?.designation}</p>
              <p>{applicant?.department}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
