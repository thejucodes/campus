import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Calendar,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  PieChart as PieIcon,
  QrCode,
  ArrowRight,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const OrganizerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getOrganizerAnalytics(false);
      setMetrics(data.metrics || {});
      setRecentEvents(data.recentEvents || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
      setTrends(data.registrationTrends || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Color sequence for chart bars (Strictly within forest green, emerald, coral, gold)
  const PALETTE_COLORS = ['#174C3C', '#27866A', '#FF6B4A', '#F4C95D', '#D99B16', '#202923'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B4A] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FF6B4A]" />
            Organizer Command Center
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            {user?.organization || 'Club Events'} Dashboard
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            Real-time database metrics on event submissions, registrations, gate attendance, and scheduling status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/check-in"
            className="px-4 py-2.5 rounded-xl border border-[#27866A] text-[#27866A] hover:bg-[#27866A]/10 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Gate Scanner</span>
          </Link>

          <Link
            to="/host/create"
            className="px-5 py-2.5 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#F4C95D]" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* Real Statistics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Events */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#73796F]">
            Events Created
          </span>
          <div className="text-2xl font-extrabold text-[#202923] mt-1">
            {metrics?.totalEvents || 0}
          </div>
          <span className="text-[10px] text-[#73796F] mt-0.5 block">Total drafts & live</span>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A07010]">
            Awaiting Approval
          </span>
          <div className="text-2xl font-extrabold text-[#D99B16] mt-1">
            {metrics?.pendingApproval || 0}
          </div>
          <span className="text-[10px] text-[#73796F] mt-0.5 block">Faculty review queue</span>
        </div>

        {/* Approved Upcoming */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#174C3C]">
            Live Upcoming
          </span>
          <div className="text-2xl font-extrabold text-[#174C3C] mt-1">
            {metrics?.approvedUpcoming || 0}
          </div>
          <span className="text-[10px] text-[#27866A] mt-0.5 block">Open for booking</span>
        </div>

        {/* Total Registrations */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#73796F]">
            Total Registrations
          </span>
          <div className="text-2xl font-extrabold text-[#202923] mt-1">
            {metrics?.totalRegistrations || 0}
          </div>
          <span className="text-[10px] text-[#73796F] mt-0.5 block">Students reserved</span>
        </div>

        {/* Checked In */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#27866A]">
            Checked In
          </span>
          <div className="text-2xl font-extrabold text-[#27866A] mt-1">
            {metrics?.totalCheckedIn || 0}
          </div>
          <span className="text-[10px] text-[#27866A] mt-0.5 block">Scanned at gate</span>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
            Turnout Rate
          </span>
          <div className="text-2xl font-extrabold text-[#FF6B4A] mt-1">
            {metrics?.attendanceRate || 0}%
          </div>
          <span className="text-[10px] text-[#73796F] mt-0.5 block">Gate conversion</span>
        </div>
      </div>

      {/* Data Visualizations Section (Recharts using strictly Forest Green / Coral / Gold) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Trends Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#174C3C] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#27866A]" />
              Registration Velocity (Past 14 Days)
            </h3>
            <span className="text-[11px] text-[#73796F]">Database verified</span>
          </div>

          <div className="h-64 w-full">
            {trends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#73796F]">
                New registrations will populate the trend graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#174C3C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#174C3C" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#73796F" fontSize={10} tickLine={false} />
                  <YAxis stroke="#73796F" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F2',
                      borderColor: '#E8E5DC',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#202923'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#174C3C"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forestGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#174C3C] flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#FF6B4A]" />
              Events by Category
            </h3>
            <span className="text-[11px] text-[#73796F]">Distribution</span>
          </div>

          <div className="h-64 w-full">
            {categoryBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#73796F]">
                No category data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#73796F" fontSize={9} tickLine={false} />
                  <YAxis stroke="#73796F" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FAF8F2',
                      borderColor: '#E8E5DC',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE_COLORS[index % PALETTE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="bg-white rounded-3xl border border-[#E8E5DC] overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-[#E8E5DC] bg-[#FAF8F2] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#174C3C]">Events Management Table</h3>
            <span className="text-xs text-[#73796F]">
              Review approval status, capacity limits, and launch gate check-in
            </span>
          </div>
          <Link
            to="/host/create"
            className="text-xs font-bold text-[#174C3C] hover:underline flex items-center gap-1"
          >
            <span>+ New Draft</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F2] text-[#73796F] uppercase tracking-wider font-bold border-b border-[#E8E5DC]">
              <tr>
                <th className="py-3 px-6">Event Title</th>
                <th className="py-3 px-4">Date & Venue</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registrations</th>
                <th className="py-3 px-4">Check-in Rate</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#73796F]">
                    No events created yet. Click "Create New Event" to get started!
                  </td>
                </tr>
              ) : (
                recentEvents.map(event => {
                  const regCount = event.registered_count || 0;
                  const cap = event.max_capacity || 100;
                  const checkedCount = event.checked_in_count || 0;
                  const eventRate = regCount > 0 ? Math.round((checkedCount / regCount) * 100) : 0;

                  return (
                    <tr key={event.id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[#202923] text-sm">{event.title}</div>
                        <div className="text-[11px] text-[#73796F]">{event.category}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#202923]">
                        <div className="font-semibold">{event.event_date}</div>
                        <div className="text-[11px] text-[#73796F] truncate max-w-xs">
                          {event.venue_name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={event.status} size="sm" />
                        {event.rejection_reason && (
                          <div className="text-[10px] text-[#D94528] mt-1 max-w-xs truncate" title={event.rejection_reason}>
                            Note: {event.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#202923]">
                        <div className="font-bold">
                          {regCount} / {cap}
                        </div>
                        <div className="w-24 h-1.5 bg-[#FAF8F2] rounded-full overflow-hidden mt-1 border border-[#E8E5DC]">
                          <div
                            className="h-full bg-[#27866A]"
                            style={{ width: `${Math.min(100, (regCount / cap) * 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#174C3C]">
                          {checkedCount} ({eventRate}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right space-x-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-[#E8E5DC] text-[#202923] hover:bg-[#FAF8F2] text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#73796F]" />
                          <span>View</span>
                        </Link>

                        {['APPROVED', 'PUBLISHED'].includes(event.status) && (
                          <Link
                            to="/check-in"
                            className="px-2.5 py-1.5 rounded-lg bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#F4C95D]" />
                            <span>Scan Gate</span>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
