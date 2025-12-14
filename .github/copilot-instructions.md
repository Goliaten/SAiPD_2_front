# Frontend Development

This directory contains the React/TypeScript frontend for SAiPD.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Features Implemented

### Core
- ✅ Login page with form validation
- ✅ Protected routes (redirect to login if not authenticated)
- ✅ Dashboard with navigation sidebar
- ✅ Navbar with logout functionality

### User Management
- ✅ UI skeleton for user list and creation
- ⏳ Connect to backend API
- ⏳ List users with filtering (active/inactive, role, class)
- ⏳ Create new users
- ⏳ Edit user information
- ⏳ Deactivate users
- ⏳ Assign/remove roles

### Role Management
- ⏳ Create roles
- ⏳ Deactivate roles
- ⏳ Modify role permissions

### Class Management
- ⏳ Create classes with date validation
- ⏳ Deactivate classes
- ⏳ Assign users to classes
- ⏳ Manage class exercises

### Exercise Management
- ⏳ Create exercises
- ⏳ Update exercises
- ⏳ Delete exercises
- ⏳ Assign to classes

### Additional Features
- ⏳ Attendance system
- ⏳ Grading system
- ⏳ Messaging system
- ⏳ Task system

## Notes

- The frontend connects to the backend at `http://localhost:8000`
- Authentication is stored in localStorage
- For demo purposes, any login creates a new user in the backend
- Tailwind CSS is used for styling
