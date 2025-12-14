# SAiPD Frontend

A React + TypeScript frontend for the SAiPD (Learning Progress Tracking) system.

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Features

- **Login**: Secure authentication with login/password
- **Dashboard**: Unified interface for all management features
- **User Management**: Create, edit, deactivate users; manage roles
- **Role Management**: Create roles, assign permissions
- **Class Management**: Create classes, assign users, manage exercises
- **Exercise Management**: Create and manage exercises
- **Attendance**: Track student attendance
- **Grading**: Assign grades to students
- **Messages**: Internal messaging system
- **Tasks**: Task assignment and tracking

## Architecture

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`. API endpoints are configured in `src/api.ts`.

## Project Structure

```
src/
├── api.ts                 # API client and endpoints
├── store.ts              # Zustand store for auth state
├── App.tsx               # Main app component with routes
├── index.css             # Tailwind styles
├── components/
│   ├── Navbar.tsx        # Navigation bar
│   └── ProtectedRoute.tsx # Route protection wrapper
├── pages/
│   ├── LoginPage.tsx     # Login form
│   └── DashboardPage.tsx # Main dashboard
└── main.tsx              # React DOM entry point
```

## Environment

Set the API base URL in `src/api.ts`:

```typescript
const API_BASE = 'http://localhost:8000';
```

For production, update this to point to your backend server.
