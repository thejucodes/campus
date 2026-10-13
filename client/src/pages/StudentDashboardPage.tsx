import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Registration, CampusEvent, TicketDetail } from '../types';
import { QRTicketModal } from '../components/QRTicketModal';
import { StatusBadge } from '../components/StatusBadge';
import {
  Ticket,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [recommendations, setRecommendations] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Ticket modal
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [regRes, recRes] = await Promise.all([
        api.getMyRegistrations('upcoming'),
        api.getRecommendations()
      ]);
      setRegistrations(regRes.registrations || []);
      setRecommendations(recRes.recommendations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (regId: string) => {
    try {
      const data = await api.getTicket(regId);
      setSelectedTicket(data.ticket);
      setTicketModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-[#174C3C] text-white p-8 rounded-3xl relative overflow-hidden shadow-md border border-[#27866A]">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#27866A]/40 text-[#F4C95D] text-xs font-bold border border-[#F4C95D]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            Student Event Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#FAF8F2]/80 leading-relaxed">
            {user?.department ? `${user.department} • ` : ''}
            Stay on top of your upcoming sessions, access instant QR gate passes, and discover campus workshops.
          </p>

          {user?.interests && user.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-xs text-[#F4C95D] font-bold mr-1 self-center">Interests:</span>
              {user.interests.map(int => (
                <span
                  key={int}
                  className="px-2.5 py-0.5 rounded-lg bg-white/10 text-white text-xs font-semibold backdrop-blur-sm"
                >
                  {int}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#73796F]">
              Upcoming Passes
            </span>
            <div className="text-3xl font-extrabold text-[#174C3C] mt-1">
              {registrations.length}
            </div>
            <span className="text-[11px] text-[#27866A] font-semibold mt-0.5 block">
              Active QR tickets ready
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center">
            <Ticket className="w-6 h-6 text-[#174C3C]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#73796F]">
              Quick Discovery
            </span>
            <div className="text-3xl font-extrabold text-[#FF6B4A] mt-1">
              {recommendations.length}
            </div>
            <span className="text-[11px] text-[#73796F] font-semibold mt-0.5 block">
              Personalized matches
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center">
            <Compass className="w-6 h-6 text-[#FF6B4A]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#73796F]">
              Campus Event Status
            </span>
            <div className="text-sm font-extrabold text-[#202923] mt-2">
              SYNESIS '26 Hackathon
            </div>
            <span className="text-[11px] text-[#27866A] font-semibold mt-0.5 block">
              Registration open
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F4C95D]/30 text-[#A07010] flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#D99B16]" />
          </div>
        </div>
      </div>

      {/* Upcoming Registrations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#202923] flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#27866A]" />
            Your Registered Events & Tickets
          </h2>
          <Link
            to="/my-registrations"
            className="text-xs font-bold text-[#174C3C] hover:text-[#27866A] flex items-center gap-1"
          >
            <span>View All & History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs text-[#73796F]">Loading tickets...</div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E5DC] p-8 text-center space-y-3">
            <Ticket className="w-10 h-10 text-[#E8E5DC] mx-auto" />
            <h3 className="text-base font-bold text-[#202923]">No Upcoming Registrations</h3>
            <p className="text-xs text-[#73796F] max-w-sm mx-auto">
              Explore the campus feed and register for exciting technical sprints or cultural nights.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#174C3C] text-white text-xs font-bold"
            >
              Browse Campus Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map(reg => (
              <div
                key={reg.registration_id}
                className="bg-white rounded-3xl border border-[#E8E5DC] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={reg.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80'}
                    alt={reg.event_title}
                    className="w-20 h-20 rounded-2xl object-cover border border-[#E8E5DC] shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#73796F]">
                        {reg.category}
                      </span>
                      <StatusBadge status={reg.registration_status} size="sm" />
                    </div>
                    <h3 className="font-bold text-sm text-[#202923] line-clamp-1">
                      {reg.event_title}
                    </h3>
                    <div className="text-xs text-[#73796F] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#27866A]" />
                      <span>{reg.event_date}</span>
                      <Clock className="w-3.5 h-3.5 text-[#27866A] ml-1" />
                      <span>{reg.start_time}</span>
                    </div>
                    <div className="text-xs text-[#73796F] flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      <span className="truncate">{reg.venue_name}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E5DC] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#73796F]">
                    {reg.registration_id}
                  </span>
                  <button
                    onClick={() => handleOpenTicket(reg.registration_id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#F4C95D]" />
                    <span>View QR Pass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations Slider / Grid */}
      {recommendations.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E8E5DC]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#202923] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B4A]" />
              Events Matched to Your Preferences
            </h2>
            <Link
              to="/events"
              className="text-xs font-bold text-[#174C3C] hover:text-[#27866A] flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map(rec => (
              <div
                key={rec.id}
                className="bg-white rounded-3xl border border-[#E8E5DC] p-5 shadow-sm space-y-3 flex flex-col justify-between hover:-translate-y-1 transition-all"
              >
                <div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FAF8F2] text-[#174C3C] border border-[#E8E5DC]">
                    {rec.category}
                  </span>
                  <h3 className="font-bold text-sm text-[#202923] mt-2 line-clamp-1">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-[#73796F] line-clamp-2 mt-1">
                    {rec.short_summary || rec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E8E5DC] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#27866A]">
                    {rec.remaining_seats} seats left
                  </span>
                  <Link
                    to={`/events/${rec.id}`}
                    className="px-3 py-1 rounded-lg bg-[#FAF8F2] text-[#174C3C] hover:bg-[#174C3C] hover:text-white text-xs font-bold transition-all border border-[#E8E5DC]"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      <QRTicketModal
        isOpen={ticketModalOpen}
        ticket={selectedTicket}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
};
