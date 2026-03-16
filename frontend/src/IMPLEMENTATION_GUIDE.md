# Implementation Guide - INSA Complaint Dashboard

## 🎯 Quick Start

This guide explains how to complete the implementation of the INSA Complaint Dashboard system.

## ✅ What's Already Done

### Core Structure ✓
- [x] Main App.tsx with dashboard routing
- [x] HomePage with dashboard selection
- [x] UserDashboardLayout
- [x] AdminDashboardLayout
- [x] Role-based Header component
- [x] Role-based Sidebar component
- [x] WelcomeScreen for both dashboards
- [x] AdminLogin authentication
- [x] API service layer
- [x] Type definitions
- [x] Ethiopian calendar utilities

### Helper Components ✓
- [x] VoiceRecorder
- [x] EthiopianCalendar
- [x] ComplaintTracker (simplified)

## 🔨 What Needs to Be Completed

### 1. SubmitComplaint Component
**File**: `/components/SubmitComplaint.tsx`

**Current Status**: Placeholder component

**What to Do**:
Replace the entire content of `/components/SubmitComplaint.tsx` with the full implementation from the user's provided code. The complete version includes:

- Form validation with error messages
- Multiple form sections:
  - Complaint Details
  - Responsible Entity Information
  - Incident Details
  - Evidence Upload (files + voice)
  - Complainant Information
- Ethiopian Calendar integration for date selection
- File upload with validation (PDF, images, videos)
- Voice recording functionality
- Success message with tracking number
- Copy tracking number feature
- Submit another complaint option

**Key Features to Include**:
```typescript
// Form state management
const [typeId, setTypeId] = useState<number | null>(null);
const [executionStatus, setExecutionStatus] = useState<string | null>(null);
const [incidentDate, setIncidentDate] = useState<Date | undefined>();
const [voiceFiles, setVoiceFiles] = useState<File[]>([]);
const [otherFiles, setOtherFiles] = useState<File[]>([]);
const [errors, setErrors] = useState<Record<string, string | null>>({});
const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

// Validation functions
function validateField(field: string, value: string | null | undefined) { ... }
function validateAll(): Record<string, string | null> { ... }

// Submit handler
const handleSubmit = async (e: React.FormEvent) => { ... };
```

### 2. SubmittedComplaints Component
**File**: `/components/SubmittedComplaints.tsx`

**Current Status**: Placeholder component

**What to Do**:
Replace the entire content with the full admin complaints management system. The complete version includes:

- Full complaints data table with columns:
  - No., Full Name, Complaint Type, Job Title, Department
  - Status, Execution Status, Damage/Loss
  - Additional Details, Responsible Entity
  - Location, Date Occurred, Complainant Info, Actions
- Admin response dialog with:
  - Evidence/attachments viewer
  - Response text area
  - Status dropdown with icons
  - Save functionality
- Status color coding:
  - NEW (blue) - for submitted/new complaints
  - In Review (yellow)
  - Investigating (purple)
  - Resolved (green)
  - Rejected (red)
  - Closed (gray)
- File attachments with type icons:
  - Voice (purple)
  - Video (red)
  - Image (green)
  - Document (blue)

**Key Features to Include**:
```typescript
// Admin authentication check
const [user, setUser] = useState<any>(getCurrentUser());
const [isLoggedIn, setIsLoggedIn] = useState(!!user);

// Data management
const [complaints, setComplaints] = useState<any[]>([]);
const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

// Response handling
async function handleRespond() {
  await adminRespond(
    selectedComplaint.trackingNumber,
    newStatusId,
    responseText
  );
  loadComplaints();
}
```

### 3. Reports Component
**File**: `/components/Reports.tsx`

**Current Status**: Placeholder component

**What to Do**:
Replace the entire content with the full reports and analytics system. The complete version includes:

- Status summary cards (clickable filters)
- Chart views:
  - Bar chart for status distribution
  - Pie chart for proportional view
  - Stacked bar chart for department comparison (admin only)
- Department summary table with:
  - Pagination
  - Search functionality
  - All status columns
  - Total counts
- Export features:
  - Print (browser print)
  - Export to PDF (jsPDF + html2canvas)
  - Export to Excel (xlsx)
- View switching:
  - Bar Chart View
  - Pie Chart View
  - Table View
  - Summary Comparison (admin only)

**Key Features to Include**:
```typescript
// Required imports
import { BarChart, Bar, PieChart, Pie, ResponsiveContainer, ... } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Data management
const [statusSummary, setStatusSummary] = useState<Record<string, number>>({});
const [deptSummary, setDeptSummary] = useState<any[]>([]);
const [activeStatusFilter, setActiveStatusFilter] = useState<StatusKey | 'all'>('all');

// Export functions
const handleExportPDF = async () => { ... };
const handleExportExcel = () => { ... };
```

## 📦 Required NPM Packages

Make sure these packages are installed:

```bash
npm install recharts jspdf html2canvas xlsx date-fns sonner
```

## 🔧 Configuration Steps

### 1. API Configuration
Edit `/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-backend-api.com/api';
```

### 2. Environment Variables
Create `.env` file:
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### 3. Asset Configuration
Ensure the INSA logo asset is available:
```typescript
import insaLogo from 'figma:asset/63cd11a2364ac3c81ed9a475fd20bfed5b1c9297.png';
```

## 🎨 Styling Guidelines

### Color Scheme
- Primary Blue: `#2563eb` (blue-600)
- Success Green: `#10b981` (green-500)
- Warning Yellow: `#f59e0b` (yellow-500)
- Error Red: `#ef4444` (red-500)
- Dark Background: Slate colors

### Component Styling
- Use Tailwind CSS classes
- Follow dark mode patterns: `dark:bg-slate-800`
- Maintain consistent spacing and shadows
- Use `transition-all duration-300` for smooth animations

## 🧪 Testing Checklist

### User Dashboard
- [ ] Access without login
- [ ] Submit complaint form works
- [ ] Track complaint by ID works
- [ ] File upload (PDF, images, videos) works
- [ ] Voice recording works
- [ ] Ethiopian calendar date selection works
- [ ] Tracking number copy works
- [ ] Language toggle works (English ↔ Amharic)
- [ ] Theme toggle works (Light ↔ Dark)
- [ ] Sidebar toggle works
- [ ] Mobile responsive

### Admin Dashboard
- [ ] Login required
- [ ] Incorrect credentials rejected
- [ ] View all complaints works
- [ ] Filter complaints by status works
- [ ] Respond to complaints works
- [ ] Update complaint status works
- [ ] View attachments works
- [ ] Reports charts display correctly
- [ ] Export to PDF works
- [ ] Export to Excel works
- [ ] Department filtering works
- [ ] Search works
- [ ] Pagination works
- [ ] Language toggle works
- [ ] Theme toggle works
- [ ] Sidebar toggle works
- [ ] Mobile responsive
- [ ] Logout works

## 🐛 Common Issues & Solutions

### Issue: API calls fail
**Solution**: Check `API_BASE_URL` in `/services/api.ts` and ensure backend is running

### Issue: Login doesn't work
**Solution**: Verify backend returns user object with `role: 'ADMIN'`

### Issue: Ethiopian calendar not showing
**Solution**: Import and use `<EthiopianCalendar>` component correctly

### Issue: File uploads fail
**Solution**: Check file size limits and MIME types in validation

### Issue: Charts not displaying
**Solution**: Install `recharts` package: `npm install recharts`

### Issue: PDF export fails
**Solution**: Install required packages: `npm install jspdf html2canvas`

## 📱 Responsive Design Breakpoints

```css
/* Mobile First */
default: < 640px
sm: 640px  /* Small tablets */
md: 768px  /* Tablets */
lg: 1024px /* Desktops */
xl: 1280px /* Large desktops */
```

## 🔒 Security Considerations

1. **API Tokens**: Store JWT tokens in localStorage
2. **Role Validation**: Check user role on every admin action
3. **Input Sanitization**: Validate all user inputs
4. **File Upload**: Restrict file types and sizes
5. **HTTPS**: Use HTTPS in production

## 📝 Code Quality

### TypeScript Best Practices
- Use proper types from `/types/index.ts`
- Avoid `any` type when possible
- Use interfaces for props

### Component Best Practices
- Keep components focused on single responsibility
- Extract reusable logic to hooks
- Use meaningful variable names
- Add comments for complex logic

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
- Set `VITE_API_BASE_URL` to production API
- Configure proper CORS settings
- Use environment-specific configs

## 📞 Next Steps

1. ✅ Review current implementation
2. 🔨 Complete the 3 main components (Submit, Submitted, Reports)
3. 🧪 Test all features thoroughly
4. 🎨 Adjust styling to match exact requirements
5. 🔒 Add additional security measures
6. 📱 Test on multiple devices
7. 🚀 Deploy to production

---

**Note**: The provided structure gives you a complete foundation. The main work is copying the full implementations from the user's provided code into the 3 placeholder components.

Good luck with your implementation! 🎉
