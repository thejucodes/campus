import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CampusEvent } from '../types';
import { Calendar, Clock, MapPin, Users, Sparkles, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface EventCardProps {
  event: CampusEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [imageError, setImageError] = useState(false);

  // Category color tags (Strictly NO BLUE/PURPLE)
  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'Hackathons':
        return 'bg-[#FF6B4A]/15 text-[#FF6B4A] border-[#FF6B4A]/30';
      case 'Technical':
        return 'bg-[#174C3C]/10 text-[#174C3C] border-[#174C3C]/30';
      case 'Workshops':
        return 'bg-[#27866A]/15 text-[#27866A] border-[#27866A]/30';
      case 'Cultural':
        return 'bg-[#F4C95D]/25 text-[#A07010] border-[#F4C95D]/50';
      case 'Sports':
        return 'bg-[#FF6B4A]/20 text-[#D94528] border-[#FF6B4A]/40';
      case 'Entrepreneurship':
        return 'bg-[#174C3C]/15 text-[#174C3C] border-[#174C3C]/40';
      default:
        return 'bg-[#27866A]/10 text-[#27866A] border-[#27866A]/20';
    }
  };

  const registered = event.registered_count || 0;
  const capacity = event.max_capacity || 100;
  const fillPercent = Math.min(100, Math.round((registered / capacity) * 100));

  const fallbackImage = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';

  return (
    <div className="bg-white rounded-2xl border border-[#E8E5DC] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Cover Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-[#FAF8F2]">
        <img
          src={imageError || !event.cover_image ? fallbackImage : event.cover_image}
          alt={event.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border backdrop-blur-md shadow-sm ${getCategoryBadgeColor(event.category)}`}>
            {event.category}
          </span>
          {event.recommendation_reason && (
            <span className="px-2 py-1 text-[11px] font-bold rounded-lg bg-[#F4C95D] text-[#202923] shadow-sm flex items-center gap-1 border border-[#F4C95D]">
              <Sparkles className="w-3 h-3 text-[#174C3C]" />
              {event.recommendation_type === 'interest-matched' ? 'For You' : 'Trending'}
            </span>
          )}
        </div>

        {/* Status / User registered pill */}
        <div className="absolute top-3 right-3">
          {event.user_registration && event.user_registration.status !== 'CANCELLED' ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#174C3C] text-white shadow-sm flex items-center gap-1 border border-[#F4C95D]/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F4C95D]" />
              Registered
            </span>
          ) : (
            <StatusBadge status={event.status} size="sm" />
          )}
        </div>

        {/* Organizer club tag */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="text-xs font-semibold text-[#FAF8F2]/90 truncate block drop-shadow-sm">
            {event.organizer_club}
          </span>
        </div>
      </div>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-lg text-[#202923] group-hover:text-[#174C3C] transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-xs text-[#73796F] line-clamp-2 mt-1.5 leading-relaxed">
            {event.short_summary || event.description}
          </p>
        </div>

        {/* Meta details: Date, Time, Venue */}
        <div className="space-y-2 text-xs text-[#73796F] pt-2 border-t border-[#E8E5DC]/70">
          <div className="flex items-center gap-2 text-[#202923] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#27866A] shrink-0" />
            <span>
              {new Date(event.event_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-[#E8E5DC]">•</span>
            <Clock className="w-3.5 h-3.5 text-[#27866A] shrink-0" />
            <span>{event.start_time} - {event.end_time}</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
            <span className="truncate">{event.venue_name}</span>
          </div>
        </div>

        {/* Capacity Bar & CTA */}
        <div className="pt-2 border-t border-[#E8E5DC]/70 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#73796F] mb-1">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#27866A]" />
                {registered} / {capacity} seats
              </span>
              <span className={event.is_full ? 'text-[#FF6B4A] font-bold' : 'text-[#27866A]'}>
                {event.is_full ? 'Sold Out' : `${event.remaining_seats} left`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#FAF8F2] rounded-full overflow-hidden border border-[#E8E5DC]">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  fillPercent > 90 ? 'bg-[#FF6B4A]' : 'bg-[#27866A]'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#174C3C] text-white hover:bg-[#133E31] transition-all shadow-sm shrink-0"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
