import React from 'react';
import { ConflictResult } from '../types';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

interface VenueConflictAlertProps {
  conflict: ConflictResult;
  onSelectSlot?: (startTime: string, endTime: string) => void;
  onSelectVenue?: (venueId: string) => void;
}

export const VenueConflictAlert: React.FC<VenueConflictAlertProps> = ({
  conflict,
  onSelectSlot,
  onSelectVenue
}) => {
  if (!conflict || !conflict.hasConflict) return null;

  return (
    <div className="bg-[#FF6B4A]/10 border-2 border-[#FF6B4A] rounded-2xl p-5 space-y-4 animate-shake">
      {/* Warning Header */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#FF6B4A] text-white shrink-0 mt-0.5 shadow-sm">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-[#D94528] text-base leading-snug">
            Venue Schedule Conflict Detected!
          </h4>
          <p className="text-xs text-[#202923] mt-1 leading-relaxed">
            Another approved or pending campus event is already occupying this venue during your selected time slot.
            You cannot submit or publish this event until the conflict is resolved.
          </p>
        </div>
      </div>

      {/* Conflicting Events List */}
      <div className="bg-white rounded-xl p-3 border border-[#FF6B4A]/30 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#D94528] block">
          Conflicting Reservation:
        </span>
        {conflict.conflictingEvents.map(ev => (
          <div
            key={ev.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between text-xs p-2 rounded-lg bg-[#FAF8F2] border border-[#E8E5DC] gap-1"
          >
            <div>
              <span className="font-bold text-[#202923]">{ev.title}</span>
              <span className="text-[#73796F] text-[11px] block">
                by {ev.organizerClub} ({ev.status})
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-[#D94528] bg-white px-2 py-1 rounded border border-[#FF6B4A]/30 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>{ev.startTime} - {ev.endTime}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Alternate Time Slots */}
      {conflict.suggestedSlots && conflict.suggestedSlots.length > 0 && (
        <div>
          <span className="text-xs font-bold text-[#174C3C] block mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#27866A]" />
            Available Time Slots at this Venue on the Same Date:
          </span>
          <div className="flex flex-wrap gap-2">
            {conflict.suggestedSlots.map((slot, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSlot && onSelectSlot(slot.startTime, slot.endTime)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#27866A] text-[#27866A] hover:bg-[#27866A] hover:text-white transition-all text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <span>{slot.label}</span>
                <span className="text-[10px] uppercase font-bold text-[#174C3C] bg-[#F4C95D] px-1 rounded">Apply</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Alternate Free Venues */}
      {conflict.suggestedVenues && conflict.suggestedVenues.length > 0 && (
        <div>
          <span className="text-xs font-bold text-[#174C3C] block mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#27866A]" />
            Alternative Venues Free During Your Requested Time:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {conflict.suggestedVenues.map(ven => (
              <div
                key={ven.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8E5DC] text-xs"
              >
                <div>
                  <span className="font-bold text-[#202923] block">{ven.name}</span>
                  <span className="text-[#73796F] text-[10px]">
                    Cap: {ven.capacity} • {ven.location}
                  </span>
                </div>
                {onSelectVenue && (
                  <button
                    type="button"
                    onClick={() => onSelectVenue(ven.id)}
                    className="ml-2 px-2.5 py-1 rounded bg-[#174C3C] text-white hover:bg-[#133E31] text-[11px] font-bold shrink-0 transition-colors"
                  >
                    Switch
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
