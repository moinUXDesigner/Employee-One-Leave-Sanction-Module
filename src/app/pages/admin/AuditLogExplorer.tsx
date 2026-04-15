import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { formatDate } from '../../utils/leaveCalculations';
import {
  ArrowLeft,
  Search,
  Activity,
  Filter,
  Download,
  User,
  FileText,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  RefreshCw,
  Send,
  Calendar,
} from 'lucide-react';

interface AuditLogEntry {
  logId: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  actionType: 'Login' | 'Logout' | 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'Forward' | 'Submit';
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning';
}

// Mock audit log data
const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    logId: 'LOG-2026-001234',
    timestamp: '2026-04-15T14:30:00',
    userId: 'emp001',
    userName: 'Rajesh Kumar',
    action: 'Submitted Leave Application',
    actionType: 'Submit',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-001',
    details: 'Submitted Earned Leave application for 5 days',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001233',
    timestamp: '2026-04-15T13:15:00',
    userId: 'co002',
    userName: 'Srinivas Rao',
    action: 'Forwarded Application to HR',
    actionType: 'Forward',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-002',
    details: 'Forwarded HPL application after verification',
    ipAddress: '192.168.1.101',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001232',
    timestamp: '2026-04-15T12:45:00',
    userId: 'hr003',
    userName: 'Lakshmi Devi',
    action: 'Approved Application',
    actionType: 'Approve',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-003',
    details: 'Verified leave balance and forwarded to sanction authority',
    ipAddress: '192.168.1.102',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001231',
    timestamp: '2026-04-15T11:30:00',
    userId: 'emp001',
    userName: 'Rajesh Kumar',
    action: 'Login Attempt',
    actionType: 'Login',
    resource: 'Authentication',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001230',
    timestamp: '2026-04-15T10:20:00',
    userId: 'admin007',
    userName: 'System Admin',
    action: 'Updated Delegation Matrix',
    actionType: 'Update',
    resource: 'DelegationMatrix',
    resourceId: 'DEL-001',
    details: 'Modified delegation limits for Earned Leave',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001229',
    timestamp: '2026-04-15T09:45:00',
    userId: 'emp005',
    userName: 'Unknown User',
    action: 'Login Failed',
    actionType: 'Login',
    resource: 'Authentication',
    details: 'Invalid credentials',
    ipAddress: '192.168.1.150',
    status: 'Failed',
  },
  {
    logId: 'LOG-2026-001228',
    timestamp: '2026-04-15T09:15:00',
    userId: 'sa004',
    userName: 'Venkateswara Rao',
    action: 'Sanctioned Leave',
    actionType: 'Approve',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-004',
    details: 'Sanctioned Casual Leave for 3 days',
    ipAddress: '192.168.1.103',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001227',
    timestamp: '2026-04-14T16:30:00',
    userId: 'emp002',
    userName: 'Priya Sharma',
    action: 'Created Draft Application',
    actionType: 'Create',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-005',
    details: 'Created draft for Medical Leave',
    ipAddress: '192.168.1.101',
    status: 'Success',
  },
  {
    logId: 'LOG-2026-001226',
    timestamp: '2026-04-14T15:45:00',
    userId: 'hr003',
    userName: 'Lakshmi Devi',
    action: 'Returned Application',
    actionType: 'Reject',
    resource: 'LeaveApplication',
    resourceId: 'APP-2026-006',
    details: 'Returned for correction - insufficient documents',
    ipAddress: '192.168.1.102',
    status: 'Warning',
  },
  {
    logId: 'LOG-2026-001225',
    timestamp: '2026-04-14T14:20:00',
    userId: 'admin007',
    userName: 'System Admin',
    action: 'Created Leave Type',
    actionType: 'Create',
    resource: 'LeaveType',
    resourceId: 'LT-013',
    details: 'Added new leave type: Special Disability Leave',
    ipAddress: '192.168.1.105',
    status: 'Success',
  },
];

export function AuditLogExplorer() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, filterAction, filterStatus]);

  const loadLogs = () => {
    setLogs(MOCK_AUDIT_LOGS);
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.logId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter((log) => log.actionType === filterAction);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((log) => log.status === filterStatus);
    }

    setFilteredLogs(filtered);
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'Login':
        return LogIn;
      case 'Logout':
        return LogOut;
      case 'Create':
        return FileText;
      case 'Update':
        return RefreshCw;
      case 'Submit':
        return Send;
      case 'Approve':
        return CheckCircle;
      case 'Reject':
        return XCircle;
      case 'Forward':
        return Send;
      default:
        return Activity;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        );
      case 'Failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'Warning':
        return (
          <Badge className="bg-yellow-600">
            <Activity className="w-3 h-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Audit Log Explorer</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  View system audit trails and activity logs
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About Audit Logs</h3>
                <p className="text-sm text-muted-foreground">
                  The audit log captures all system activities including user logins, application
                  submissions, approvals, rejections, and administrative changes. Logs are retained
                  for compliance and security auditing purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Login">Login</SelectItem>
                  <SelectItem value="Logout">Logout</SelectItem>
                  <SelectItem value="Create">Create</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Submit">Submit</SelectItem>
                  <SelectItem value="Approve">Approve</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                  <SelectItem value="Forward">Forward</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} log entr{filteredLogs.length !== 1 ? 'ies' : 'y'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => {
                      const Icon = getActionIcon(log.actionType);
                      return (
                        <TableRow key={log.logId}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {new Date(log.timestamp).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-muted-foreground">
                                {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium text-sm">{log.userName}</div>
                                <div className="text-xs text-muted-foreground">{log.userId}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">{log.action}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{log.resource}</div>
                              {log.resourceId && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {log.resourceId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {log.details}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs font-mono text-muted-foreground">
                              {log.ipAddress}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Logs</CardDescription>
              <CardTitle className="text-3xl">{logs.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Successful</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {logs.filter((l) => l.status === 'Success').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Completed actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Failed</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {logs.filter((l) => l.status === 'Failed').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Errors encountered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Warnings</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {logs.filter((l) => l.status === 'Warning').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
