# APTRANSCO Leave Sanction Module - Quick Start Guide

## 🚀 Getting Started

### Access the Application
The Vite development server should already be running. Open your browser to the preview URL.

### Login to Test
Use any of these demo accounts:

| Role | Username | Password |
|------|----------|----------|
| **Employee** | emp001 | demo123 |
| **Controlling Officer** | co001 | demo123 |
| **HR Officer** | hr001 | demo123 |
| **Sanction Authority** | sa001 | demo123 |
| **Accounts** | acc001 | demo123 |
| **Admin** | admin001 | demo123 |

---

## 📱 What's Working Now (Phase 1)

### ✅ Authentication
- Login/Logout
- Session persistence
- Role-based access
- Protected routes

### ✅ Dashboards
- **Employee**: Full dashboard with leave balances
- **CO**: Placeholder dashboard
- **HR**: Placeholder dashboard  
- **SA**: Placeholder dashboard
- **Accounts**: Placeholder dashboard
- **Admin**: Placeholder dashboard

### ✅ Employee Features (Fully Functional)
- View leave balances (EL, HPL, CL, Casual)
- See application statistics
- Dashboard navigation

---

## 🗂️ Project Structure

```
src/app/
├── App.tsx                    # Main app + routing
├── components/
│   ├── ProtectedRoute.tsx     # Auth guard
│   └── ui/                    # Reusable components
├── context/
│   └── AuthContext.tsx        # Auth state management
├── pages/
│   ├── LoginPage.tsx          # Login screen
│   ├── DashboardRouter.tsx    # Role-based routing
│   └── employee/
│       └── EmployeeDashboard.tsx
├── services/
│   ├── mockData.ts            # Demo data
│   ├── auth.service.ts        # Auth logic
│   └── leave.service.ts       # Leave operations
└── types/
    └── index.ts               # TypeScript types
```

---

## 🔧 Development Guide

### Adding a New Page
1. Create component in `src/app/pages/[role]/`
2. Import in `DashboardRouter.tsx` or `App.tsx`
3. Add route in routing configuration

### Using Mock Data
```typescript
import { leaveService } from '../services/leave.service';

// Get leave balances
const balances = await leaveService.getLeaveBalances(userId);

// Get applications
const apps = await leaveService.getApplicationsByUser(userId);

// Check eligibility
const result = await leaveService.checkEligibility(userId, leaveTypeId, days);
```

### Using Auth Context
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, role, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <p>Role: {role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 📊 Available Mock Data

### Leave Types (12 types)
- Earned Leave (EL)
- Half Pay Leave (HPL)
- Commuted Leave (CL)
- Medical Leave (HPL-MED)
- Casual Leave
- Special Casual Leave
- Maternity Leave
- Paternity Leave
- Child Care Leave
- Study Leave
- Extraordinary Leave
- Special Disability Leave

### Users (11 accounts)
- 3 Employees (emp001-003)
- 2 COs (co001-002)
- 2 HR (hr001-002)
- 2 SA (sa001-002)
- 1 Accounts (acc001)
- 1 Admin (admin001)

### Leave Balances
Available for employees emp001 and emp002:
- EL: 63 days available
- HPL: 50 days available
- Casual: 7 days available

---

## 🎨 Design System

### Colors
```css
Primary: #1e3a8a (Government Blue)
Success: #16a34a (Green)
Warning: #ea580c (Orange)
Destructive: #dc2626 (Red)
Muted: #f8fafc (Light Gray)
```

### Components Available
All shadcn/ui components are available:
- Button, Card, Input, Label
- Alert, Badge, Dialog, Drawer
- Table, Tabs, Select, Checkbox
- And 40+ more components

### Usage Example
```typescript
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Click Me</Button>
  </CardContent>
</Card>
```

---

## 🧪 Testing Flows

### Test Authentication
1. Go to `/login`
2. Click "Employee" quick login
3. Should redirect to `/dashboard`
4. Should see employee dashboard with data
5. Click logout
6. Should return to login page

### Test Role Switching
1. Login as Employee (emp001)
2. See employee dashboard
3. Logout
4. Login as HR (hr001)
5. See HR dashboard
6. Verify different content

### Test Protected Routes
1. Logout (if logged in)
2. Try to access `/dashboard` directly
3. Should redirect to `/login`
4. Login
5. Should redirect to `/dashboard`

---

## 🚦 Phase Status

### ✅ Phase 1 - COMPLETE
- Authentication
- Routing
- Dashboards (all roles)
- Mock data architecture
- Design system

### 🔄 Phase 2 - NEXT (Week 2)
- Employee leave application wizard
- Leave type selection
- Date picker
- Document upload
- Regulation validation
- My applications list

---

## 📝 Common Tasks

### Add a New Service Method
File: `src/app/services/leave.service.ts`

```typescript
async myNewMethod(param: string): Promise<ReturnType> {
  await this.delay(); // Simulate API delay
  
  // Your logic here
  
  return result;
}
```

### Add a New Type
File: `src/app/types/index.ts`

```typescript
export interface MyNewType {
  id: string;
  name: string;
  createdAt: string;
}
```

### Add a New Demo User
File: `src/app/services/mockData.ts`

```typescript
{
  userId: 'emp004',
  employeeId: 'APTC-EMP-004',
  name: 'New Employee',
  // ... other fields
}
```

---

## 🐛 Troubleshooting

### Login Not Working
- Check username is correct (e.g., emp001, not EMP001)
- Password is always `demo123`
- Check browser console for errors

### Data Not Loading
- All data operations have mock delays (300-800ms)
- Check browser console for errors
- Verify localStorage is enabled

### Dashboard Not Showing
- Verify user is logged in
- Check auth context is providing user data
- Verify role matches expected dashboard

---

## 📚 Documentation

- **PHASE_WISE_DESIGN_PLAN.md** - Complete 7-phase plan
- **IMPLEMENTATION_ROADMAP.md** - Timeline and milestones
- **TECHNICAL_ARCHITECTURE.md** - System architecture
- **PHASE_1_COMPLETED.md** - Phase 1 summary

---

## 🎯 Next Steps

1. **Review Phase 1** - Test all functionality
2. **Plan Phase 2** - Employee module implementation
3. **Create Components** - Leave application wizard
4. **Implement Validation** - Regulation-aware logic
5. **Test Flows** - End-to-end testing

---

## 💡 Tips

- All services return Promises (use async/await)
- Mock delays simulate real API behavior
- localStorage persists data between sessions
- Use `useAuth()` hook for current user
- All dates are ISO strings
- TypeScript types enforce data structure

---

## 🔗 Key Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main routing |
| `AuthContext.tsx` | Auth state |
| `mockData.ts` | Seed data |
| `leave.service.ts` | Leave operations |
| `types/index.ts` | All types |
| `theme.css` | Design tokens |

---

**Happy Coding! 🚀**

Ready to build Phase 2? Check **PHASE_WISE_DESIGN_PLAN.md** for details.
