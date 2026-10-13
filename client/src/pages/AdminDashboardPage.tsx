import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Crown,
  Users,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setAdminData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const userStats = adminData?.userStats || {};
  const eventStats = adminData?.eventStats || {};
  const regStats = adminData?.regStats || {};
  const venues = adminData?.venuesUtilization || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#174C3C] flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-[#F4C95D]" />
            Campus Intelligence & Governance
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            System Administration
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            University-wide event operations, venue capacity bookings, user demographics, and governance controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/approvals"
            className="px-4 py-2.5 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#F4C95D]" />
            <span>Manage Approvals Queue</span>
          </Link>
        </div>
      </div>

      {/* High-level System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Community */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#174C3C] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#27866A]" />
              Campus Users
            </h3>
            <span className="text-xl font-extrabold text-[#202923]">
              {userStats.total_users || 0}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#E8E5DC]">
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#174C3C]">{userStats.students || 0}</div>
              <div className="text-[10px] text-[#73796F]">Students</div>
            </div>
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#FF6B4A]">{userStats.organizers || 0}</div>
              <div className="text-[10px] text-[#73796F]">Clubs</div>
            </div>
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#D99B16]">{userStats.approvers || 0}</div>
              <div className="text-[10px] text-[#73796F]">Approvers</div>
            </div>
          </div>
        </div>

        {/* Events Portfolio */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#174C3C] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6B4A]" />
              Total Events
            </h3>
            <span className="text-xl font-extrabold text-[#202923]">
              {eventStats.total_events || 0}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-[#E8E5DC]">
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#D99B16]">{eventStats.pending || 0}</div>
              <div className="text-[10px] text-[#73796F]">Pending</div>
            </div>
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#174C3C]">{eventStats.approved || 0}</div>
              <div className="text-[10px] text-[#73796F]">Approved</div>
            </div>
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#73796F]">{eventStats.drafts || 0}</div>
              <div className="text-[10px] text-[#73796F]">Drafts</div>
            </div>
          </div>
        </div>

        {/* Gate Activity */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#174C3C] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#27866A]" />
              Registrations & Gates
            </h3>
            <span className="text-xl font-extrabold text-[#202923]">
              {regStats.total_registrations || 0}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-[#E8E5DC]">
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#27866A]">{regStats.checked_in || 0}</div>
              <div className="text-[10px] text-[#73796F]">Gate Scans</div>
            </div>
            <div className="bg-[#FAF8F2] p-2 rounded-xl">
              <div className="font-bold text-[#73796F]">{regStats.cancelled || 0}</div>
              <div className="text-[10px] text-[#73796F]">Cancelled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campus Venues & Utilization */}
      <div className="bg-white rounded-3xl border border-[#E8E5DC] overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-[#E8E5DC] bg-[#FAF8F2] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#174C3C] flex items-center gap-2">
            <Building className="w-4 h-4 text-[#27866A]" />
            Auditorium & Lab Venue Bookings
          </h3>
          <span className="text-xs text-[#73796F]">Utilization Engine</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F2] text-[#73796F] uppercase tracking-wider font-bold border-b border-[#E8E5DC]">
              <tr>
                <th className="py-3 px-6">Venue Name</th>
                <th className="py-3 px-4">Maximum Capacity</th>
                <th className="py-3 px-4">Active Event Bookings</th>
                <th className="py-3 px-4">Conflict Policy</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {venues.map((ven: any) => (
                <tr key={ven.name} className="hover:bg-[#FAF8F2]/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#202923]">
                    {ven.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#73796F]">
                    {ven.capacity} seats
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#174C3C]">
                    {ven.bookings_count} events
                  </td>
                  <td className="py-3.5 px-4 text-[#202923]">
                    Interval Overlap Guard Active
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#174C3C]/10 text-[#174C3C] font-bold text-[10px] uppercase">
                      Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
