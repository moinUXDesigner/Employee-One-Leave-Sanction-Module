import { useState, useEffect } from 'react';
import { useNavigate } from '../../hooks/useNavigate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Search, FileText, Plus, Edit, Eye, CheckCircle, XCircle, Copy } from 'lucide-react';

interface OrderTemplate {
  templateId: string;
  templateName: string;
  templateType: 'SanctionOrder' | 'InternalNote' | 'RejectionLetter' | 'NoticeToJoin' | 'Other';
  description: string;
  applicableLeaveTypes: string[];
  templateContent: string;
  variables: string[];
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  lastModifiedBy: string;
  lastModifiedDate: string;
}

const MOCK_TEMPLATES: OrderTemplate[] = [
  {
    templateId: 'TPL-001',
    templateName: 'Standard Sanction Order',
    templateType: 'SanctionOrder',
    description: 'Default template for leave sanction orders',
    applicableLeaveTypes: ['LT-001', 'LT-002', 'LT-003'],
    templateContent: `OFFICE OF THE {{SANCTIONING_AUTHORITY}}
ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED

Memo No: {{MEMO_NUMBER}}
Date: {{SANCTION_DATE}}

SUBJECT: Sanction of {{LEAVE_TYPE}} to {{EMPLOYEE_NAME}}, {{DESIGNATION}} - Reg.

REFERENCE: Application dated {{APPLICATION_DATE}}

In accordance with the provisions of {{REGULATION_REFERENCE}}, sanction is hereby accorded to {{EMPLOYEE_NAME}}, {{DESIGNATION}}, {{OFFICE}} for availing {{LEAVE_TYPE}} for {{LEAVE_DAYS}} days from {{FROM_DATE}} to {{TO_DATE}}.

During the period of leave, {{HE_SHE}} is permitted to stay at {{LEAVE_ADDRESS}}.

{{HE_SHE}} shall return to duty on {{REJOIN_DATE}}.

Pay and allowances admissible shall be regulated as per applicable rules.

This issues with the concurrence of the Finance Department.

Sd/-
{{SANCTIONING_AUTHORITY_NAME}}
{{SANCTIONING_AUTHORITY_DESIGNATION}}

Copy to:
1. The Accounts Officer - for necessary action
2. The concerned employee
3. Personal file
4. Office file`,
    variables: [
      'SANCTIONING_AUTHORITY',
      'MEMO_NUMBER',
      'SANCTION_DATE',
      'LEAVE_TYPE',
      'EMPLOYEE_NAME',
      'DESIGNATION',
      'APPLICATION_DATE',
      'REGULATION_REFERENCE',
      'OFFICE',
      'LEAVE_DAYS',
      'FROM_DATE',
      'TO_DATE',
      'LEAVE_ADDRESS',
      'HE_SHE',
      'REJOIN_DATE',
      'SANCTIONING_AUTHORITY_NAME',
      'SANCTIONING_AUTHORITY_DESIGNATION',
    ],
    isActive: true,
    createdBy: 'admin007',
    createdDate: '2026-01-15',
    lastModifiedBy: 'admin007',
    lastModifiedDate: '2026-04-01',
  },
  {
    templateId: 'TPL-002',
    templateName: 'Internal Note Template',
    templateType: 'InternalNote',
    description: 'Standard internal note for application processing',
    applicableLeaveTypes: ['LT-001', 'LT-002', 'LT-003', 'LT-004'],
    templateContent: `INTERNAL NOTE

TO: {{TO_AUTHORITY}}
FROM: {{FROM_AUTHORITY}}
DATE: {{NOTE_DATE}}
SUBJECT: Processing of {{LEAVE_TYPE}} application of {{EMPLOYEE_NAME}}

REFERENCE: Application No. {{APPLICATION_NUMBER}} dated {{APPLICATION_DATE}}

DETAILS:
{{EMPLOYEE_NAME}}, {{DESIGNATION}} working in {{OFFICE}} has applied for {{LEAVE_TYPE}} from {{FROM_DATE}} to {{TO_DATE}} ({{LEAVE_DAYS}} days).

GROUNDS:
{{REASON_FOR_LEAVE}}

LEAVE ADDRESS:
{{LEAVE_ADDRESS}}

LEAVE BALANCE VERIFICATION:
- Opening Balance: {{OPENING_BALANCE}}
- Availed: {{AVAILED_BALANCE}}
- Available: {{AVAILABLE_BALANCE}}
- Applied: {{APPLIED_DAYS}}

ELIGIBILITY CHECK:
{{ELIGIBILITY_STATUS}}

DOCUMENTS ATTACHED:
{{DOCUMENTS_LIST}}

RECOMMENDATION:
{{RECOMMENDATION}}

{{FROM_AUTHORITY_NAME}}
{{FROM_AUTHORITY_DESIGNATION}}`,
    variables: [
      'TO_AUTHORITY',
      'FROM_AUTHORITY',
      'NOTE_DATE',
      'LEAVE_TYPE',
      'EMPLOYEE_NAME',
      'APPLICATION_NUMBER',
      'APPLICATION_DATE',
      'DESIGNATION',
      'OFFICE',
      'FROM_DATE',
      'TO_DATE',
      'LEAVE_DAYS',
      'REASON_FOR_LEAVE',
      'LEAVE_ADDRESS',
      'OPENING_BALANCE',
      'AVAILED_BALANCE',
      'AVAILABLE_BALANCE',
      'APPLIED_DAYS',
      'ELIGIBILITY_STATUS',
      'DOCUMENTS_LIST',
      'RECOMMENDATION',
      'FROM_AUTHORITY_NAME',
      'FROM_AUTHORITY_DESIGNATION',
    ],
    isActive: true,
    createdBy: 'admin007',
    createdDate: '2026-01-15',
    lastModifiedBy: 'admin007',
    lastModifiedDate: '2026-03-20',
  },
  {
    templateId: 'TPL-003',
    templateName: 'Medical Leave Sanction Order',
    templateType: 'SanctionOrder',
    description: 'Specialized template for medical leave sanctions',
    applicableLeaveTypes: ['LT-004'],
    templateContent: `OFFICE OF THE {{SANCTIONING_AUTHORITY}}
ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED

Memo No: {{MEMO_NUMBER}}
Date: {{SANCTION_DATE}}

SUBJECT: Sanction of Medical Leave to {{EMPLOYEE_NAME}}, {{DESIGNATION}} - Reg.

REFERENCE:
1. Application dated {{APPLICATION_DATE}}
2. Medical Certificate from {{HOSPITAL_NAME}} dated {{MEDICAL_CERT_DATE}}

Based on the medical certificate submitted, sanction is hereby accorded to {{EMPLOYEE_NAME}}, {{DESIGNATION}}, {{OFFICE}} for availing Medical Leave for {{LEAVE_DAYS}} days from {{FROM_DATE}} to {{TO_DATE}}.

During the period of leave, {{HE_SHE}} is advised to take complete rest and undergo treatment as prescribed.

{{HE_SHE}} shall submit a fitness certificate from the treating physician before returning to duty.

Pay and allowances admissible shall be regulated as per {{REGULATION_REFERENCE}}.

Sd/-
{{SANCTIONING_AUTHORITY_NAME}}
{{SANCTIONING_AUTHORITY_DESIGNATION}}

Copy to:
1. The Chief Medical Officer - for information
2. The Accounts Officer - for necessary action
3. The concerned employee
4. Personal file`,
    variables: [
      'SANCTIONING_AUTHORITY',
      'MEMO_NUMBER',
      'SANCTION_DATE',
      'EMPLOYEE_NAME',
      'DESIGNATION',
      'APPLICATION_DATE',
      'HOSPITAL_NAME',
      'MEDICAL_CERT_DATE',
      'OFFICE',
      'LEAVE_DAYS',
      'FROM_DATE',
      'TO_DATE',
      'HE_SHE',
      'REGULATION_REFERENCE',
      'SANCTIONING_AUTHORITY_NAME',
      'SANCTIONING_AUTHORITY_DESIGNATION',
    ],
    isActive: true,
    createdBy: 'admin007',
    createdDate: '2026-02-01',
    lastModifiedBy: 'admin007',
    lastModifiedDate: '2026-02-01',
  },
  {
    templateId: 'TPL-004',
    templateName: 'Rejection Letter',
    templateType: 'RejectionLetter',
    description: 'Template for leave application rejections',
    applicableLeaveTypes: [],
    templateContent: `OFFICE OF THE {{SANCTIONING_AUTHORITY}}
ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED

Date: {{REJECTION_DATE}}

To,
{{EMPLOYEE_NAME}}
{{DESIGNATION}}
{{OFFICE}}

SUBJECT: Rejection of Leave Application - Reg.

REFERENCE: Your leave application dated {{APPLICATION_DATE}}

Your application for {{LEAVE_TYPE}} from {{FROM_DATE}} to {{TO_DATE}} has been carefully examined and is hereby rejected due to the following reason(s):

{{REJECTION_REASON}}

You may resubmit your application after addressing the above concerns or contact the undersigned for clarification.

Sd/-
{{SANCTIONING_AUTHORITY_NAME}}
{{SANCTIONING_AUTHORITY_DESIGNATION}}`,
    variables: [
      'SANCTIONING_AUTHORITY',
      'REJECTION_DATE',
      'EMPLOYEE_NAME',
      'DESIGNATION',
      'OFFICE',
      'APPLICATION_DATE',
      'LEAVE_TYPE',
      'FROM_DATE',
      'TO_DATE',
      'REJECTION_REASON',
      'SANCTIONING_AUTHORITY_NAME',
      'SANCTIONING_AUTHORITY_DESIGNATION',
    ],
    isActive: true,
    createdBy: 'admin007',
    createdDate: '2026-01-20',
    lastModifiedBy: 'admin007',
    lastModifiedDate: '2026-01-20',
  },
  {
    templateId: 'TPL-005',
    templateName: 'Notice to Join Duty',
    templateType: 'NoticeToJoin',
    description: 'Notice for employees to return to duty post leave',
    applicableLeaveTypes: [],
    templateContent: `OFFICE OF THE {{CONTROLLING_OFFICER}}
ANDHRA PRADESH TRANSMISSION CORPORATION LIMITED

Date: {{NOTICE_DATE}}

To,
{{EMPLOYEE_NAME}}
{{DESIGNATION}}
{{CURRENT_ADDRESS}}

SUBJECT: Notice to Join Duty - Reg.

REFERENCE: Leave sanctioned vide Memo No. {{SANCTION_MEMO_NUMBER}} dated {{SANCTION_DATE}}

You are hereby directed to report for duty on {{EXPECTED_JOIN_DATE}} as your sanctioned leave period concludes on {{LEAVE_END_DATE}}.

Please note the following:
1. Submit fitness certificate if applicable
2. Hand over any pending work/documents
3. Update your attendance register

Failure to report on the specified date without valid reasons may result in disciplinary action as per service rules.

Sd/-
{{CONTROLLING_OFFICER_NAME}}
{{CONTROLLING_OFFICER_DESIGNATION}}`,
    variables: [
      'CONTROLLING_OFFICER',
      'NOTICE_DATE',
      'EMPLOYEE_NAME',
      'DESIGNATION',
      'CURRENT_ADDRESS',
      'SANCTION_MEMO_NUMBER',
      'SANCTION_DATE',
      'EXPECTED_JOIN_DATE',
      'LEAVE_END_DATE',
      'CONTROLLING_OFFICER_NAME',
      'CONTROLLING_OFFICER_DESIGNATION',
    ],
    isActive: true,
    createdBy: 'admin007',
    createdDate: '2026-02-15',
    lastModifiedBy: 'admin007',
    lastModifiedDate: '2026-02-15',
  },
];

export function OrderTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<OrderTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<OrderTemplate | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm]);

  const loadTemplates = () => {
    setTemplates(MOCK_TEMPLATES);
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.templateType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const viewTemplate = (template: OrderTemplate) => {
    setSelectedTemplate(template);
    setIsDetailOpen(true);
  };

  const getTemplateTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      SanctionOrder: 'bg-blue-600',
      InternalNote: 'bg-green-600',
      RejectionLetter: 'bg-red-600',
      NoticeToJoin: 'bg-orange-600',
      Other: 'bg-gray-600',
    };
    return <Badge className={colors[type] || 'bg-gray-600'}>{type}</Badge>;
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
                <h1 className="text-2xl font-bold">Order Templates</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage document templates for auto-generation
                </p>
              </div>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Template
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
                <h3 className="font-medium mb-1">About Order Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Templates are used by the auto-generation engine to create sanction orders,
                  internal notes, and other official documents. Each template contains placeholders
                  (variables) that are replaced with actual data during document generation.
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
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No templates found
              </CardContent>
            </Card>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.templateId}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {template.templateId}
                        </Badge>
                        {getTemplateTypeBadge(template.templateType)}
                        {template.isActive ? (
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
                      <CardTitle className="text-lg">{template.templateName}</CardTitle>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewTemplate(template);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Variables</div>
                      <div className="font-medium">{template.variables.length} placeholders</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Last Modified</div>
                      <div className="font-medium">
                        {new Date(template.lastModifiedDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Modified By</div>
                      <div className="font-medium">{template.lastModifiedBy}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Templates</CardDescription>
              <CardTitle className="text-3xl">{templates.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configured</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {templates.filter((t) => t.isActive).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">In use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sanction Orders</CardDescription>
              <CardTitle className="text-3xl">
                {templates.filter((t) => t.templateType === 'SanctionOrder').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Internal Notes</CardDescription>
              <CardTitle className="text-3xl">
                {templates.filter((t) => t.templateType === 'InternalNote').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Templates</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {selectedTemplate.templateId}
                    </Badge>
                    {getTemplateTypeBadge(selectedTemplate.templateType)}
                    {selectedTemplate.isActive ? (
                      <Badge className="bg-green-600">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
                <DialogTitle className="text-xl">{selectedTemplate.templateName}</DialogTitle>
                <DialogDescription>{selectedTemplate.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Template Content */}
                <div>
                  <h3 className="font-medium mb-2">Template Content</h3>
                  <Textarea
                    value={selectedTemplate.templateContent}
                    readOnly
                    className="font-mono text-sm min-h-[400px]"
                  />
                </div>

                {/* Variables */}
                <div>
                  <h3 className="font-medium mb-2">
                    Variables ({selectedTemplate.variables.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedTemplate.variables.map((variable, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs justify-center">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Template Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Created By</div>
                      <div className="font-medium">{selectedTemplate.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created Date</div>
                      <div className="font-medium">
                        {new Date(selectedTemplate.createdDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Modified By</div>
                      <div className="font-medium">{selectedTemplate.lastModifiedBy}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Modified Date</div>
                      <div className="font-medium">
                        {new Date(selectedTemplate.lastModifiedDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
