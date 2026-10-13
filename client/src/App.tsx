import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DemoAccountSwitcher } from './components/DemoAccountSwitcher';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HostIntroPage } from './pages/HostIntroPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { ApprovalDashboardPage } from './pages/ApprovalDashboardPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { CheckInPage } from './pages/CheckInPage';
import { UserRole } from './types';

// Role-Guard Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-[#73796F] text-sm">
        <div className="w-8 h-8 border-3 border-[#174C3C] border-t-transparent rounded-full animate-spin mr-3" />
        Checking authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user.role !== 'admin' && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-[#FF6B4A]/40 text-center space-y-4">
        <div className="w-12 h-12 bg-[#FF6B4A]/10 text-[#FF6B4A] rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">
          !
        </div>
        <h2 className="text-xl font-extrabold text-[#202923]">Access Restricted</h2>
        <p className="text-xs text-[#73796F] leading-relaxed">
          This section requires one of roles: [{allowedRoles.join(', ')}]. Your current role is <strong>{user.role}</strong>.
        </p>
        <p className="text-xs text-[#174C3C] font-semibold">
          💡 You can use the top demo bar to switch your role to an authorized account.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-[#202923] selection:bg-[#F4C95D] selection:text-[#174C3C]">
          {/* Demo account switcher banner for seamless hackathon testing */}
          <DemoAccountSwitcher />

          {/* Navigation */}
          <Navbar />

          {/* Main App Content Area */}
          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/host" element={<HostIntroPage />} />

              {/* Protected Student Pages */}
              <Route
                path="/my-registrations"
                element={
                  <ProtectedRoute>
                    <MyRegistrationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Organizer Pages */}
              <Route
                path="/host/create"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/organizer"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Approver / Admin Pages */}
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={['approver', 'admin']}>
                    <ApprovalDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Check-In Interface */}
              <Route
                path="/check-in"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'approver', 'admin']}>
                    <CheckInPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
