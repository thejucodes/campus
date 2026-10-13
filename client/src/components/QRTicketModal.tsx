import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TicketDetail } from '../types';
import { StatusBadge } from './StatusBadge';
import { X, Calendar, MapPin, Download, CheckCircle, ShieldCheck } from 'lucide-react';

interface QRTicketModalProps {
  ticket: TicketDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QRTicketModal: React.FC<QRTicketModalProps> = ({ ticket, isOpen, onClose }) => {
  if (!isOpen || !ticket) return null;

  const downloadICS = () => {
    window.open(`/api/registrations/${ticket.registration_id}/ics`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8E5DC] overflow-hidden flex flex-col">
        {/* Ticket Header */}
        <div className="bg-[#174C3C] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F4C95D] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#FF6B4A]" />
            Official CampusPass
          </div>
          <h2 className="text-xl font-extrabold text-white leading-tight pr-6">
            {ticket.event_title}
          </h2>
          <div className="text-xs text-[#FAF8F2]/80 mt-1">
            Hosted by {ticket.organizer_club}
          </div>
        </div>

        {/* Ticket Body / Cutout Notch */}
        <div className="p-6 space-y-6 relative bg-white">
          {/* Ticket metadata */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E8E5DC]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#73796F]">
                Attendee
              </span>
              <div className="font-bold text-sm text-[#202923] mt-0.5">
                {ticket.student_name}
              </div>
              <div className="text-xs text-[#73796F] truncate">{ticket.student_email}</div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#73796F]">
                Status
              </span>
              <div className="mt-0.5">
                <StatusBadge status={ticket.ticket_status} size="sm" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#202923] pb-4 border-b border-[#E8E5DC]">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#27866A] shrink-0" />
              <span className="font-semibold">
                {new Date(ticket.event_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="text-[#73796F]">({ticket.start_time} - {ticket.end_time})</span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span className="font-semibold truncate">{ticket.venue_name}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F2] rounded-2xl border-2 border-dashed border-[#E8E5DC]">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-[#E8E5DC]">
              <QRCodeSVG
                value={ticket.ticket_token || ticket.registration_id}
                size={180}
                level="H"
                includeMargin={true}
                fgColor="#174C3C"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="mt-3 text-center">
              <div className="font-mono text-xs font-bold text-[#174C3C] tracking-widest bg-white px-3 py-1 rounded-md border border-[#E8E5DC]">
                {ticket.registration_id}
              </div>
              <span className="text-[10px] text-[#73796F] block mt-1">
                Show this QR at the venue entrance gate for check-in
              </span>
            </div>
          </div>

          {/* Ticket actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadICS}
              className="flex-1 py-2.5 px-3 rounded-xl border border-[#27866A] text-[#27866A] hover:bg-[#27866A]/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Add to Calendar (.ics)
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#174C3C] text-white hover:bg-[#133E31] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-[#F4C95D]" />
              Print / Save Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
