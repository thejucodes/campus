import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { CampusEvent, TicketDetail } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { QRTicketModal } from '../components/QRTicketModal';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Ticket,
  ChevronLeft
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Ticket modal state
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketData, setTicketData] = useState<TicketDetail | null>(null);

  useEffect(() => {
    if (id) {
      loadEventDetails();
    }
  }, [id, user]);

  const loadEventDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getEventById(id);
      setEvent(data.event);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!event) return;

    setRegistering(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.registerForEvent(event.id);
      setSuccessMsg(res.message || 'Successfully registered!');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#174C3C', '#27866A', '#FF6B4A', '#F4C95D']
      });

      // Reload event details
      await loadEventDetails();

      // Automatically fetch ticket data and open QR ticket modal
      if (res.registration) {
        setTicketData({
          registration_id: res.registration.id,
          ticket_token: res.registration.ticketToken,
          ticket_status: 'REGISTERED',
          registered_at: new Date().toISOString(),
          student_name: user.name,
          student_email: user.email,
          student_department: user.department || '',
          event_id: event.id,
          event_title: event.title,
          category: event.category,
          event_date: event.event_date,
          start_time: event.start_time,
          end_time: event.end_time,
          venue_name: event.venue_name,
          organizer_club: event.organizer_club
        });
        setTicketModalOpen(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event?.user_registration?.registration_id) return;

    const confirmCancel = window.confirm('Are you sure you want to cancel your registration for this event?');
    if (!confirmCancel) return;

    setCancelling(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.cancelRegistration(event.user_registration.registration_id);
      setSuccessMsg('Your registration has been cancelled.');
      await loadEventDetails();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel registration');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenTicket = async () => {
    if (!event?.user_registration?.registration_id) return;
    try {
      const data = await api.getTicket(event.user_registration.registration_id);
      setTicketData(data.ticket);
      setTicketModalOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch ticket');
    }
  };

  const downloadICS = () => {
    if (event?.user_registration?.registration_id) {
      window.open(`/api/registrations/${event.user_registration.registration_id}/ics`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#73796F]">
        <div className="w-8 h-8 border-3 border-[#174C3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading event details...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#202923]">Event Not Found</h2>
        <p className="text-sm text-[#73796F]">
          The event you are looking for may have been removed or does not exist.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#174C3C] text-white text-sm font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Discover
        </Link>
      </div>
    );
  }

  const isRegistered = event.user_registration && event.user_registration.status !== 'CANCELLED';
  const isPastDeadline = event.registration_deadline ? new Date() > new Date(event.registration_deadline) : false;
  const isSoldOut = (event.registered_count || 0) >= event.max_capacity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Back */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#73796F] hover:text-[#174C3C] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events Feed
        </Link>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs font-bold text-[#D94528] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF6B4A]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C] text-xs font-bold text-[#174C3C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#27866A]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hero Banner Container */}
      <div className="relative rounded-3xl overflow-hidden bg-[#202923] shadow-md border border-[#E8E5DC] h-72 sm:h-96">
        <img
          src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

        <div className="absolute top-5 left-5 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FAF8F2] text-[#174C3C] shadow-sm">
            {event.category}
          </span>
          <StatusBadge status={event.status} size="sm" />
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#F4C95D]">
            Organized by {event.organizer_club}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content & Registration Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Details & Rules */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Quick Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#27866A]/10 text-[#27866A] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#27866A]" />
              </div>
              <div>
                <span className="font-bold text-[#73796F] block">Event Date</span>
                <span className="font-bold text-[#202923] text-sm">
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#FF6B4A]" />
              </div>
              <div>
                <span className="font-bold text-[#73796F] block">Time Window</span>
                <span className="font-bold text-[#202923] text-sm">
                  {event.start_time} - {event.end_time}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#174C3C]" />
              </div>
              <div className="truncate">
                <span className="font-bold text-[#73796F] block">Venue</span>
                <span className="font-bold text-[#202923] text-sm truncate block">
                  {event.venue_name}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-[#174C3C]">About This Event</h3>
            <p className="text-sm text-[#202923] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Eligibility & Additional Rules */}
          <div className="bg-white p-7 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-[#174C3C]">Eligibility & Instructions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-1">
                <span className="font-bold text-[#73796F] uppercase tracking-wider block text-[10px]">
                  Target Eligibility
                </span>
                <span className="font-semibold text-[#202923] block text-sm">
                  {event.eligibility || 'Open to all enrolled students'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-1">
                <span className="font-bold text-[#73796F] uppercase tracking-wider block text-[10px]">
                  Registration Deadline
                </span>
                <span className="font-semibold text-[#202923] block text-sm">
                  {event.registration_deadline
                    ? new Date(event.registration_deadline).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Until capacity reached'}
                </span>
              </div>
            </div>

            {event.additional_info && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] text-xs text-[#202923]">
                <span className="font-bold text-[#174C3C] block mb-1">Organizer Notes:</span>
                <p>{event.additional_info}</p>
              </div>
            )}
          </div>

          {/* Venue Specification */}
          {event.venue && (
            <div className="bg-white p-7 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-3">
              <h3 className="text-lg font-extrabold text-[#174C3C]">Venue Details</h3>
              <div className="space-y-1.5 text-xs text-[#73796F]">
                <div>
                  <strong className="text-[#202923]">Location: </strong>
                  {event.venue.location_details}
                </div>
                <div>
                  <strong className="text-[#202923]">Hall Equipment: </strong>
                  {event.venue.equipment}
                </div>
                <div>
                  <strong className="text-[#202923]">Total Hall Capacity: </strong>
                  {event.venue.capacity} seats
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Registration Card & Action */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border-2 border-[#174C3C]/30 shadow-md space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E5DC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#73796F]">
                Ticket Price
              </span>
              <span className="text-2xl font-extrabold text-[#174C3C]">
                Free (Campus Pass)
              </span>
            </div>

            {/* Capacity Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#202923]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#27866A]" />
                  Capacity Progress
                </span>
                <span className={isSoldOut ? 'text-[#FF6B4A]' : 'text-[#27866A]'}>
                  {event.registered_count || 0} / {event.max_capacity} seats
                </span>
              </div>
              <div className="w-full h-2 bg-[#FAF8F2] rounded-full overflow-hidden border border-[#E8E5DC]">
                <div
                  className={`h-full rounded-full transition-all ${
                    isSoldOut ? 'bg-[#FF6B4A]' : 'bg-[#27866A]'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((event.registered_count || 0) / event.max_capacity) * 100)
                    )}%`
                  }}
                />
              </div>
              <div className="text-[11px] text-[#73796F] text-right">
                {isSoldOut ? 'No seats remaining' : `${event.remaining_seats} remaining seats`}
              </div>
            </div>

            {/* Action State */}
            {isRegistered ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C]/30 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#174C3C]">
                    <CheckCircle2 className="w-4 h-4 text-[#27866A]" />
                    You are registered!
                  </div>
                  <span className="text-[11px] text-[#73796F] block">
                    Code: {event.user_registration?.registration_id}
                  </span>
                </div>

                <button
                  onClick={handleOpenTicket}
                  className="w-full py-3 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <Ticket className="w-4 h-4 text-[#F4C95D]" />
                  <span>View QR Ticket Pass</span>
                </button>

                <button
                  onClick={downloadICS}
                  className="w-full py-2.5 rounded-xl font-bold text-[#27866A] border border-[#27866A] hover:bg-[#27866A]/10 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Add to Phone Calendar (.ics)</span>
                </button>

                <button
                  onClick={handleCancelRegistration}
                  disabled={cancelling}
                  className="w-full py-2 text-xs font-bold text-[#FF6B4A] hover:text-[#D94528] transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              </div>
            ) : isSoldOut ? (
              <div className="p-4 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-center space-y-1">
                <div className="text-sm font-bold text-[#FF6B4A]">Event Sold Out</div>
                <p className="text-xs text-[#73796F]">
                  All seats for this session have been reserved.
                </p>
              </div>
            ) : isPastDeadline ? (
              <div className="p-4 rounded-2xl bg-[#E8E5DC] text-center space-y-1">
                <div className="text-sm font-bold text-[#73796F]">Registration Closed</div>
                <p className="text-xs text-[#73796F]">
                  The deadline for this event has expired.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#F4C95D]" />
                  <span>{registering ? 'Reserving Seat...' : 'Register for Event'}</span>
                </button>
                <p className="text-[11px] text-[#73796F] text-center">
                  Instant QR ticket generated upon confirmation.
                </p>
              </div>
            )}

            {/* Quick Share */}
            <div className="pt-4 border-t border-[#E8E5DC] flex items-center justify-between text-xs text-[#73796F]">
              <span className="font-semibold">CampusPulse SYNESIS '26</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Event link copied to clipboard!');
                }}
                className="flex items-center gap-1 text-[#174C3C] hover:underline font-bold"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Ticket Modal */}
      <QRTicketModal
        isOpen={ticketModalOpen}
        ticket={ticketData}
        onClose={() => setTicketModalOpen(false)}
      />
    </div>
  );
};
