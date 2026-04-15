import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { LEAVE_TYPES, REGULATIONS } from '../../services/mockData';
import type { LeaveType } from '../../types';
import { ArrowLeft, Search, FileText, Plus, Edit, CheckCircle, XCircle, Eye, Calendar, Users, AlertCircle } from 'lucide-react';

export function LeaveTypesMaster() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [filteredLeaveTypes, setFilteredLeaveTypes] = useState<LeaveType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  useEffect(() => {
    filterLeaveTypes();
  }, [leaveTypes, searchTerm, filterStatus]);

  const loadLeaveTypes = () => {
    setLeaveTypes(LEAVE_TYPES);
  };

  const filterLeaveTypes = () => {
    let filtered = leaveTypes;

    if (searchTerm) {
      filtered = filtered.filter(
        (lt) =>
          lt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lt.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lt.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((lt) =>
        filterStatus === 'active' ? lt.isActive : !lt.isActive
      );
    }

    setFilteredLeaveTypes(filtered);
  };

  const viewLeaveType = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsDetailOpen(true);
  };

  const getRegulationNumbers = (regulationIds: string[]): string => {
    return regulationIds
      .map((regId) => {
        const reg = REGULATIONS.find((r) => r.regulationId === regId);
        return reg ? reg.regulationNumber : regId;
      })
      .join(', ');
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
                <h1 className="text-2xl font-bold">Leave Types Master</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure leave types and eligibility rules
                </p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Leave Type
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About Leave Types</h3>
                <p className="text-sm text-muted-foreground">
                  Leave types define the various categories of leave available to employees.
                  Each leave type has specific eligibility criteria, accrual rules, maximum limits,
                  and applicable regulations that govern its administration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leave Types Table */}
        <Card>
          <CardHeader>
            <CardTitle>Configured Leave Types</CardTitle>
            <CardDescription>
              {filteredLeaveTypes.length} leave type{filteredLeaveTypes.length !== 1 && 's'} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Eligibility</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaveTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No leave types found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaveTypes.map((leaveType) => (
                      <TableRow
                        key={leaveType.leaveTypeId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => viewLeaveType(leaveType)}
                      >
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono">
                                {leaveType.code}
                              </Badge>
                              <span className="font-medium">{leaveType.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {leaveType.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {leaveType.maxDaysAllowed && (
                              <div>Max: {leaveType.maxDaysAllowed} days</div>
                            )}
                            {leaveType.minNoticeRequired && (
                              <div className="text-muted-foreground">
                                Notice: {leaveType.minNoticeRequired} days
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {leaveType.applicableCadres && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {leaveType.applicableCadres.length} cadre(s)
                              </div>
                            )}
                            {leaveType.minServiceRequired && (
                              <div className="text-muted-foreground">
                                Service: {leaveType.minServiceRequired} months
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {leaveType.requiresMedicalCertificate && (
                              <Badge variant="secondary" className="text-xs">
                                Medical Cert
                              </Badge>
                            )}
                            {leaveType.allowPrefixSuffix && (
                              <Badge variant="secondary" className="text-xs">
                                Prefix/Suffix
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {leaveType.isActive ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewLeaveType(leaveType);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
              <CardDescription>Total Leave Types</CardDescription>
              <CardTitle className="text-3xl">{leaveTypes.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Types</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {leaveTypes.filter((lt) => lt.isActive).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>With Medical Req.</CardDescription>
              <CardTitle className="text-3xl">
                {leaveTypes.filter((lt) => lt.requiresMedicalCertificate).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Need certificate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Allow Prefix/Suffix</CardDescription>
              <CardTitle className="text-3xl">
                {leaveTypes.filter((lt) => lt.allowPrefixSuffix).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Holiday combination</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Leave Type Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedLeaveType && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="font-mono text-base">
                    {selectedLeaveType.code}
                  </Badge>
                  {selectedLeaveType.isActive ? (
                    <Badge className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedLeaveType.name}</DialogTitle>
                <DialogDescription>{selectedLeaveType.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Basic Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Basic Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Maximum Days Allowed</div>
                      <div className="font-medium">
                        {selectedLeaveType.maxDaysAllowed || 'No limit'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Minimum Notice Required</div>
                      <div className="font-medium">
                        {selectedLeaveType.minNoticeRequired
                          ? `${selectedLeaveType.minNoticeRequired} days`
                          : 'Not required'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Allow Prefix/Suffix</div>
                      <div className="font-medium">
                        {selectedLeaveType.allowPrefixSuffix ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Allow Half Days</div>
                      <div className="font-medium">
                        {selectedLeaveType.allowHalfDay ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Eligibility Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedLeaveType.minServiceRequired && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Minimum Service Required
                        </div>
                        <div className="font-medium">
                          {selectedLeaveType.minServiceRequired} months
                        </div>
                      </div>
                    )}

                    {selectedLeaveType.applicableCadres && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Applicable Cadres
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLeaveType.applicableCadres.map((cadre, index) => (
                            <Badge key={index} variant="secondary">
                              {cadre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedLeaveType.genderRestriction && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Gender Restriction
                        </div>
                        <Badge>{selectedLeaveType.genderRestriction}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documentation Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Documentation Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      {selectedLeaveType.requiresMedicalCertificate ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">Medical Certificate Required</span>
                    </div>

                    {selectedLeaveType.requiredDocuments &&
                      selectedLeaveType.requiredDocuments.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Required Documents
                          </div>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedLeaveType.requiredDocuments.map((doc, index) => (
                              <li key={index} className="text-sm">
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Applicable Regulations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Applicable Regulations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedLeaveType.applicableRegulations &&
                    selectedLeaveType.applicableRegulations.length > 0 ? (
                      <div className="space-y-2">
                        {selectedLeaveType.applicableRegulations.map((regId) => {
                          const regulation = REGULATIONS.find((r) => r.regulationId === regId);
                          return regulation ? (
                            <div
                              key={regId}
                              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="outline" className="font-mono text-xs mb-1">
                                    {regulation.regulationNumber}
                                  </Badge>
                                  <div className="font-medium text-sm">{regulation.title}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {regulation.summary}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No regulations linked</p>
                    )}
                  </CardContent>
                </Card>

                {/* Special Rules */}
                {selectedLeaveType.specialRules && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Special Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedLeaveType.specialRules}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
