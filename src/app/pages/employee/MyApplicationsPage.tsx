import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { leaveService } from '../../services/leave.service';
import { formatDate, formatDaysDisplay } from '../../utils/leaveCalculations';
import type { LeaveApplication, ApplicationStatus } from '../../types';
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function MyApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<LeaveApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const apps = await leaveService.getApplicationsByUser(user.userId);
      setApplications(apps.sort((a, b) =>
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((app) =>
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reasonForLeave.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Submitted':
        return <Badge className="bg-blue-600">Submitted</Badge>;
      case 'UnderReview':
        return <Badge className="bg-yellow-600">Under Review</Badge>;
      case 'Forwarded':
        return <Badge className="bg-indigo-600">Forwarded</Badge>;
      case 'UnderVerification':
        return <Badge className="bg-purple-600">Verification</Badge>;
      case 'PendingSanction':
        return <Badge className="bg-orange-600">Pending Sanction</Badge>;
      case 'Sanctioned':
        return <Badge className="bg-green-600">Sanctioned</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'Held':
        return <Badge className="bg-amber-600">Held</Badge>;
      case 'ReturnedForCorrection':
        return <Badge variant="destructive">Returned</Badge>;
      case 'RejoiningPending':
        return <Badge className="bg-teal-600">Rejoining Pending</Badge>;
      case 'Closed':
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'Sanctioned':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'ReturnedForCorrection':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
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
                <h1 className="text-2xl font-bold">My Leave Applications</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {applications.length} total application{applications.length !== 1 && 's'}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/employee/apply')}>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application ID or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="UnderReview">Under Review</SelectItem>
                  <SelectItem value="Forwarded">Forwarded</SelectItem>
                  <SelectItem value="PendingSanction">Pending Sanction</SelectItem>
                  <SelectItem value="Sanctioned">Sanctioned</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="ReturnedForCorrection">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Applications Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You haven\'t submitted any leave applications yet'}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Button onClick={() => navigate('/employee/apply')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Apply for Leave
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApps.map((application) => (
              <Card
                key={application.applicationId}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(application.status)}
                        <CardTitle className="text-base truncate">
                          #{application.applicationId.slice(-8).toUpperCase()}
                        </CardTitle>
                        {getStatusBadge(application.status)}
                      </div>
                      <CardDescription className="text-xs">
                        {formatDate(application.applicationDate)} • {formatDate(application.leaveFromDate)} - {formatDate(application.leaveToDate)} • {formatDaysDisplay(application.totalDays)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Current Stage Label */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current: <span className="font-medium text-foreground">{application.currentStage}</span></span>
                    {application.status === 'ReturnedForCorrection' && (
                      <Badge variant="destructive" className="text-xs h-5">
                        Action Required
                      </Badge>
                    )}
                  </div>

                  {/* Reason - Compact */}
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {application.reasonForLeave}
                  </div>

                  {/* Application Timeline */}
                  <div className="flex items-center gap-1">
                    {['Employee', 'ControllingOfficer', 'HR', 'SanctionAuthority', 'Completed'].map((stage, index) => {
                      const stages = ['Employee', 'ControllingOfficer', 'HR', 'SanctionAuthority', 'Accounts', 'RejoiningAcceptance', 'Completed'];
                      const currentIndex = stages.indexOf(application.currentStage);
                      const stageIndex = stages.indexOf(stage);
                      const isCompleted = stageIndex < currentIndex || application.status === 'Sanctioned' || application.status === 'Closed';
                      const isCurrent = stage === application.currentStage;
                      const isRejected = application.status === 'Rejected' || application.status === 'Held';

                      return (
                        <div key={stage} className="flex-1 flex items-center gap-1">
                          <div className={`h-1.5 rounded-full flex-1 transition-colors ${
                            isRejected && isCurrent ? 'bg-destructive' :
                            isCompleted ? 'bg-primary' :
                            isCurrent ? 'bg-primary/50' :
                            'bg-muted'
                          }`} />
                          {index < 4 && <div className="w-0.5 h-1.5 bg-muted" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* View Button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/employee/applications/${application.applicationId}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
