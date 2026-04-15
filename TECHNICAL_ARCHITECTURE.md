# APTRANSCO Leave Sanction Module - Technical Architecture

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Mobile     │  │   Tablet     │  │   Desktop    │          │
│  │  (320-480px) │  │ (481-768px)  │  │   (769px+)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Application                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │  Pages   │  │Components│  │ Services │  │  Hooks  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │ Context  │  │  Utils   │  │  Types   │  │ Routing │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      MOCK SERVICE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Auth API │  │Leave API │  │ User API │  │ Rule API │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ SAP Mock │  │  Doc API │  │Audit API │  │ Config   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA PERSISTENCE                           │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  localStorage    │              │   IndexedDB      │         │
│  │  - Session data  │              │  - Large datasets│         │
│  │  - User prefs    │              │  - Documents     │         │
│  │  - Small objects │              │  - Audit logs    │         │
│  └──────────────────┘              └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Application Flow Diagram

### Complete Leave Application Lifecycle

```
┌──────────────┐
│   EMPLOYEE   │
└──────┬───────┘
       │ 1. Apply for Leave
       ↓
┌─────────────────────────────────────────────────────────┐
│           LEAVE APPLICATION WIZARD                       │
│  Step 1: Select Leave Type (with eligibility check)    │
│  Step 2: Enter Dates & Duration (with validation)      │
│  Step 3: Provide Grounds & Address                     │
│  Step 4: Upload Documents                              │
│  Step 5: Automatic Eligibility Check                   │
│  Step 6: Review & Submit                               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ↓
              ┌──────────────────┐
              │ Application DB   │ ← Status: SUBMITTED
              └──────────────────┘
                        │
                        ↓
              ┌──────────────────┐
              │ CONTROLLING OFF. │
              └────────┬─────────┘
                       │ 2. Review & Forward
                       ↓
              ┌──────────────────┐
              │ Application DB   │ ← Status: FORWARDED
              └────────┬─────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────┐
│                    HR/ASSISTANT                          │
│  3a. Verify Leave Balance                               │
│  3b. Scrutinize Documents                               │
│  3c. AUTO-GENERATE Internal Note                        │
│  3d. AUTO-GENERATE Draft Sanction Order                 │
│  3e. AUTO-SELECT Regulation References                  │
│  3f. Review & Edit Generated Content                    │
│  3g. Forward to Sanction Authority                      │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ↓
                ┌──────────────────┐
                │ Application DB   │ ← Status: PENDING_SANCTION
                │ + Internal Note  │ ← Generated
                │ + Draft Order    │ ← Generated
                └────────┬─────────┘
                         │
                         ↓
               ┌──────────────────┐
               │ SANCTION AUTH.   │
               └────────┬─────────┘
                        │ 4. Sanction / Reject / Hold
                        ↓
                ┌───────────────┐
                │ IF SANCTIONED │
                └───────┬───────┘
                        │
                        ↓
         ┌──────────────────────────────────┐
         │ 5. Auto-Generate Final Order     │
         │    - Memo Number                 │
         │    - Issue Date                  │
         │    - Complete Order              │
         └──────────────┬───────────────────┘
                        │
                        ↓
                ┌──────────────────┐
                │ Application DB   │ ← Status: SANCTIONED
                │ + Final Order    │ ← Issued
                └────────┬─────────┘
                         │
                         ↓
         ┌───────────────────────────────────┐
         │ 6. AUTO POST TO SAP                │
         │    - Create SAP transaction        │
         │    - Generate transaction ID       │
         │    - Update status                 │
         └──────────────┬────────────────────┘
                        │
            ┌───────────┴──────────┐
            │                      │
            ↓                      ↓
    ┌──────────────┐      ┌──────────────┐
    │ SAP Database │      │  ACCOUNTS    │
    │ (Mock)       │      │  WING        │
    └──────────────┘      └──────────────┘
            │
            │ 7. Employee proceeds on leave
            │
            ↓
    ┌──────────────┐
    │  EMPLOYEE    │
    │  Returns     │
    └──────┬───────┘
           │ 8. Submit Joining Report
           │    + Fitness Certificate (if medical)
           ↓
    ┌──────────────────┐
    │ Application DB   │ ← Status: REJOINING_PENDING
    │ + Joining Report │
    └────────┬─────────┘
             │
             ↓
    ┌──────────────────┐
    │ CONTROLLING OFF. │
    └────────┬─────────┘
             │ 9. Accept Joining Report
             ↓
    ┌──────────────────┐
    │ Application DB   │ ← Status: CLOSED
    │ + Complete Audit │
    └──────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx
│
├── AuthProvider
│   └── RoleBasedRouter
│       │
│       ├── EmployeeLayout
│       │   ├── EmployeeDashboard
│       │   ├── ApplyLeaveWizard
│       │   │   ├── LeaveTypeSelector
│       │   │   ├── DatesDurationForm
│       │   │   ├── GroundsAddressForm
│       │   │   ├── DocumentUpload
│       │   │   ├── EligibilityCheck
│       │   │   └── ReviewSubmit
│       │   ├── MyApplicationsList
│       │   │   └── ApplicationDetailView
│       │   └── RejoiningFlow
│       │       ├── SubmitJoiningReport
│       │       └── UploadFitnessCertificate
│       │
│       ├── COLayout
│       │   ├── CODashboard
│       │   ├── ReviewInbox
│       │   ├── ApplicationReview
│       │   │   └── ForwardActionSheet
│       │   ├── TeamLeaveCalendar
│       │   └── JoiningReportAcceptance
│       │
│       ├── HRLayout
│       │   ├── HRDashboard
│       │   ├── VerificationQueue
│       │   ├── VerificationDetail
│       │   │   ├── BalanceVerificationPanel
│       │   │   ├── DocumentScrutinyScreen
│       │   │   └── MissingDocumentsModal
│       │   ├── AutoGeneratedNote (⭐ CRITICAL)
│       │   │   ├── NoteGenerator
│       │   │   └── NoteEditor
│       │   ├── AutoGeneratedOrder (⭐ CRITICAL)
│       │   │   ├── OrderGenerator
│       │   │   └── OrderEditor
│       │   ├── RegulationReferenceDrawer (⭐ CRITICAL)
│       │   │   └── RegulationSelector
│       │   ├── ForwardToSanctionAuthority
│       │   └── SAPPostingTracker
│       │
│       ├── SanctionAuthorityLayout
│       │   ├── SADashboard
│       │   ├── SanctionInbox
│       │   ├── ApplicationSummary
│       │   │   ├── RoutePreviewDrawer
│       │   │   └── SanctionActionModal
│       │   ├── FinalOrderApproval
│       │   └── AutoSAPPostingResult
│       │
│       ├── AccountsLayout
│       │   ├── AccountsDashboard
│       │   ├── OrdersReceived
│       │   └── SAPPostedLeaveInfo
│       │
│       └── AdminLayout
│           ├── AdminDashboard
│           ├── DelegationMatrixViewer
│           ├── LeaveRegulationsLibrary
│           ├── LeaveTypeMaster
│           ├── RuleEngineSimulator
│           ├── AuditLogExplorer
│           └── OrderTemplateManager
│
└── Shared Components
    ├── Layout
    │   ├── Header
    │   ├── Footer
    │   ├── Sidebar
    │   └── BottomNavigation
    ├── Forms
    │   ├── Input
    │   ├── Select
    │   ├── DatePicker
    │   ├── FileUpload
    │   └── FormStepper
    ├── Data Display
    │   ├── Card
    │   ├── Table
    │   ├── Timeline
    │   ├── StatusBadge
    │   └── DocumentViewer
    ├── Feedback
    │   ├── Modal
    │   ├── Toast
    │   ├── Alert
    │   ├── BottomSheet
    │   └── Drawer
    └── Navigation
        ├── Tabs
        ├── Breadcrumb
        └── Pagination
```

---

## Data Models

### Core Entities

#### User
```typescript
interface User {
  userId: string;
  employeeId: string;
  name: string;
  email: string;
  mobile: string;
  designation: string;
  department: string;
  office: string;
  zone: string;
  headquarters: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfJoining: Date;
  dateOfBirth: Date;
  role: UserRole;
  controllingOfficer?: string; // userId of CO
  reportingOfficer?: string;
  sanctioningAuthority?: string; // userId of SA
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 
  | 'Employee' 
  | 'ControllingOfficer' 
  | 'HR' 
  | 'SanctionAuthority' 
  | 'Accounts' 
  | 'Admin';
```

#### Leave Type
```typescript
interface LeaveType {
  leaveTypeId: string;
  name: string;
  code: string; // 'EL', 'HPL', 'CL', etc.
  description: string;
  category: LeaveCategory;
  payType: 'FullPay' | 'HalfPay' | 'NoPay';
  
  // Eligibility
  genderRestriction?: 'Male' | 'Female';
  cadreRestrictions?: string[];
  minServiceYears?: number;
  
  // Limits
  maxDaysPerSpell?: number;
  maxDaysPerYear?: number;
  maxSpellsPerYear?: number;
  minDaysNotice?: number;
  
  // Documents
  requiredDocuments: string[];
  medicalCertificateRequired: boolean;
  fitnessCertificateOnReturn: boolean;
  
  // Prefix/Suffix
  prefixSuffixAllowed: boolean;
  
  // Regulations
  applicableRegulations: string[];
  
  // Template
  noteTemplateId?: string;
  orderTemplateId?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type LeaveCategory = 
  | 'Standard' 
  | 'Medical' 
  | 'Maternity' 
  | 'Paternity' 
  | 'Special';
```

#### Leave Balance
```typescript
interface LeaveBalance {
  balanceId: string;
  userId: string;
  leaveTypeId: string;
  year: number;
  
  openingBalance: number;
  credits: number;
  totalAvailable: number;
  
  availed: number;
  pending: number;
  balance: number;
  
  spellsAvailed: number;
  spellsPending: number;
  spellsBalance: number;
  
  lastUpdated: Date;
}
```

#### Leave Application
```typescript
interface LeaveApplication {
  applicationId: string;
  userId: string;
  leaveTypeId: string;
  
  // Dates
  applicationDate: Date;
  
  prefixFromDate?: Date;
  prefixFromSession?: Session;
  prefixToDate?: Date;
  prefixToSession?: Session;
  prefixDays?: number;
  
  leaveFromDate: Date;
  leaveFromSession: Session;
  leaveToDate: Date;
  leaveToSession: Session;
  leaveDays: number;
  
  suffixFromDate?: Date;
  suffixFromSession?: Session;
  suffixToDate?: Date;
  suffixToSession?: Session;
  suffixDays?: number;
  
  totalDays: number;
  
  // Details
  reasonForLeave: string;
  leaveAddress: string;
  contactNumber: string;
  isMedicalLeave: boolean;
  
  // Status
  status: ApplicationStatus;
  currentStage: WorkflowStage;
  
  // Workflow
  workflowHistory: WorkflowHistoryItem[];
  
  // Documents
  attachments: Attachment[];
  
  // Balance Check
  balanceAtApplication: number;
  balanceAfterAvailing: number;
  
  // Eligibility
  isEligible: boolean;
  ineligibilityReason?: string;
  applicableRegulations: string[];
  
  // Generated Content
  internalNoteId?: string;
  draftOrderId?: string;
  finalOrderId?: string;
  
  // SAP
  sapTransactionId?: string;
  sapPostingStatus?: SAPStatus;
  sapPostedAt?: Date;
  
  // Rejoining
  joiningReportId?: string;
  rejoiningStatus?: RejoiningStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

type Session = 'FN' | 'AN';

type ApplicationStatus = 
  | 'Draft'
  | 'Submitted'
  | 'UnderReview'
  | 'Forwarded'
  | 'UnderVerification'
  | 'PendingSanction'
  | 'Sanctioned'
  | 'Rejected'
  | 'Held'
  | 'ReturnedForCorrection'
  | 'Cancelled'
  | 'RejoiningPending'
  | 'Closed';

type WorkflowStage = 
  | 'Employee'
  | 'ControllingOfficer'
  | 'HR'
  | 'SanctionAuthority'
  | 'SAPPosting'
  | 'Accounts'
  | 'RejoiningAcceptance'
  | 'Completed';

type SAPStatus = 
  | 'Pending'
  | 'InProgress'
  | 'Success'
  | 'Failed'
  | 'Retry';

type RejoiningStatus = 
  | 'NotRequired'
  | 'Pending'
  | 'Submitted'
  | 'Accepted'
  | 'Rejected';
```

#### Workflow History
```typescript
interface WorkflowHistoryItem {
  historyId: string;
  applicationId: string;
  
  stage: WorkflowStage;
  action: WorkflowAction;
  status: ApplicationStatus;
  
  actionBy: string; // userId
  actionByName: string;
  actionByRole: UserRole;
  
  remarks?: string;
  actionDate: Date;
  
  metadata?: Record<string, any>;
}

type WorkflowAction = 
  | 'Submitted'
  | 'Reviewed'
  | 'Forwarded'
  | 'Returned'
  | 'Verified'
  | 'NoteGenerated'
  | 'OrderGenerated'
  | 'ForwardedToSA'
  | 'Sanctioned'
  | 'Rejected'
  | 'Held'
  | 'OrderIssued'
  | 'SAPPosted'
  | 'JoiningReportSubmitted'
  | 'JoiningReportAccepted'
  | 'Closed';
```

#### Document/Attachment
```typescript
interface Attachment {
  attachmentId: string;
  applicationId: string;
  
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string; // Mock path or data URL
  
  documentType: DocumentType;
  
  uploadedBy: string; // userId
  uploadedAt: Date;
  
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  remarks?: string;
}

type DocumentType = 
  | 'ApplicationForm'
  | 'MedicalCertificate'
  | 'FitnessCertificate'
  | 'AdmissionLetter'
  | 'BondDocument'
  | 'SupportingDocument'
  | 'Other';
```

#### Internal Note
```typescript
interface InternalNote {
  noteId: string;
  applicationId: string;
  
  // Auto-generated content
  generatedContent: string;
  
  // Editable fields
  finalContent: string;
  
  // Metadata
  generatedBy: string; // userId (HR)
  generatedAt: Date;
  
  editedBy?: string;
  editedAt?: Date;
  
  isFinalized: boolean;
  finalizedAt?: Date;
  
  // Template used
  templateId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Sanction Order
```typescript
interface SanctionOrder {
  orderId: string;
  applicationId: string;
  
  // Order details
  memoNumber: string;
  issueDate: Date;
  
  // Auto-generated content
  generatedContent: string;
  
  // Editable fields
  finalContent: string;
  
  // Order type
  orderType: 'Draft' | 'Final';
  
  // Metadata
  generatedBy?: string; // userId (HR for draft)
  generatedAt?: Date;
  
  issuedBy?: string; // userId (Sanction Authority for final)
  issuedAt?: Date;
  
  editedBy?: string;
  editedAt?: Date;
  
  // Template used
  templateId?: string;
  
  // Distribution
  copyTo: string[]; // userIds
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### Joining Report
```typescript
interface JoiningReport {
  reportId: string;
  applicationId: string;
  userId: string;
  
  // Rejoining details
  rejoiningDate: Date;
  rejoiningSession: Session;
  
  // Fitness certificate (for medical leave)
  fitnessCertificateId?: string;
  
  // Supporting documents
  attachments: Attachment[];
  
  remarks?: string;
  
  // Status
  status: 'Submitted' | 'UnderReview' | 'Accepted' | 'Rejected';
  
  // Acceptance
  reviewedBy?: string; // userId (CO)
  reviewedAt?: Date;
  reviewRemarks?: string;
  
  submittedAt: Date;
  acceptedAt?: Date;
}
```

#### Regulation
```typescript
interface Regulation {
  regulationId: string;
  regulationNumber: string; // 'Regulation 17', 'Regulation 18', etc.
  title: string;
  summary: string;
  fullText: string;
  
  category: string;
  applicableLeaveTypes: string[]; // leaveTypeIds
  
  // Special conditions
  specialConditions?: string[];
  
  // Documents
  requiredDocuments?: string[];
  
  // Limits
  maxDaysAdmissible?: number;
  
  // Sanctioning notes
  sanctioningNotes?: string;
  
  // References
  relatedOrders?: string[];
  amendments?: Amendment[];
  
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

interface Amendment {
  amendmentId: string;
  orderNumber: string;
  orderDate: Date;
  summary: string;
  changes: string;
}
```

#### Delegation Matrix
```typescript
interface DelegationMatrix {
  delegationId: string;
  
  // Authority
  sanctioningAuthority: string; // userId or role
  authorityName: string;
  authorityDesignation: string;
  
  // Scope
  applicableLeaveTypes: string[]; // leaveTypeIds
  applicableOffices?: string[];
  applicableCadres?: string[];
  
  // Limits
  maxDaysLimit?: number;
  amountLimit?: number;
  
  // Special conditions
  conditions?: string[];
  
  // Delegation order reference
  delegationOrderNumber: string;
  delegationOrderDate: Date;
  
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Auto-Generation Engine Architecture

### Auto-Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│              AUTO-GENERATION ENGINE                          │
└─────────────────────────────────────────────────────────────┘

INPUT DATA:
┌──────────────────────────────────────────────────────────────┐
│ - Leave Application (all fields)                             │
│ - Employee Details                                           │
│ - Leave Type Configuration                                   │
│ - Leave Balance Data                                         │
│ - Applicable Regulations                                     │
│ - Delegation Matrix                                          │
│ - Document Verification Status                               │
│ - Templates (Note, Order, Regulation)                        │
└──────────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────────┐
│                    TEMPLATE ENGINE                            │
│                                                               │
│  1. SELECT TEMPLATE                                          │
│     - Match leave type                                       │
│     - Match employee category                                │
│     - Match medical/non-medical                              │
│                                                               │
│  2. EXTRACT VARIABLES                                        │
│     {{employee_name}}                                        │
│     {{designation}}                                          │
│     {{leave_type}}                                           │
│     {{from_date}} to {{to_date}}                            │
│     {{total_days}}                                           │
│     {{opening_balance}}                                      │
│     {{balance_after_availing}}                              │
│     {{regulation_number}}                                    │
│     {{sanctioning_authority}}                                │
│     ... etc.                                                 │
│                                                               │
│  3. APPLY BUSINESS RULES                                     │
│     IF medical_leave:                                        │
│       - Add medical certificate reference                    │
│       - Add fitness certificate requirement                  │
│       - Add medical ground wording                           │
│     IF maternity_leave:                                      │
│       - Add 26 weeks provision                               │
│       - Add pre/post natal wording                           │
│     IF study_leave:                                          │
│       - Add security deposit clause                          │
│       - Add bond requirement                                 │
│     ... etc.                                                 │
│                                                               │
│  4. CALCULATE DERIVED FIELDS                                 │
│     - Prefix/suffix holidays count                           │
│     - Total days including holidays                          │
│     - Balance after sanctioning                              │
│     - Return to duty date                                    │
│     - Pay and allowances formula                             │
│                                                               │
│  5. POPULATE HIERARCHYROUTE                                  │
│     - Employee → CO → HR → SA                                │
│     - Determine SA based on delegation matrix                │
│                                                               │
│  6. MERGE TEMPLATE                                           │
│     - Replace all {{variables}}                              │
│     - Apply conditional sections                             │
│     - Format dates properly                                  │
│     - Apply official formatting                              │
└──────────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────────┐
│                    GENERATED OUTPUTS                          │
│                                                               │
│  OUTPUT 1: INTERNAL NOTE                                     │
│  - Employee details section                                  │
│  - Leave details section                                     │
│  - Balance verification section                              │
│  - Eligibility section                                       │
│  - Document verification section                             │
│  - Recommendation section                                    │
│                                                               │
│  OUTPUT 2: DRAFT SANCTION ORDER                              │
│  - Official header                                           │
│  - Memo number placeholder                                   │
│  - Subject line                                              │
│  - References                                                │
│  - Sanction paragraph                                        │
│  - Pay and allowances                                        │
│  - Return to duty                                            │
│  - Balance statement                                         │
│  - Copy to                                                   │
│  - Signature block                                           │
│                                                               │
│  OUTPUT 3: REGULATION REFERENCE                              │
│  - Applicable regulation number                              │
│  - Rule summary                                              │
│  - Special conditions                                        │
│  - Required documents                                        │
│  - Sanctioning notes                                         │
└──────────────────────────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────────────────┐
│                 REVIEW & EDIT INTERFACE                       │
│  - Display generated content                                 │
│  - Allow inline editing                                      │
│  - Preserve official format                                  │
│  - Track changes                                             │
│  - Save draft                                                │
│  - Finalize                                                  │
└──────────────────────────────────────────────────────────────┘
```

### Template Variables Reference

```typescript
// Template variable system
interface TemplateVariables {
  // Employee
  employee_name: string;
  employee_id: string;
  designation: string;
  department: string;
  office: string;
  zone: string;
  headquarters: string;
  
  // Leave Application
  application_id: string;
  application_date: string;
  leave_type: string;
  leave_type_code: string;
  
  // Dates
  from_date: string;
  from_session: string;
  to_date: string;
  to_session: string;
  total_days: number;
  
  prefix_from_date?: string;
  prefix_to_date?: string;
  prefix_days?: number;
  
  suffix_from_date?: string;
  suffix_to_date?: string;
  suffix_days?: number;
  
  return_date: string;
  
  // Grounds
  reason_for_leave: string;
  leave_address: string;
  contact_number: string;
  
  // Balance
  opening_balance: number;
  credits: number;
  availed: number;
  balance: number;
  balance_after_availing: number;
  
  // Regulation
  regulation_number: string;
  regulation_summary: string;
  special_conditions: string[];
  
  // Documents
  medical_certificate_number?: string;
  medical_certificate_date?: string;
  fitness_certificate_required: boolean;
  
  // Pay & Allowances
  pay_type: 'full pay' | 'half pay' | 'no pay';
  pay_allowances_sentence: string;
  
  // Authority
  sanctioning_authority: string;
  sanctioning_authority_designation: string;
  
  // Officiating
  officiating_officer?: string;
  officiating_arrangement?: string;
  
  // SAP
  sap_transaction_id?: string;
  
  // Joining
  joining_report_date?: string;
  fitness_certificate_number?: string;
  
  // Meta
  current_date: string;
  memo_number_placeholder: string;
  financial_year: string;
}
```

---

## State Management

### Application State Structure

```typescript
// Global App State
interface AppState {
  // Auth
  auth: AuthState;
  
  // User
  currentUser: User | null;
  
  // UI
  ui: UIState;
  
  // Data
  leaveApplications: LeaveApplication[];
  leaveBalances: LeaveBalance[];
  leaveTypes: LeaveType[];
  regulations: Regulation[];
  delegationMatrix: DelegationMatrix[];
  
  // Notifications
  notifications: Notification[];
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  role: UserRole | null;
  expiresAt: Date | null;
}

interface UIState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  activeModal: string | null;
  activeDrawer: string | null;
  toast: ToastState | null;
}
```

### Context Providers

```typescript
// Context structure
<AppProvider>
  <AuthProvider>
    <LeaveDataProvider>
      <NotificationProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </NotificationProvider>
    </LeaveDataProvider>
  </AuthProvider>
</AppProvider>
```

---

## API Service Layer (Mock)

### Service Structure

```
src/services/
├── auth.service.ts
├── leave.service.ts
├── user.service.ts
├── document.service.ts
├── regulation.service.ts
├── delegation.service.ts
├── sap.service.ts
├── audit.service.ts
├── notification.service.ts
├── autogeneration.service.ts
└── index.ts
```

### Example Service Implementation

```typescript
// leave.service.ts
class LeaveService {
  // Simulate API delay
  private delay = (ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms));
  
  // Get all applications for a user
  async getApplicationsByUser(userId: string): Promise<LeaveApplication[]> {
    await this.delay(500);
    const data = localStorage.getItem(`applications_${userId}`);
    return data ? JSON.parse(data) : [];
  }
  
  // Create new application
  async createApplication(
    application: Partial<LeaveApplication>
  ): Promise<LeaveApplication> {
    await this.delay(800);
    
    const newApp: LeaveApplication = {
      applicationId: generateId(),
      status: 'Draft',
      currentStage: 'Employee',
      workflowHistory: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...application,
    } as LeaveApplication;
    
    // Save to mock storage
    this.saveApplication(newApp);
    
    return newApp;
  }
  
  // Submit application
  async submitApplication(applicationId: string): Promise<void> {
    await this.delay(600);
    
    const app = await this.getApplicationById(applicationId);
    
    app.status = 'Submitted';
    app.currentStage = 'ControllingOfficer';
    
    // Add workflow history
    app.workflowHistory.push({
      historyId: generateId(),
      applicationId,
      stage: 'Employee',
      action: 'Submitted',
      status: 'Submitted',
      actionBy: app.userId,
      actionByName: 'Current User',
      actionByRole: 'Employee',
      actionDate: new Date(),
    });
    
    this.saveApplication(app);
    
    // Trigger notification
    await notificationService.create({
      userId: app.userId,
      type: 'ApplicationSubmitted',
      message: 'Your leave application has been submitted successfully',
    });
  }
  
  // Auto-generate internal note
  async generateInternalNote(
    applicationId: string
  ): Promise<InternalNote> {
    await this.delay(1000);
    
    const app = await this.getApplicationById(applicationId);
    const user = await userService.getUserById(app.userId);
    const leaveType = await leaveTypeService.getLeaveTypeById(app.leaveTypeId);
    const balance = await this.getLeaveBalance(app.userId, app.leaveTypeId);
    const regulations = await regulationService.getByLeaveType(app.leaveTypeId);
    
    // Call auto-generation engine
    const generatedContent = await autoGenerationService.generateNote({
      application: app,
      user,
      leaveType,
      balance,
      regulations,
    });
    
    const note: InternalNote = {
      noteId: generateId(),
      applicationId,
      generatedContent,
      finalContent: generatedContent,
      generatedBy: 'current_hr_user_id',
      generatedAt: new Date(),
      isFinalized: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    localStorage.setItem(`note_${note.noteId}`, JSON.stringify(note));
    
    return note;
  }
  
  // More methods...
}

export const leaveService = new LeaveService();
```

---

## Routing Structure

```typescript
// Route definitions
const routes = {
  // Public
  '/': LoginPage,
  '/forgot-password': ForgotPasswordPage,
  
  // Employee
  '/employee/dashboard': EmployeeDashboard,
  '/employee/apply': ApplyLeaveWizard,
  '/employee/applications': MyApplicationsList,
  '/employee/applications/:id': ApplicationDetail,
  '/employee/rejoin/:id': RejoiningFlow,
  
  // CO
  '/co/dashboard': CODashboard,
  '/co/review': ReviewInbox,
  '/co/review/:id': ApplicationReview,
  '/co/calendar': TeamLeaveCalendar,
  '/co/rejoin/:id': JoiningReportAcceptance,
  
  // HR
  '/hr/dashboard': HRDashboard,
  '/hr/verify': VerificationQueue,
  '/hr/verify/:id': VerificationDetail,
  '/hr/generate-note/:id': AutoGeneratedNote,
  '/hr/generate-order/:id': AutoGeneratedOrder,
  '/hr/sap': SAPPostingTracker,
  
  // SA
  '/sa/dashboard': SADashboard,
  '/sa/sanction': SanctionInbox,
  '/sa/sanction/:id': ApplicationSummary,
  
  // Accounts
  '/accounts/dashboard': AccountsDashboard,
  '/accounts/orders': OrdersReceived,
  '/accounts/sap': SAPPostedLeaveInfo,
  
  // Admin
  '/admin/dashboard': AdminDashboard,
  '/admin/delegation': DelegationMatrixViewer,
  '/admin/regulations': LeaveRegulationsLibrary,
  '/admin/leave-types': LeaveTypeMaster,
  '/admin/rules': RuleEngineSimulator,
  '/admin/audit': AuditLogExplorer,
  '/admin/templates': OrderTemplateManager,
  
  // Common
  '/notifications': NotificationsCenter,
  '/profile': UserProfile,
  '/help': HelpCenter,
};
```

---

## Performance Optimization Strategy

### Code Splitting
- Route-based splitting
- Lazy load components
- Dynamic imports for heavy features

### Data Optimization
- Virtual scrolling for long lists
- Pagination for tables
- Debounce search inputs
- Memo expensive computations

### Asset Optimization
- Image compression
- SVG optimization
- Font subsetting
- Lazy load images

### Caching Strategy
- Cache API responses in memory
- Use localStorage for frequently accessed data
- Service worker for offline capability

---

## Security Considerations

### Input Validation
- Validate all form inputs
- Sanitize user-generated content
- File upload validation (type, size)

### Authentication & Authorization
- Mock JWT-based auth
- Role-based access control
- Protected routes
- Session timeout

### Data Protection
- No sensitive data in localStorage
- Encrypt sensitive mock data
- Clear data on logout

---

## Browser Support

### Target Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Polyfills Needed
- IntersectionObserver (for lazy loading)
- ResizeObserver (for responsive components)

---

## Deployment Architecture

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index.[hash].js
│   ├── index.[hash].css
│   ├── vendor.[hash].js
│   └── [dynamic-chunks].[hash].js
├── images/
└── fonts/
```

### Environment Configuration
```typescript
// Development
const config = {
  API_BASE_URL: 'http://localhost:3000/api',
  MOCK_ENABLED: true,
  MOCK_DELAY: 500,
};

// Production
const config = {
  API_BASE_URL: 'https://api.aptransco.in/api',
  MOCK_ENABLED: false,
  MOCK_DELAY: 0,
};
```

---

## Testing Strategy

### Unit Tests
- Component tests (React Testing Library)
- Utility function tests
- Service layer tests
- Auto-generation engine tests

### Integration Tests
- User flow tests
- Multi-role workflow tests
- Form submission tests
- Data persistence tests

### E2E Tests
- Complete leave application flow
- CO review flow
- HR verification flow
- Sanction flow
- Rejoining flow

---

## Monitoring & Logging

### Frontend Monitoring
- Error tracking (console.error)
- Performance monitoring (performance API)
- User analytics (mock)
- Audit trail logging

### Metrics to Track
- Page load time
- Component render time
- API response time (mock)
- User actions
- Error rates

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026  
**Status**: Ready for Implementation
