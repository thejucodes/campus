import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  RefreshCw
} from 'lucide-react';

export const CheckInPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [eventData, setEventData] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Camera scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Manual code input
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Verification result modal/alert
  const [verificationResult, setVerificationResult] = useState<{
    outcome: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'WRONG_EVENT' | 'INVALID' | 'CANCELLED';
    message: string;
    attendee?: any;
  } | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventAttendees(selectedEventId);
    }
  }, [selectedEventId]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getCheckinEvents();
      setEvents(data.events || []);
      if (data.events && data.events.length > 0) {
        setSelectedEventId(data.events[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEventAttendees = async (eventId: string) => {
    try {
      const res = await api.getEventAttendees(eventId);
      setEventData(res.event);
      setStats(res.stats);
      setAttendees(res.attendees || []);
    } catch (e) {
      console.error(e);
    }
  };

  const startScanner = () => {
    setCameraActive(true);
    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true
          },
          false
        );

        scanner.render(
          (decodedText) => {
            handleVerifyCode(decodedText);
          },
          (errorMessage) => {
            // Scanner frame scan errors (normal while scanning)
          }
        );

        scannerRef.current = scanner;
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const handleVerifyCode = async (code: string) => {
    if (!selectedEventId || !code.trim()) return;

    setVerifying(true);
    try {
      const res = await api.verifyCheckin(selectedEventId, code.trim());

      if (res.outcome === 'SUCCESS') {
        setVerificationResult({
          outcome: 'SUCCESS',
          message: res.message || 'Check-in Verified!',
          attendee: res.attendee
        });
      } else if (res.outcome === 'ALREADY_CHECKED_IN') {
        setVerificationResult({
          outcome: 'ALREADY_CHECKED_IN',
          message: res.message,
          attendee: res.attendee
        });
      } else if (res.outcome === 'WRONG_EVENT') {
        setVerificationResult({
          outcome: 'WRONG_EVENT',
          message: res.message,
          attendee: res.attendee
        });
      } else {
        setVerificationResult({
          outcome: 'INVALID',
          message: res.message || 'Invalid ticket code.'
        });
      }

      // Refresh attendee list and stats
      await loadEventAttendees(selectedEventId);
      setManualCode('');
    } catch (err: any) {
      setVerificationResult({
        outcome: 'INVALID',
        message: err.message || 'Verification failed.'
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E8E5DC]">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#27866A] flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#27866A]" />
            Gate Management System
          </span>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight mt-1">
            Live Gate Check-in & Attendance
          </h1>
          <p className="text-sm text-[#73796F] mt-1">
            Scan attendee QR passes using device camera or manual registration lookup with instant duplicate protection.
          </p>
        </div>

        {/* Event Selector Dropdown */}
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#73796F] mb-1">
            Active Event for Gate Scanning:
          </label>
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] bg-white focus:outline-none focus:border-[#27866A] font-medium"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.event_date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Counter Bar */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#73796F]">
              Total Registered
            </span>
            <div className="text-2xl font-extrabold text-[#202923] mt-1">
              {stats.totalRegistered}
            </div>
            <span className="text-[10px] text-[#73796F]">Out of {stats.capacity} max capacity</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#27866A]">
              Checked-In Attendees
            </span>
            <div className="text-2xl font-extrabold text-[#27866A] mt-1">
              {stats.totalCheckedIn}
            </div>
            <span className="text-[10px] text-[#27866A] font-semibold">Verified through gate</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Pending Arrival
            </span>
            <div className="text-2xl font-extrabold text-[#FF6B4A] mt-1">
              {stats.pendingArrival}
            </div>
            <span className="text-[10px] text-[#73796F]">Yet to scan in</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#174C3C]">
              Attendance Turnout
            </span>
            <div className="text-2xl font-extrabold text-[#174C3C] mt-1">
              {stats.attendanceRate}%
            </div>
            <span className="text-[10px] text-[#73796F]">Live gate conversion</span>
          </div>
        </div>
      )}

      {/* Verification Status Banner (If scan recently processed) */}
      {verificationResult && (
        <div
          className={`p-6 rounded-3xl border-2 shadow-md transition-all animate-fade-in ${
            verificationResult.outcome === 'SUCCESS'
              ? 'bg-[#174C3C]/10 border-[#174C3C] text-[#174C3C]'
              : verificationResult.outcome === 'ALREADY_CHECKED_IN'
              ? 'bg-[#F4C95D]/20 border-[#D99B16] text-[#A07010]'
              : 'bg-[#FF6B4A]/10 border-[#FF6B4A] text-[#D94528]'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {verificationResult.outcome === 'SUCCESS' ? (
                <CheckCircle2 className="w-8 h-8 text-[#27866A] shrink-0 mt-0.5" />
              ) : verificationResult.outcome === 'ALREADY_CHECKED_IN' ? (
                <AlertTriangle className="w-8 h-8 text-[#D99B16] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 text-[#FF6B4A] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold leading-tight">
                  {verificationResult.outcome === 'SUCCESS'
                    ? 'Check-in Verified Successfully!'
                    : verificationResult.outcome === 'ALREADY_CHECKED_IN'
                    ? 'Duplicate Check-In Detected!'
                    : 'Check-in Rejected'}
                </h3>
                <p className="text-xs leading-relaxed">{verificationResult.message}</p>

                {verificationResult.attendee && (
                  <div className="mt-3 p-3 bg-white/80 rounded-xl border border-current/20 text-xs text-[#202923] space-y-0.5">
                    <div className="font-bold text-sm text-[#174C3C]">
                      {verificationResult.attendee.name}
                    </div>
                    <div className="text-[#73796F]">{verificationResult.attendee.email}</div>
                    {verificationResult.attendee.department && (
                      <div className="text-[#73796F]">Dept: {verificationResult.attendee.department}</div>
                    )}
                    {verificationResult.attendee.checkedInAt && (
                      <div className="text-[11px] font-semibold text-[#174C3C] mt-1">
                        Timestamp: {new Date(verificationResult.attendee.checkedInAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setVerificationResult(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Check-in Scanner & Manual Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Camera Scanner */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#174C3C] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#27866A]" />
              Camera QR Gate Scanner
            </h3>
            {cameraActive ? (
              <button
                onClick={stopScanner}
                className="px-3 py-1.5 rounded-xl bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/30 text-xs font-bold transition-colors"
              >
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startScanner}
                className="px-4 py-1.5 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-all shadow-sm"
              >
                Start Camera
              </button>
            )}
          </div>

          <div className="bg-[#FAF8F2] rounded-2xl border-2 border-dashed border-[#E8E5DC] p-4 min-h-[300px] flex flex-col items-center justify-center">
            {cameraActive ? (
              <div id="qr-reader-container" className="w-full max-w-sm rounded-xl overflow-hidden" />
            ) : (
              <div className="text-center space-y-3 p-6 text-[#73796F]">
                <QrCode className="w-16 h-16 text-[#E8E5DC] mx-auto" />
                <div className="text-sm font-bold text-[#202923]">Camera Scanner Idle</div>
                <p className="text-xs max-w-xs mx-auto">
                  Click "Start Camera" above to scan physical or phone QR codes directly, or use manual entry below.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manual Code Entry & Instructions */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#174C3C] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#FF6B4A]" />
              Manual Registration Code Lookup
            </h3>
            <p className="text-xs text-[#73796F] leading-relaxed">
              If the student's phone battery is dead or camera scanning is unavailable, enter their registration code (e.g. <code>REG-CP-2026-X891</code>) or paste their signed ticket token.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                  Registration Code or Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={e => setManualCode(e.target.value)}
                    placeholder="e.g. REG-CP-2026-X891"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A] font-mono"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleVerifyCode(manualCode);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleVerifyCode(manualCode)}
                    disabled={verifying || !manualCode.trim()}
                    className="px-5 py-2.5 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold transition-all shadow-sm shrink-0"
                  >
                    {verifying ? 'Checking...' : 'Check-In'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Assist Tool: Sample registered attendees in current event */}
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                Demo Tester Fast-Action:
              </span>
              <span className="text-[10px] text-[#73796F]">Click to test</span>
            </div>
            <p className="text-[11px] text-[#73796F]">
              Click any registered student below to paste their code and verify live gate check-in:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {attendees.slice(0, 4).map(a => (
                <button
                  key={a.registration_id}
                  onClick={() => setManualCode(a.registration_id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                    a.status === 'CHECKED_IN'
                      ? 'bg-[#174C3C]/10 text-[#174C3C] border border-[#174C3C]/30'
                      : 'bg-white text-[#202923] hover:bg-[#E8E5DC] border border-[#E8E5DC]'
                  }`}
                  title={`${a.student_name} (${a.status})`}
                >
                  {a.student_name.split(' ')[0]} ({a.status === 'CHECKED_IN' ? 'In' : 'Reg'})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Attendees Roster Table */}
      <div className="bg-white rounded-3xl border border-[#E8E5DC] overflow-hidden shadow-sm space-y-4">
        <div className="px-6 py-4 border-b border-[#E8E5DC] bg-[#FAF8F2] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#174C3C] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#27866A]" />
              Live Gate Attendees Roster
            </h3>
            <span className="text-xs text-[#73796F]">
              Real-time synchronization across database
            </span>
          </div>
          <button
            onClick={() => loadEventAttendees(selectedEventId)}
            className="p-1.5 rounded-lg border border-[#E8E5DC] hover:bg-[#FAF8F2] text-[#73796F] text-xs font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F2] text-[#73796F] uppercase tracking-wider font-bold border-b border-[#E8E5DC]">
              <tr>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Pass Status</th>
                <th className="py-3 px-4">Registered At</th>
                <th className="py-3 px-6 text-right">Gate Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {attendees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#73796F]">
                    No registrations found for this event.
                  </td>
                </tr>
              ) : (
                attendees.map(att => (
                  <tr key={att.registration_id} className="hover:bg-[#FAF8F2]/50 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#202923]">
                      {att.student_name}
                    </td>
                    <td className="py-3.5 px-4 text-[#73796F]">
                      {att.student_email}
                    </td>
                    <td className="py-3.5 px-4 text-[#202923]">
                      {att.student_department || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          att.status === 'CHECKED_IN'
                            ? 'bg-[#174C3C]/10 text-[#174C3C] border border-[#174C3C]/30'
                            : 'bg-[#27866A]/10 text-[#27866A] border border-[#27866A]/30'
                        }`}
                      >
                        {att.status === 'CHECKED_IN' ? 'Checked In' : 'Registered'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#73796F]">
                      {new Date(att.registered_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-[#174C3C]">
                      {att.checked_in_at ? (
                        new Date(att.checked_in_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      ) : (
                        <span className="text-[#73796F] font-normal">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
