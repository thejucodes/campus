import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CampusEvent, ApprovalHistoryItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  History,
  AlertCircle
} from 'lucide-react';

export const ApprovalDashboardPage: React.FC = () => {
  const [pendingEvents, setPendingEvents] = useState<CampusEvent[]>([]);
  const [history, setHistory] = useState<ApprovalHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [loading, setLoading] = useState(true);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Action status state
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, historyRes] = await Promise.all([
        api.getPendingApprovals(),
        api.getApprovalHistory()
      ]);
      setPendingEvents(pendingRes.pendingEvents || []);
      setHistory(historyRes.history || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load approvals data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    const confirmApprove = window.confirm('Are you sure you want to approve this event? It will become publicly visible to students.');
    if (!confirmApprove) return;

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.approveEvent(eventId, 'Approved: Meets all campus guidelines and venue policies.');
      setSuccessMsg(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (eventId: string) => {
    setSelectedEventId(eventId);
    setRejectionReason('Schedule overlap or safety guidelines require adjustment');
    setRejectionNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedEventId || !rejectionReason.trim()) {
      alert('A rejection reason is required.');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.rejectEvent(selectedEventId, rejectionReason, rejectionNotes);
      setSuccessMsg(res.message);
      setRejectModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#D99B16] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#D99B16]" />
            Faculty & Administration Oversight
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            Digital Event Approvals
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            Review submitted event requests, verify auditorium conflict checks, and approve or reject with audit logs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#FAF8F2] p-1 rounded-2xl border border-[#E8E5DC]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#73796F] hover:text-[#202923]'
            }`}
          >
            <span>Pending Submissions</span>
            <span className="w-5 h-5 rounded-full bg-[#FF6B4A] text-white text-[10px] flex items-center justify-center font-bold">
              {pendingEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#174C3C] text-white shadow-sm'
                : 'text-[#73796F] hover:text-[#202923]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs font-bold text-[#D94528] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#174C3C]/10 border border-[#174C3C] text-xs font-bold text-[#174C3C] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#27866A] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab: Pending Submissions */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-20 text-[#73796F]">
              <div className="w-8 h-8 border-3 border-[#174C3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading pending submissions...
            </div>
          ) : pendingEvents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E8E5DC] p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#27866A] mx-auto" />
              <h3 className="text-lg font-bold text-[#202923]">All Caught Up!</h3>
              <p className="text-xs text-[#73796F] max-w-sm mx-auto">
                No events currently awaiting approval. Any newly submitted student club drafts will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-[#E8E5DC] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-6 items-start justify-between"
                >
                  {/* Left: Event Thumbnail & Details */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start flex-1">
                    <img
                      src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&auto=format&fit=crop&q=80'}
                      alt={event.title}
                      className="w-full sm:w-44 h-32 rounded-2xl object-cover border border-[#E8E5DC] shrink-0"
                    />

                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#FAF8F2] text-[#174C3C] border border-[#E8E5DC]">
                          {event.category}
                        </span>
                        <StatusBadge status={event.status} size="sm" />
                      </div>

                      <h3 className="text-lg font-extrabold text-[#202923]">
                        {event.title}
                      </h3>

                      <p className="text-xs text-[#73796F] line-clamp-2">
                        {event.short_summary || event.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#202923] pt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#27866A] shrink-0" />
                          <span className="font-semibold">{event.event_date}</span>
                          <span className="text-[#73796F]">({event.start_time} - {event.end_time})</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
                          <span className="truncate">{event.venue_name}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#73796F]">
                        Submitted by: <strong className="text-[#174C3C]">{event.organizer_club}</strong> ({event.organizer_name})
                      </div>
                    </div>
                  </div>

                  {/* Right: Venue Conflict Status & Action Buttons */}
                  <div className="w-full lg:w-72 flex flex-col justify-between space-y-4 pt-4 lg:pt-0 lg:border-l lg:border-[#E8E5DC] lg:pl-6">
                    {/* Venue Conflict Indicator */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#73796F]">
                        Venue Conflict Engine
                      </span>
                      {event.venueConflict?.hasConflict ? (
                        <div className="p-2.5 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs text-[#D94528] font-bold flex items-start gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-[#FF6B4A]" />
                          <span>Slot Clashing with another event! Review required.</span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-[#174C3C]/10 border border-[#174C3C]/30 text-xs text-[#174C3C] font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#27866A]" />
                          <span>Venue is 100% Free for this slot</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleApprove(event.id)}
                        disabled={actionLoading || Boolean(event.venueConflict?.hasConflict)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          event.venueConflict?.hasConflict
                            ? 'bg-[#E8E5DC] text-[#73796F] cursor-not-allowed'
                            : 'bg-[#174C3C] text-white hover:bg-[#133E31]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#F4C95D]" />
                        <span>Approve Event</span>
                      </button>

                      <button
                        onClick={() => openRejectModal(event.id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl text-xs font-bold border border-[#FF6B4A] text-[#FF6B4A] hover:bg-[#FF6B4A]/10 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject / Request Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Audit History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-[#E8E5DC] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E8E5DC] bg-[#FAF8F2] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#174C3C]">Logged Approval Actions</h3>
            <span className="text-xs text-[#73796F]">{history.length} audit records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] text-[#73796F] uppercase tracking-wider font-bold border-b border-[#E8E5DC]">
                <tr>
                  <th className="py-3 px-6">Event Title</th>
                  <th className="py-3 px-4">Club</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-6">Feedback / Comments</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DC]">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#73796F]">
                      No recorded approval logs yet.
                    </td>
                  </tr>
                ) : (
                  history.map(item => (
                    <tr key={item.id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-[#202923]">
                        {item.event_title}
                      </td>
                      <td className="py-3.5 px-4 text-[#73796F]">
                        {item.organizer_club}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={item.action} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#174C3C]">
                        {item.approver_name}
                      </td>
                      <td className="py-3.5 px-6 text-[#202923] max-w-xs truncate" title={item.comments}>
                        {item.comments || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#73796F]">
                        {new Date(item.action_timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E8E5DC] p-6 space-y-5">
            <div className="flex items-center gap-3 text-[#FF6B4A]">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-extrabold text-[#202923]">
                Reject or Request Changes
              </h3>
            </div>

            <p className="text-xs text-[#73796F] leading-relaxed">
              A rejection reason is mandatory. The student club will receive this feedback so they can resolve conflicts and resubmit.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                  Primary Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5DC] text-xs text-[#202923] bg-white focus:outline-none focus:border-[#27866A]"
                  required
                >
                  <option value="Schedule overlap or safety guidelines require adjustment">
                    Schedule overlap or safety guidelines require adjustment
                  </option>
                  <option value="Auditorium capacity exceeded for requested expected attendees">
                    Auditorium capacity exceeded for requested expected attendees
                  </option>
                  <option value="Incomplete agenda or description provided">
                    Incomplete agenda or description provided
                  </option>
                  <option value="Event conflicts with university exam or convocation week">
                    Event conflicts with university exam or convocation week
                  </option>
                  <option value="Other administrative policy violation">
                    Other administrative policy violation
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                  Additional Guidance / Notes
                </label>
                <textarea
                  rows={3}
                  value={rejectionNotes}
                  onChange={e => setRejectionNotes(e.target.value)}
                  placeholder="Provide specific recommendations (e.g. shift to Raman Hall on Friday morning instead)..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E5DC] text-xs text-[#202923] focus:outline-none focus:border-[#27866A]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E5DC]">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#73796F] hover:bg-[#FAF8F2] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-[#FF6B4A] hover:bg-[#E85B3B] rounded-xl shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
