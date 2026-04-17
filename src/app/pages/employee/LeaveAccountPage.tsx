import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, BookOpen, Calendar, Download, Search, TrendingUp, User } from 'lucide-react';
import { useNavigate } from '../../hooks/useNavigate';

// Mock data based on provided JSON
const leaveAccountData = {
  employee: {
    fullName: "Mohd Arif Khan",
    dateOfBirth: "14-09-1985"
  },
  leaveAccount: {
    records: [
      {
        leaveType: "Earned Leave Quota",
        designation: "Junior Assistant / Accounts",
        station: "Corporate Office / Vijayawada",
        dutyFrom: "01-01-2023",
        dutyTo: "31-12-2023",
        dutyDays: 365,
        previousBalance: 42,
        leaveEarned: 30,
        totalCredit: 72,
        utilisedFrom: null,
        utilisedTo: null,
        utilisedDays: 0,
        balanceAtCredit: 72
      },
      {
        leaveType: "Earned Leave",
        designation: "",
        station: "",
        dutyFrom: null,
        dutyTo: null,
        dutyDays: null,
        previousBalance: null,
        leaveEarned: null,
        totalCredit: null,
        utilisedFrom: "15-03-2023",
        utilisedTo: "18-03-2023",
        utilisedDays: 4,
        balanceAtCredit: 68
      },
      {
        leaveType: "Earned Leave",
        designation: "",
        station: "",
        dutyFrom: null,
        dutyTo: null,
        dutyDays: null,
        previousBalance: null,
        leaveEarned: null,
        totalCredit: null,
        utilisedFrom: "10-08-2023",
        utilisedTo: "14-08-2023",
        utilisedDays: 5,
        balanceAtCredit: 63
      },
      {
        leaveType: "Earned Leave Quota",
        designation: "Senior Assistant / Finance",
        station: "Head Office / Guntur",
        dutyFrom: "01-01-2024",
        dutyTo: "31-12-2024",
        dutyDays: 366,
        previousBalance: 63,
        leaveEarned: 30,
        totalCredit: 93,
        utilisedFrom: null,
        utilisedTo: null,
        utilisedDays: 0,
        balanceAtCredit: 93
      },
      {
        leaveType: "Earned Leave",
        designation: "",
        station: "",
        dutyFrom: null,
        dutyTo: null,
        dutyDays: null,
        previousBalance: null,
        leaveEarned: null,
        totalCredit: null,
        utilisedFrom: "05-02-2024",
        utilisedTo: "20-02-2024",
        utilisedDays: 16,
        balanceAtCredit: 77
      },
      {
        leaveType: "Earned Leave",
        designation: "",
        station: "",
        dutyFrom: null,
        dutyTo: null,
        dutyDays: null,
        previousBalance: null,
        leaveEarned: null,
        totalCredit: null,
        utilisedFrom: "11-09-2024",
        utilisedTo: "18-09-2024",
        utilisedDays: 8,
        balanceAtCredit: 69
      },
      {
        leaveType: "Half Pay Leave Quota",
        designation: "Senior Assistant / Finance",
        station: "Head Office / Guntur",
        dutyFrom: "01-01-2024",
        dutyTo: "31-12-9999",
        dutyDays: null,
        previousBalance: 210,
        leaveEarned: 20,
        totalCredit: 230,
        utilisedFrom: null,
        utilisedTo: null,
        utilisedDays: 0,
        balanceAtCredit: 230
      },
      {
        leaveType: "Half Pay Leave",
        designation: "",
        station: "",
        dutyFrom: null,
        dutyTo: null,
        dutyDays: null,
        previousBalance: null,
        leaveEarned: null,
        totalCredit: null,
        utilisedFrom: "03-01-2025",
        utilisedTo: "07-01-2025",
        utilisedDays: 5,
        balanceAtCredit: 225
      }
    ]
  }
};

export function LeaveAccountPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [activeLeaveType, setActiveLeaveType] = useState<'EL' | 'HPL'>('EL');

  // Calculate current balances
  const currentELBalance = leaveAccountData.leaveAccount.records
    .filter(r => r.leaveType.includes('Earned Leave'))
    .sort((a, b) => {
      const dateA = a.utilisedTo || a.dutyTo || '01-01-1970';
      const dateB = b.utilisedTo || b.dutyTo || '01-01-1970';
      return dateB.localeCompare(dateA);
    })[0]?.balanceAtCredit || 0;

  const currentHPLBalance = leaveAccountData.leaveAccount.records
    .filter(r => r.leaveType.includes('Half Pay Leave'))
    .sort((a, b) => {
      const dateA = a.utilisedTo || a.dutyTo || '01-01-1970';
      const dateB = b.utilisedTo || b.dutyTo || '01-01-1970';
      return dateB.localeCompare(dateA);
    })[0]?.balanceAtCredit || 0;

  // Calculate leave availed this year for active leave type
  const currentYear = new Date().getFullYear();
  const leaveAvailedThisYear = leaveAccountData.leaveAccount.records
    .filter(r => {
      if (!r.utilisedFrom) return false;
      const year = r.utilisedFrom.split('-')[2];
      const matchesYear = parseInt(year) === currentYear;
      const matchesType = activeLeaveType === 'EL'
        ? r.leaveType.toLowerCase().includes('earned leave')
        : r.leaveType.toLowerCase().includes('half pay leave');
      return matchesYear && matchesType;
    })
    .reduce((sum, r) => sum + (r.utilisedDays || 0), 0);

  // Filter transactions based on active leave type
  const filteredRecords = leaveAccountData.leaveAccount.records.filter(record => {
    // Filter by active leave type
    const matchesLeaveType = activeLeaveType === 'EL'
      ? record.leaveType.toLowerCase().includes('earned leave')
      : record.leaveType.toLowerCase().includes('half pay leave');

    const matchesSearch = record.leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.designation && record.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const recordYear = record.dutyFrom?.split('-')[2] || record.utilisedFrom?.split('-')[2] || '';
    const matchesYear = filterYear === 'all' || recordYear === filterYear;

    return matchesLeaveType && matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const years = [...new Set(leaveAccountData.leaveAccount.records.map(r =>
    r.dutyFrom?.split('-')[2] || r.utilisedFrom?.split('-')[2]
  ).filter(Boolean))].sort().reverse();

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Leave Account</h1>
              <p className="text-sm text-muted-foreground">{leaveAccountData.employee.fullName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Summary Cards - All in one row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Unified Leave Balance Card */}
          <Card className={`transition-all duration-300 col-span-2 ${
            activeLeaveType === 'EL'
              ? 'bg-blue-50 dark:bg-blue-950 border-blue-500'
              : 'bg-orange-50 dark:bg-orange-950 border-orange-500'
          }`}>
            <CardContent className="pt-3 pb-3">
              {/* Dropdown Selector */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className={`w-4 h-4 ${activeLeaveType === 'EL' ? 'text-blue-600' : 'text-orange-600'}`} />
                  <p className={`text-xs font-medium ${activeLeaveType === 'EL' ? 'text-blue-600' : 'text-orange-600'}`}>
                    Leave Balance
                  </p>
                </div>
                <Select value={activeLeaveType} onValueChange={(value) => setActiveLeaveType(value as 'EL' | 'HPL')}>
                  <SelectTrigger className={`w-64 h-7 text-xs ${
                    activeLeaveType === 'EL'
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900 text-blue-700'
                      : 'border-orange-300 bg-orange-50 dark:bg-orange-900 text-orange-700'
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EL">Earned Leave (EL)</SelectItem>
                    <SelectItem value="HPL">Half Pay Leave (HPL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Balance Display */}
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-3xl font-bold ${activeLeaveType === 'EL' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {activeLeaveType === 'EL' ? currentELBalance : currentHPLBalance}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Days Available</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Next Credit</p>
                  <p className={`text-xs font-semibold ${activeLeaveType === 'EL' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {activeLeaveType === 'EL' ? '01 Jul 2026' : '01 Jan 2026'}
                  </p>
                </div>
              </div>

              {/* Rule Text */}
              <div className={`mt-2 pt-2 border-t ${
                activeLeaveType === 'EL'
                  ? 'border-blue-200 dark:border-blue-800'
                  : 'border-orange-200 dark:border-orange-800'
              }`}>
                <p className="text-[10px] text-muted-foreground">
                  {activeLeaveType === 'EL'
                    ? '15 days credited every half year (Jan & Jul)'
                    : '20 days credited annually on service anniversary'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Availed Card */}
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <p className="text-xs text-muted-foreground">{activeLeaveType} Availed</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{leaveAvailedThisYear}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Days (2025)</p>
            </CardContent>
          </Card>

          {/* Date of Birth Card */}
          <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-muted-foreground">Date of Birth</p>
              </div>
              <p className="text-base font-bold text-purple-600">{leaveAccountData.employee.dateOfBirth}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 opacity-0">.</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="statement">Statement</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={activeLeaveType === 'EL' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'}>
                    Showing {activeLeaveType === 'EL' ? 'Earned Leave' : 'Half Pay Leave'} Transactions
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List - Mobile Cards */}
            <div className="space-y-3 lg:hidden">
              {filteredRecords.map((record, index) => (
                <Card key={index}>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{record.leaveType}</p>
                        {record.designation && (
                          <p className="text-xs text-muted-foreground">{record.designation}</p>
                        )}
                      </div>
                      <Badge variant={record.leaveType.includes('Quota') ? 'default' : 'secondary'}>
                        {record.leaveType.includes('Quota') ? 'Credit' : 'Debit'}
                      </Badge>
                    </div>

                    {record.dutyFrom && record.dutyTo && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Duty: </span>
                        <span>{record.dutyFrom} to {record.dutyTo}</span>
                      </div>
                    )}

                    {record.utilisedFrom && record.utilisedTo && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">Utilised: </span>
                        <span>{record.utilisedFrom} to {record.utilisedTo}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      {record.leaveEarned !== null && (
                        <div>
                          <span className="text-muted-foreground">Earned: </span>
                          <span className="font-medium text-green-600">+{record.leaveEarned}</span>
                        </div>
                      )}
                      {record.utilisedDays > 0 && (
                        <div>
                          <span className="text-muted-foreground">Used: </span>
                          <span className="font-medium text-red-600">-{record.utilisedDays}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Balance: </span>
                        <span className="font-bold text-primary">{record.balanceAtCredit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transaction Table - Desktop */}
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 text-xs font-medium">Leave Type</th>
                          <th className="text-left p-3 text-xs font-medium">Designation</th>
                          <th className="text-left p-3 text-xs font-medium">Period</th>
                          <th className="text-right p-3 text-xs font-medium">Prev. Bal.</th>
                          <th className="text-right p-3 text-xs font-medium">Earned</th>
                          <th className="text-right p-3 text-xs font-medium">Used</th>
                          <th className="text-right p-3 text-xs font-medium">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-3 text-sm">{record.leaveType}</td>
                            <td className="p-3 text-sm text-muted-foreground">{record.designation || '-'}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {record.dutyFrom ? `${record.dutyFrom} to ${record.dutyTo}` :
                               record.utilisedFrom ? `${record.utilisedFrom} to ${record.utilisedTo}` : '-'}
                            </td>
                            <td className="p-3 text-sm text-right">{record.previousBalance ?? '-'}</td>
                            <td className="p-3 text-sm text-right text-green-600">
                              {record.leaveEarned ? `+${record.leaveEarned}` : '-'}
                            </td>
                            <td className="p-3 text-sm text-right text-red-600">
                              {record.utilisedDays > 0 ? `-${record.utilisedDays}` : '-'}
                            </td>
                            <td className="p-3 text-sm text-right font-bold text-primary">{record.balanceAtCredit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            {activeLeaveType === 'EL' ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Earned Leave (EL) Credit Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">Auto Credit: 15 days every half year</p>
                        <p className="text-xs text-muted-foreground">Credits are automatically added on:</p>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                          <li>• 1st January (H1)</li>
                          <li>• 1st July (H2)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Leave Deduction Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">When earned leave is sanctioned, the balance is automatically reduced by the number of days availed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Carry Forward Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Unused earned leave balance is carried forward to the next year</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Half Pay Leave (HPL) Credit Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">Auto Credit: 20 days per year</p>
                        <p className="text-xs text-muted-foreground">Based on completion of service years from date of joining</p>
                        <p className="text-xs text-muted-foreground mt-2">Credits are added annually on the anniversary of the joining date</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Leave Deduction Rule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">When half pay leave is sanctioned, the balance is automatically reduced by the number of days availed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Carry Forward Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Unused half pay leave balance is carried forward to the next year</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Statement Tab */}
          <TabsContent value="statement" className="space-y-4">
            <div className="mb-4">
              <Badge variant="outline" className={activeLeaveType === 'EL' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-orange-100 text-orange-700 border-orange-300'}>
                {activeLeaveType === 'EL' ? 'Earned Leave' : 'Half Pay Leave'} Statement
              </Badge>
            </div>
            {years.map(year => {
              const yearRecords = leaveAccountData.leaveAccount.records.filter(r => {
                const recordYear = r.dutyFrom?.split('-')[2] || r.utilisedFrom?.split('-')[2];
                const matchesYear = recordYear === year;
                const matchesType = activeLeaveType === 'EL'
                  ? r.leaveType.toLowerCase().includes('earned leave')
                  : r.leaveType.toLowerCase().includes('half pay leave');
                return matchesYear && matchesType;
              });

              if (yearRecords.length === 0) return null;

              const opening = yearRecords[0]?.previousBalance || 0;
              const credited = yearRecords.filter(r => r.leaveEarned).reduce((sum, r) => sum + (r.leaveEarned || 0), 0);
              const used = yearRecords.filter(r => r.utilisedDays).reduce((sum, r) => sum + (r.utilisedDays || 0), 0);
              const closing = yearRecords[yearRecords.length - 1]?.balanceAtCredit || 0;

              return (
                <Card key={year}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Year {year}</CardTitle>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Opening Balance</p>
                        <p className="text-xl font-bold">{opening}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Credited</p>
                        <p className="text-xl font-bold text-green-600">+{credited}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Used</p>
                        <p className="text-xl font-bold text-red-600">-{used}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Closing Balance</p>
                        <p className="text-xl font-bold text-primary">{closing}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
