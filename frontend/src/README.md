# INSA Complaint Dashboard System

A dual-dashboard React application for managing complaints - one for regular users and one for administrators.

## 🏗️ Architecture Overview

### **Initial Load**
- Shows **Home Page** (መግቢያ) with two dashboard options
- No sidebars visible initially
- Users choose between User Dashboard or Admin Dashboard

### **Dashboard Types**

#### 1️⃣ **User Dashboard** (No Authentication Required)
- **Access**: Direct access, no password needed
- **Features**:
  - Submit Complaint (ጥቆማ ይስጡ)
  - Track Complaint (የጥቆማ ሂደት)
- **Sidebar**: Hidden by default, toggle with menu button (☰)
- **Home Page**: Welcome screen within dashboard

#### 2️⃣ **Admin Dashboard** (Password Protected)
- **Access**: Requires admin login credentials
- **Features**:
  - Submitted Complaints (የቀረበ ጥቆማ)
  - Reports (ሪፖርት)
- **Sidebar**: Hidden by default, toggle with menu button (☰)
- **Home Page**: Welcome screen within dashboard

## 📂 Project Structure

```
/
├── App.tsx                          # Main app with dashboard routing
├── types/
│   └── index.ts                     # TypeScript type definitions
├── services/
│   └── api.ts                       # API service layer
├── utils/
│   └── ethiopianCalendar.ts         # Ethiopian calendar utilities
├── components/
│   ├── HomePage.tsx                 # Initial landing page
│   ├── UserDashboardLayout.tsx      # User dashboard wrapper
│   ├── AdminDashboardLayout.tsx     # Admin dashboard wrapper
│   ├── Header.tsx                   # Top navigation bar (role-based)
│   ├── Sidebar.tsx                  # Side navigation (role-based)
│   ├── WelcomeScreen.tsx            # Welcome page within dashboards
│   ├── AdminLogin.tsx               # Admin authentication screen
│   ├── SubmitComplaint.tsx          # Complaint submission form
│   ├── ComplaintTracker.tsx         # Track complaint status
│   ├── SubmittedComplaints.tsx      # Admin: view all complaints
│   ├── Reports.tsx                  # Admin: analytics and reports
│   ├── VoiceRecorder.tsx            # Voice recording component
│   ├── EthiopianCalendar.tsx        # Ethiopian calendar picker
│   └── ui/                          # Shadcn UI components
└── styles/
    └── globals.css                  # Global styles and theme
```

## 🔄 User Flow

### **For Regular Users:**
1. Land on Home Page
2. Click "User Dashboard" (የተጠቃሚ ዳሽቦርድ)
3. See Welcome Screen (መግቢያ) with sidebar hidden
4. Click menu button (☰) to show/hide sidebar
5. Navigate to:
   - Submit Complaint
   - Track Complaint

### **For Administrators:**
1. Land on Home Page
2. Click "Admin Dashboard" (የአስተዳዳሪ ዳሽቦርድ)
3. Enter admin credentials (username + password)
4. See Welcome Screen (መግቢያ) with sidebar hidden
5. Click menu button (☰) to show/hide sidebar
6. Navigate to:
   - Submitted Complaints
   - Reports

## 🎨 Features

### **Header (Both Dashboards)**
- Logo (INSA)
- System title
- Role badge (User/Admin)
- Language toggle (English ↔ አማርኛ)
- Theme toggle (Light ↔ Dark)
- Menu toggle button (☰)
- Back to Home button

### **Sidebar (Both Dashboards)**
- Hidden by default
- Toggle-able via menu button
- Role-specific menu items
- Active page highlighting
- Responsive design

### **Home Page Within Dashboards**
- Welcome message
- INSA logo
- System description
- Feature cards (Secure, Fast, Transparent)
- Instructions to use menu button

## 🔐 Authentication

### **User Dashboard**
- ✅ No authentication required
- Direct access to all user features

### **Admin Dashboard**
- 🔒 Password-protected
- Login screen shown before dashboard access
- User data stored in localStorage
- JWT token management
- Automatic logout on session end

## 🌍 Localization

### **Supported Languages**
- English (en)
- Amharic (አማርኛ) (am)

### **Language Toggle**
- Available in header
- Persists in localStorage
- Updates all UI text dynamically

## 🎨 Theming

### **Supported Themes**
- Light mode
- Dark mode

### **Theme Toggle**
- Available in header
- Persists in localStorage
- Smooth transitions

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
npm install
```

### **2. Configure API**
Update `/services/api.ts` with your backend API URL:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-url.com/api';
```

### **3. Run Development Server**
```bash
npm run dev
```

### **4. Build for Production**
```bash
npm run build
```

## 📝 Implementation Notes

### **Complete Component Implementation**

The following components are provided as simplified placeholders and should be replaced with the full implementations from the provided code:

1. **SubmitComplaint.tsx**
   - Full form with validation
   - File upload functionality
   - Voice recording
   - Ethiopian calendar integration
   - Success tracking number display

2. **SubmittedComplaints.tsx**
   - Admin authentication check
   - Full complaints table
   - Status management
   - Response functionality
   - File attachments viewer

3. **Reports.tsx**
   - Charts and graphs (Bar, Pie)
   - Department summaries
   - Status breakdowns
   - Export to PDF/Excel
   - Filtering and pagination

To implement these, copy the full code from the user's provided code into each respective file.

### **Environment Variables**

Create a `.env` file:
```env
VITE_API_BASE_URL=https://your-api-url.com/api
```

### **Assets**

Make sure the following asset is available:
- Logo: `figma:asset/63cd11a2364ac3c81ed9a475fd20bfed5b1c9297.png`

## 🔧 Customization

### **Adding New Menu Items**

**For User Dashboard:**
Edit `/components/Sidebar.tsx` - `userMenuItems` array

**For Admin Dashboard:**
Edit `/components/Sidebar.tsx` - `adminMenuItems` array

### **Changing Texts**

All text content is stored in translation objects (`t`) within each component.

### **Styling**

- Global styles: `/styles/globals.css`
- Component styles: Tailwind CSS classes
- Theme variables: CSS custom properties in globals.css

## 📱 Responsive Design

- **Mobile**: Sidebar overlays content, hidden by default
- **Tablet**: Sidebar toggleable, adjusts content area
- **Desktop**: Sidebar toggleable, smooth transitions

## 🔒 Security Features

- Admin authentication required
- JWT token management
- Role-based access control (RBAC)
- Secure API communication
- Session management

## 🌟 Best Practices

1. **Code Organization**: Components are separated by role and feature
2. **Type Safety**: Full TypeScript support
3. **Accessibility**: ARIA labels and semantic HTML
4. **Performance**: Code splitting and lazy loading ready
5. **Maintainability**: Clear separation of concerns

## 📞 Support

For issues or questions, please contact the development team.

---

**Information Network Security Administration**  
የመረጃ አውታረ መረብ ደህንነት አስተዳደር
