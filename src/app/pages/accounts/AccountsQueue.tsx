import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { getApplicationsByStatus, getLeaveTypeById, getUserById } from '../../services/mockData';
import { formatDate, calculateLeaveDays } from '../../utils/leaveCalculations';
import type { LeaveApplication } from '../../types';
import {
  Database,
  FileText,
  User,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  LogOut,
} from 'lucide-react';

interface SAPPostingStatus {
  applicationId: string;
  sapStatus: 'Pending' | 'Posted' | 'Failed' | 'Verified';
  sapDocumentNumber?: string;
  postingDate?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  failureReason?: string;
}

// Mock SAP posting status data
const MOCK_SAP_STATUS: SAPPostingStatus[] = [
  {
    applicationId: 'APP-2026-001',
    sapStatus: 'Pending',
  },
  {
    applicationId: 'APP-2026-002',
    sapStatus: 'Pending',
  },
];

export function AccountsQueue() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [sapStatusMap, setSapStatusMap] = useState<Map<string, SAPPostingStatus>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, filterStatus]);

  const loadApplications = () => {
    // Get sanctioned applications for SAP posting
    const sanctionedApps = getApplicationsByStatus('Sanctioned');
    setApplications(sanctionedApps);

    // Load SAP status
    const statusMap = new Map<string, SAPPostingStatus>();
    MOCK_SAP_STATUS.forEach((status) => {
      statusMap.set(status.applicationId, status);
    });
    setSapStatusMap(statusMap);
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

    if (filterStatus !== 'all') {
      filtered = filtered.filter((app) => {
        const sapStatus = sapStatusMap.get(app.applicationId);
        return sapStatus?.sapStatus === filterStatus;
      });
    }

    setFilteredApplications(filtered);
  };

  const viewApplication = (applicationId: string) => {
    navigate(`/accounts/process/${applicationId}`);
  };

  const getSAPStatusBadge = (applicationId: string) => {
    const sapStatus = sapStatusMap.get(applicationId);
    if (!sapStatus) {
      return <Badge variant="outline">Pending</Badge>;
    }

    switch (sapStatus.sapStatus) {
      case 'Pending':
        return (
          <Badge variant="outline" className="bg-yellow-50">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'Posted':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Posted
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'Verified':
        return (
          <Badge className="bg-blue-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SAP Posting Queue</h1>
              <p className="text-sm opacity-90 mt-1">
                Process sanctioned leave applications for SAP integration
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
              <CardDescription>Total in Queue</CardDescription>
              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Sanctioned applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Posting</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {
                  Array.from(sapStatusMap.values()).filter((s) => s.sapStatus === 'Pending')
                    .length
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting SAP posting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Posted</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {Array.from(sapStatusMap.values()).filter((s) => s.sapStatus === 'Posted').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Successfully posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {Array.from(sapStatusMap.values()).filter((s) => s.sapStatus === 'Failed').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About SAP Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Sanctioned leave applications are processed here for posting to SAP. This includes
                  updating leave balances, creating salary adjustment entries, and generating
                  accounting documents. Each posting is verified before being marked as complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by application number or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by SAP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Posted">Posted</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>SAP Posting Queue</CardTitle>
            <CardDescription>
              {filteredApplications.length} application{filteredApplications.length !== 1 && 's'}{' '}
              in queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Sanction Date</TableHead>
                    <TableHead>SAP Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No applications in queue
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => {
                      const leaveType = getLeaveTypeById(app.leaveTypeId);
                      const employee = getUserById(app.employeeId);
                      const days = calculateLeaveDays(
                        app.fromDate,
                        app.fromSession,
                        app.toDate,
                        app.toSession
                      );
                      const sapStatus = sapStatusMap.get(app.applicationId);

                      return (
                        <TableRow
                          key={app.applicationId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => viewApplication(app.applicationId)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium font-mono text-sm">
                                {app.applicationNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {app.applicationId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
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
                          <TableCell>
                            <Badge variant="outline">{leaveType?.code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(app.fromDate)}
                              </div>
                              <div className="text-muted-foreground">
                                to {formatDate(app.toDate)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{days} days</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {(app as any).sanctionDate
                                ? formatDate((app as any).sanctionDate)
                                : '-'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getSAPStatusBadge(app.applicationId)}
                              {sapStatus?.sapDocumentNumber && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {sapStatus.sapDocumentNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewApplication(app.applicationId);
                              }}
                            >
                              Process
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
    </div>
  );
}
