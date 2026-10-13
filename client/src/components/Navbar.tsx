import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import {
  Compass,
  PlusCircle,
  CheckSquare,
  QrCode,
  Ticket,
  Bell,
  Menu,
  X,
  LogOut,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, location.pathname]);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      // ignore silently if not logged in
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#E8E5DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#174C3C] flex items-center justify-center text-[#F4C95D] shadow-sm group-hover:scale-105 transition-transform border border-[#27866A]/30">
              <span className="font-extrabold text-xl tracking-tighter">CP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#174C3C] flex items-center gap-1.5">
                CampusPulse
                <span className="inline-block w-2 h-2 rounded-full bg-[#FF6B4A]"></span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#73796F]">
                SYNESIS '26 Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/events"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/events')
                  ? 'bg-[#174C3C] text-white'
                  : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
              }`}
            >
              <Compass className="w-4 h-4 text-[#27866A]" />
              Discover Events
            </Link>

            <Link
              to="/host"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/host')
                  ? 'bg-[#174C3C] text-white'
                  : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
              Host an Event
            </Link>

            {/* Authenticated Role-based Links */}
            {user && (
              <>
                {/* Student links */}
                <Link
                  to="/my-registrations"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/my-registrations')
                      ? 'bg-[#174C3C] text-white'
                      : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-[#27866A]" />
                  My Tickets
                </Link>

                {/* Organizer links */}
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    <Link
                      to="/host/create"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/host/create')
                          ? 'bg-[#174C3C] text-white'
                          : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-[#FF6B4A]" />
                      Create Event
                    </Link>
                  </>
                )}

                {/* Approver / Admin links */}
                {(user.role === 'approver' || user.role === 'admin') && (
                  <Link
                    to="/approvals"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/approvals')
                        ? 'bg-[#174C3C] text-white'
                        : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-[#D99B16]" />
                    Approvals
                  </Link>
                )}

                {/* Check-in Interface */}
                {(user.role === 'organizer' || user.role === 'approver' || user.role === 'admin') && (
                  <Link
                    to="/check-in"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/check-in')
                        ? 'bg-[#174C3C] text-white'
                        : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#27866A]" />
                    QR Check-in
                  </Link>
                )}

                {/* Dynamic Role Dashboard Link */}
                <Link
                  to={
                    user.role === 'admin'
                      ? '/dashboard/admin'
                      : user.role === 'organizer'
                      ? '/dashboard/organizer'
                      : '/dashboard/student'
                  }
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-[#174C3C] text-white'
                      : 'text-[#202923] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#F4C95D]" />
                  Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-lg text-[#73796F] hover:text-[#174C3C] hover:bg-[#E8E5DC]/50 relative transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6B4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E8E5DC] py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#E8E5DC] flex items-center justify-between">
                        <span className="font-bold text-sm text-[#174C3C]">Notifications</span>
                        <span className="text-xs text-[#73796F]">{unreadCount} unread</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-[#E8E5DC]/60">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#73796F]">No notifications yet</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkRead(n.id)}
                              className={`p-3 text-xs cursor-pointer hover:bg-[#FAF8F2] transition-colors ${
                                n.is_read ? 'opacity-70' : 'bg-[#FAF8F2]/60 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[#174C3C] font-semibold mb-1">
                                <span>{n.title}</span>
                                {!n.is_read && <span className="w-2 h-2 rounded-full bg-[#FF6B4A]"></span>}
                              </div>
                              <p className="text-[#73796F] leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-[#73796F]/70 mt-1 block">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Capsule */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#E8E5DC]">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#174C3C] leading-tight">{user.name}</div>
                    <div className="text-[10px] uppercase font-semibold text-[#FF6B4A] tracking-wider">
                      {user.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-[#73796F] hover:text-[#FF6B4A] hover:bg-[#FF6B4A]/10 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-[#174C3C] hover:text-[#27866A] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#174C3C] hover:bg-[#133E31] rounded-lg shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#202923] hover:bg-[#E8E5DC]/50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E8E5DC] px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
          >
            Discover Events
          </Link>
          <Link
            to="/host"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
          >
            Host an Event
          </Link>

          {user && (
            <>
              <Link
                to="/my-registrations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
              >
                My Registrations & Tickets
              </Link>
              <Link
                to={
                  user.role === 'admin'
                    ? '/dashboard/admin'
                    : user.role === 'organizer'
                    ? '/dashboard/organizer'
                    : '/dashboard/student'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
              >
                Dashboard ({user.role})
              </Link>
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link
                  to="/host/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
                >
                  Create Event
                </Link>
              )}
              {(user.role === 'approver' || user.role === 'admin') && (
                <Link
                  to="/approvals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
                >
                  Approvals Queue
                </Link>
              )}
              {(user.role === 'organizer' || user.role === 'approver' || user.role === 'admin') && (
                <Link
                  to="/check-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-[#202923] hover:bg-[#FAF8F2]"
                >
                  QR Check-in Scanner
                </Link>
              )}
              <div className="pt-4 border-t border-[#E8E5DC] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#174C3C]">{user.name}</div>
                  <div className="text-xs text-[#73796F]">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-[#FF6B4A] border border-[#FF6B4A]/30 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          {!user && (
            <div className="pt-4 border-t border-[#E8E5DC] grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-[#174C3C] border border-[#174C3C] rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-white bg-[#174C3C] rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
