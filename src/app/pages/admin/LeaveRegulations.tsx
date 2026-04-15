import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { REGULATIONS, LEAVE_TYPES } from '../../services/mockData';
import { formatDate } from '../../utils/leaveCalculations';
import type { Regulation } from '../../types';
import { ArrowLeft, Search, BookOpen, FileText, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';

export function LeaveRegulations() {
  const navigate = useNavigate();
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [filteredRegulations, setFilteredRegulations] = useState<Regulation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadRegulations();
  }, []);

  useEffect(() => {
    filterRegulations();
  }, [regulations, searchTerm, filterStatus]);

  const loadRegulations = () => {
    setRegulations(REGULATIONS);
  };

  const filterRegulations = () => {
    let filtered = regulations;

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.regulationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) =>
        filterStatus === 'active' ? r.isActive : !r.isActive
      );
    }

    setFilteredRegulations(filtered);
  };

  const getLeaveTypeName = (leaveTypeId: string): string => {
    const leaveType = LEAVE_TYPES.find((lt) => lt.leaveTypeId === leaveTypeId);
    return leaveType ? leaveType.code : leaveTypeId;
  };

  const viewRegulation = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setIsDetailOpen(true);
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
                <h1 className="text-2xl font-bold">Leave Regulations Library</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Browse and manage APTRANSCO leave regulations
                </p>
              </div>
            </div>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Add Regulation
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Card */}
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">About Regulations Library</h3>
                <p className="text-sm text-muted-foreground">
                  This library contains all applicable leave regulations, government orders, and
                  circulars that govern leave administration in APTRANSCO. Each regulation is
                  linked to applicable leave types and includes full text with amendments.
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
                  placeholder="Search by regulation number, title, or keywords..."
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
                  <SelectItem value="all">All Regulations</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Regulations List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredRegulations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No regulations found matching your criteria
              </CardContent>
            </Card>
          ) : (
            filteredRegulations.map((regulation) => (
              <Card
                key={regulation.regulationId}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewRegulation(regulation)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {regulation.regulationNumber}
                        </Badge>
                        {regulation.isActive ? (
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
                      </div>
                      <CardTitle className="text-lg">{regulation.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {regulation.summary}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        viewRegulation(regulation);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Issue Date</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(regulation.issueDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Effective From</div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(regulation.effectiveFrom)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Applicable Leave Types</div>
                      <div className="flex flex-wrap gap-1">
                        {regulation.applicableLeaveTypes.slice(0, 3).map((ltId) => (
                          <Badge key={ltId} variant="secondary" className="text-xs">
                            {getLeaveTypeName(ltId)}
                          </Badge>
                        ))}
                        {regulation.applicableLeaveTypes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{regulation.applicableLeaveTypes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {regulation.amendments && regulation.amendments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-muted-foreground">
                        {regulation.amendments.length} amendment(s) available
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Regulations</CardDescription>
              <CardTitle className="text-3xl">{regulations.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In library</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Regulations</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {regulations.filter((r) => r.isActive).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Currently effective</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>With Amendments</CardDescription>
              <CardTitle className="text-3xl">
                {regulations.filter((r) => r.amendments && r.amendments.length > 0).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Updated regulations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regulation Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedRegulation && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="font-mono">
                    {selectedRegulation.regulationNumber}
                  </Badge>
                  {selectedRegulation.isActive ? (
                    <Badge className="bg-green-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedRegulation.title}</DialogTitle>
                <DialogDescription>{selectedRegulation.summary}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
                  <div>
                    <div className="text-muted-foreground">Issue Date</div>
                    <div className="font-medium">{formatDate(selectedRegulation.issueDate)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Effective From</div>
                    <div className="font-medium">{formatDate(selectedRegulation.effectiveFrom)}</div>
                  </div>
                  {selectedRegulation.supersedes && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Supersedes</div>
                      <div className="font-medium font-mono text-xs">
                        {selectedRegulation.supersedes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Applicable Leave Types */}
                <div>
                  <h3 className="font-medium mb-2">Applicable Leave Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegulation.applicableLeaveTypes.map((ltId) => {
                      const leaveType = LEAVE_TYPES.find((lt) => lt.leaveTypeId === ltId);
                      return (
                        <Badge key={ltId} variant="secondary">
                          {leaveType ? `${leaveType.name} (${leaveType.code})` : ltId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Full Text */}
                <div>
                  <h3 className="font-medium mb-2">Regulation Text</h3>
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedRegulation.fullText}
                  </div>
                </div>

                {/* Amendments */}
                {selectedRegulation.amendments && selectedRegulation.amendments.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Amendments</h3>
                    <div className="space-y-3">
                      {selectedRegulation.amendments.map((amendment, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {amendment.amendmentNumber}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(amendment.amendmentDate)}
                              </span>
                            </div>
                            <p className="text-sm">{amendment.amendmentText}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {selectedRegulation.keywords && selectedRegulation.keywords.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedRegulation.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
