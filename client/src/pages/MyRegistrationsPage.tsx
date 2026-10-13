import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Registration, TicketDetail } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { QRTicketModal } from '../components/QRTicketModal';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const MyRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);

  // Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [statusFilter]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRegistrations(statusFilter);
      setRegistrations(data.registrations || []);
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

  const handleCancelRegistration = async (regId: string) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this ticket pass?');
    if (!confirmCancel) return;

    setCancellingId(regId);
    try {
      await api.cancelRegistration(regId);
      setActionMsg('Registration ticket cancelled.');
      await loadRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel ticket');
    } finally {
      setCancellingId(null);
    }
  };

  const downloadICS = (regId: string) => {
    window.open(`/api/registrations/${regId}/ics`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#27866A] flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-[#27866A]" />
            Your Campus Access Passbook
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            My Registrations & Tickets
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            View your cryptographic QR entry tokens, download .ics calendar invites, or manage bookings.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex bg-[#FAF8F2] p-1 rounded-2xl border border-[#E8E5DC]">
          <button
            onClick={() => setStatusFilter('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'upcoming'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#73796F] hover:text-[#202923]'
            }`}
          >
            Upcoming Passes
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'completed'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#73796F] hover:text-[#202923]'
            }`}
          >
            Attended / Past
          </button>

          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'cancelled'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#73796F] hover:text-[#202923]'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C] text-xs font-bold text-[#174C3C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#27866A] shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Registrations List */}
      <div>
        {loading ? (
          <div className="text-center py-20 text-[#73796F]">
            <div className="w-8 h-8 border-3 border-[#174C3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading your tickets...
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8E5DC] p-12 text-center space-y-4">
            <Ticket className="w-12 h-12 text-[#E8E5DC] mx-auto" />
            <h3 className="text-lg font-bold text-[#202923]">
              No {statusFilter} tickets found
            </h3>
            <p className="text-xs text-[#73796F] max-w-sm mx-auto">
              Ready to explore upcoming hackathons, tech talks, or musical festivals on campus?
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174C3C] text-white text-xs font-bold"
            >
              Browse Event Discovery Feed
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map(reg => (
              <div
                key={reg.registration_id}
                className="bg-white rounded-3xl border border-[#E8E5DC] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={reg.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80'}
                    alt={reg.event_title}
                    className="w-full sm:w-28 h-28 rounded-2xl object-cover border border-[#E8E5DC] shrink-0"
                  />

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FAF8F2] text-[#174C3C] border border-[#E8E5DC]">
                        {reg.category}
                      </span>
                      <StatusBadge status={reg.registration_status} size="sm" />
                    </div>

                    <h3 className="font-extrabold text-base text-[#202923] line-clamp-1">
                      {reg.event_title}
                    </h3>

                    <div className="text-xs text-[#73796F] space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#27866A] shrink-0" />
                        <span className="font-semibold text-[#202923]">{reg.event_date}</span>
                        <Clock className="w-3.5 h-3.5 text-[#27866A] ml-1 shrink-0" />
                        <span>{reg.start_time} - {reg.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
                        <span className="truncate">{reg.venue_name}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#73796F] pt-1">
                      Code: <span className="font-mono font-bold text-[#174C3C]">{reg.registration_id}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-[#E8E5DC] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {reg.registration_status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleOpenTicket(reg.registration_id)}
                        className="px-4 py-2 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Ticket className="w-4 h-4 text-[#F4C95D]" />
                        <span>Open QR Pass</span>
                      </button>
                    )}

                    <button
                      onClick={() => downloadICS(reg.registration_id)}
                      className="px-3 py-2 rounded-xl border border-[#27866A] text-[#27866A] hover:bg-[#27866A]/10 text-xs font-bold transition-colors flex items-center gap-1"
                      title="Download .ics Calendar Event"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">.ICS</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/events/${reg.event_id}`}
                      className="text-xs font-semibold text-[#73796F] hover:text-[#174C3C] flex items-center gap-0.5"
                    >
                      <span>Event Info</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {reg.registration_status === 'REGISTERED' && (
                      <button
                        onClick={() => handleCancelRegistration(reg.registration_id)}
                        disabled={cancellingId === reg.registration_id}
                        className="text-xs font-bold text-[#FF6B4A] hover:underline ml-2"
                      >
                        {cancellingId === reg.registration_id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <QRTicketModal
        isOpen={ticketModalOpen}
        ticket={selectedTicket}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
};
