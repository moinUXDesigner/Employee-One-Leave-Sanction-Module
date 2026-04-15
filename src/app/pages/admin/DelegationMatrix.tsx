import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DELEGATION_MATRIX, LEAVE_TYPES, getUserById } from '../../services/mockData';
import { formatDate } from '../../utils/leaveCalculations';
import type { DelegationMatrix as DelegationMatrixType } from '../../types';
import { ArrowLeft, Search, Shield, Edit, Plus, CheckCircle, XCircle } from 'lucide-react';

export function DelegationMatrix() {
  const navigate = useNavigate();
  const [delegations, setDelegations] = useState<DelegationMatrixType[]>([]);
  const [filteredDelegations, setFilteredDelegations] = useState<DelegationMatrixType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDelegations();
  }, []);

  useEffect(() => {
    filterDelegations();
  }, [delegations, searchTerm]);

  const loadDelegations = () => {
    setDelegations(DELEGATION_MATRIX);
  };

  const filterDelegations = () => {
    let filtered = delegations;

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.authorityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.authorityDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.delegationOrderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDelegations(filtered);
  };

  const getLeaveTypeName = (leaveTypeId: string): string => {
    const leaveType = LEAVE_TYPES.find((lt) => lt.leaveTypeId === leaveTypeId);
    return leaveType ? `${leaveType.name} (${leaveType.code})` : leaveTypeId;
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
                <h1 className="text-2xl font-bold">Delegation Matrix</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage delegation of powers for leave sanctions
                </p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Delegation
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About Delegation of Powers</h3>
                <p className="text-sm text-muted-foreground">
                  The delegation matrix defines which authorities can sanction which types of leaves
                  and for what duration. This ensures proper hierarchy and compliance with APTRANSCO
                  regulations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by authority name, designation, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delegations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Delegation Rules</CardTitle>
            <CardDescription>
              {filteredDelegations.length} delegation{filteredDelegations.length !== 1 && 's'} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Authority</TableHead>
                    <TableHead>Applicable Leave Types</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDelegations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No delegations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDelegations.map((delegation) => (
                      <TableRow key={delegation.delegationId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{delegation.authorityName}</div>
                            <div className="text-sm text-muted-foreground">
                              {delegation.authorityDesignation}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {delegation.applicableLeaveTypes.slice(0, 2).map((ltId) => (
                              <Badge key={ltId} variant="outline" className="text-xs">
                                {getLeaveTypeName(ltId)}
                              </Badge>
                            ))}
                            {delegation.applicableLeaveTypes.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{delegation.applicableLeaveTypes.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {delegation.maxDaysLimit && (
                              <div>Max Days: {delegation.maxDaysLimit}</div>
                            )}
                            {delegation.amountLimit && (
                              <div>Amount: ₹{delegation.amountLimit.toLocaleString()}</div>
                            )}
                            {!delegation.maxDaysLimit && !delegation.amountLimit && (
                              <span className="text-muted-foreground">No limits</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {delegation.applicableOffices && (
                              <div className="text-xs">
                                {delegation.applicableOffices.slice(0, 2).join(', ')}
                                {delegation.applicableOffices.length > 2 &&
                                  ` +${delegation.applicableOffices.length - 2}`}
                              </div>
                            )}
                            {delegation.applicableCadres && (
                              <div className="text-xs text-muted-foreground">
                                {delegation.applicableCadres.join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{delegation.delegationOrderNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(delegation.delegationOrderDate)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Effective: {formatDate(delegation.effectiveFrom)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {delegation.isActive ? (
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
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Delegations</CardDescription>
              <CardTitle className="text-3xl">{delegations.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configured rules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Delegations</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {delegations.filter((d) => d.isActive).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently effective</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Authorities</CardDescription>
              <CardTitle className="text-3xl">
                {new Set(delegations.map((d) => d.sanctioningAuthority)).size}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Unique authorities</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
