# APTRANSCO Leave Sanction Application

A comprehensive mobile-first leave management system for APTRANSCO with complete workflow automation, auto-generation capabilities, and role-based access control.

## Features

### Phase 1-5: Core Functionality
- ✅ **Multi-role Authentication**: Employee, Controlling Officer, HR, Sanction Authority, Accounts, Admin
- ✅ **Leave Application Workflow**: Complete 6-step wizard with validation
- ✅ **CO Review Module**: Review and forward/return applications
- ✅ **HR Verification Module**: Balance verification with auto-generated internal notes
- ✅ **Sanction Authority Module**: Auto-generated draft sanction orders
- ✅ **Accounts Module**: SAP posting and financial tracking
- ✅ **Admin Dashboard**: 6 administrative modules for system management

### Phase 6: Advanced Features (100% Complete)
- ✅ **Real-time Notifications**: Bell icon with unread count and notification list
- ✅ **Bulk Operations**: Select multiple applications and perform batch actions
  - Bulk forward (CO)
  - Bulk verify & forward (HR)
  - Bulk sanction/reject (SA)
- ✅ **Timeline Visualization**: Visual workflow history with color-coded actions
- ✅ **Dashboard Widgets**: Reusable KPI cards with trends
- ✅ **Reports & Analytics**: Comprehensive analytics dashboard with charts
- ✅ **Print & Export**: Print applications and export to CSV

### Phase 7: Testing & Polish (In Progress)
- ✅ **Critical Bug Fixes**:
  - Fixed field name mismatch in mock data (userId, leaveFromDate, reasonForLeave, etc.)
  - Updated all components to use correct field names (SanctionDetail, HRVerificationDetail, AccountsDetail, printExport)
  - Fixed workflow history structure to match TypeScript interface
  - Fixed autogeneration service to use correct API
  - Removed duplicate function implementations
- ⏳ **End-to-end Testing**: Manual testing of complete workflows
- ⏳ **Final Polish**: UI/UX improvements

## Test Credentials

All users have the same password: `demo123`

### Available Users (use userId as username):

| Role | Username | Name |
|------|----------|------|
| **Employee** | `emp001` | Ravi Kumar |
| **Employee** | `emp002` | Priya Sharma |
| **Employee** | `emp003` | Anil Reddy |
| **Controlling Officer** | `co001` | Ramesh Babu |
| **Controlling Officer** | `co002` | Lakshmi Devi |
| **HR** | `hr001` | Suresh Reddy |
| **HR** | `hr002` | Anitha Kumari |
| **Sanction Authority** | `sa001` | V. Krishnamurthy |
| **Sanction Authority** | `sa002` | P. Venkateswara Rao |
| **Accounts** | `acc001` | Madhavi Latha |
| **Admin** | `admin001` | System Administrator |

## Testing Workflow

### Complete End-to-End Test:
1. **Login as Employee** (`emp001` / `demo123`)
   - Apply for leave using the 6-step wizard
   - View "My Applications" to see submitted applications

2. **Login as CO** (`co001` / `demo123`)
   - Review pending applications in inbox
   - Test single forward or bulk operations
   - Applications move to HR queue

3. **Login as HR** (`hr001` / `demo123`)
   - Verify applications in verification queue
   - Review auto-generated internal notes
   - Test bulk verify & forward to SA

4. **Login as SA** (`sa001` / `demo123`)
   - Review applications in sanction inbox
   - View auto-generated draft orders
   - Test bulk sanction/reject

5. **Login as Accounts** (`acc001` / `demo123`)
   - View sanctioned applications in SAP queue
   - Post to SAP with transaction details

6. **Login as Admin** (`admin001` / `demo123`)
   - Access all 6 admin modules
   - View reports & analytics
   - Explore delegation matrix, regulations, templates

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12
- **Forms**: React Hook Form 7.55.0
- **Date Handling**: date-fns 3.6.0
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)
- **State Management**: Context API
- **Routing**: Custom client-side routing (Figma Make compatible)
- **Data**: localStorage with mock data persistence

## Key Features

### Auto-Generation Engine
- **Internal Notes**: Automatically generated with balance verification, eligibility check, and recommendations
- **Sanction Orders**: 100+ line official government orders with APTRANSCO header, employee details, balance breakdown, and distribution list

### Bulk Operations
- Checkbox selection on all inbox pages
- Floating action toolbar when items selected
- Confirmation dialogs with application summaries
- Workflow history updates for all affected applications

### Timeline Visualization
- Color-coded action icons
- Role badges with department colors
- Relative timestamps ("2 hours ago")
- Status transition indicators
- Current status pulse animation

### Reports & Analytics
- Leave type distribution charts
- Department-wise statistics
- Monthly trend visualization
- Key insights and observations
- Export to CSV functionality

## Mock Data

The application includes:
- 11 demo users across 6 roles
- 12 leave types (EL, HPL, CL, Medical, etc.)
- 6 leave applications in various statuses
- Leave balances for all employees
- Complete workflow history
- 15+ regulations and delegation rules

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components
│   │   ├── BulkActionToolbar.tsx
│   │   ├── BulkActionDialog.tsx
│   │   ├── ApplicationTimeline.tsx
│   │   ├── DashboardWidget.tsx
│   │   └── NotificationBell.tsx
│   ├── context/         # React Context (Auth)
│   ├── hooks/           # Custom hooks (navigation)
│   ├── pages/           # All page components
│   │   ├── employee/    # Employee module
│   │   ├── co/          # CO module
│   │   ├── hr/          # HR module
│   │   ├── sa/          # SA module
│   │   ├── accounts/    # Accounts module
│   │   └── admin/       # Admin modules
│   ├── services/        # Business logic & data
│   │   ├── mockData.ts
│   │   ├── autogeneration.service.ts
│   │   └── notification.service.ts
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utility functions
└── styles/              # Global styles & theme
```

## Development Notes

### Important Constraints
- This is a Figma Make project - **DO NOT** run `vite build` or `npm run build`
- The dev server is already running in the preview
- Use custom routing (NOT react-router)
- Main component must be `src/app/App.tsx` with default export

### Code Quality
- Full TypeScript with strict typing
- Government enterprise blue theme (#1e3a8a)
- Mobile-first responsive design
- Comprehensive form validation
- Session-based leave calculation (Forenoon/Afternoon)

## Status

**Phase 1-6**: ✅ Complete (100%)  
**Phase 7**: 🔄 In Progress (80% - Testing & final polish remaining)

---

Built for APTRANSCO • Powered by React + Tailwind CSS • Phase 6 Complete
