import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CampusEvent } from '../types';
import { EventCard } from '../components/EventCard';
import {
  Sparkles,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Calendar,
  Layers,
  Bot,
  Zap,
  CheckCircle,
  Users,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await api.getEvents({ sortBy: 'popularity' });
        setFeaturedEvents((data.events || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 bg-[#FAF8F2] border-b border-[#E8E5DC]">
        {/* Subtle decorative background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#27866A]/10 via-[#F4C95D]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Event Hackathon Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#174C3C]/10 border border-[#174C3C]/30 text-xs font-bold text-[#174C3C] tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                SYNESIS '26 — Smart Campus Hackathon Showcase
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#202923] tracking-tight leading-[1.12]">
                Your Campus. <br />
                Your Events. <br />
                <span className="text-[#174C3C] underline decoration-[#FF6B4A] decoration-wavy decoration-2">
                  One Pulse.
                </span>
              </h1>

              {/* Supporting text */}
              <p className="text-base sm:text-lg text-[#73796F] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover campus events, secure your spot, and bring your ideas to life. One connected platform for students and organizers.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/events"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <Compass className="w-5 h-5 text-[#F4C95D]" />
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/host"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-[#174C3C] bg-white border-2 border-[#174C3C] hover:bg-[#FAF8F2] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Host an Event</span>
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#E8E5DC]/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#202923]">
                  <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                  <span>Discover events</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#202923]">
                  <CheckCircle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
                  <span>Register in seconds</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#202923]">
                  <CheckCircle className="w-4 h-4 text-[#D99B16] shrink-0" />
                  <span>Scan & attend</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#202923]">
                  <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                  <span>One unified place</span>
                </div>
              </div>
            </div>

            {/* Right Visual Composition: Mini Dashboard & Live Ticket Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Layered Card 1: Live Event Card */}
                <div className="bg-white rounded-3xl p-5 shadow-xl border border-[#E8E5DC] space-y-4 transform hover:-rotate-1 transition-transform">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DC]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FF6B4A] animate-ping" />
                      <span className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                        Happening Soon
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#174C3C]/10 text-[#174C3C] font-bold text-xs">
                      Hackathon
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-lg text-[#202923]">
                      SYNESIS '26 Smart Campus
                    </h4>
                    <p className="text-xs text-[#73796F]">
                      Turing AI Hub • Oct 18, 09:00 AM
                    </p>
                  </div>

                  {/* QR Ticket Mini Preview */}
                  <div className="p-3 bg-[#FAF8F2] rounded-2xl border border-[#E8E5DC] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl border border-[#E8E5DC] p-1 flex items-center justify-center">
                        <QrCode className="w-9 h-9 text-[#174C3C]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#174C3C]">Alex Rivera</div>
                        <div className="text-[10px] text-[#73796F] font-mono">REG-CP-2026-X891</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-[#27866A]/15 text-[#27866A] text-[10px] font-bold uppercase">
                      Valid Pass
                    </span>
                  </div>

                  {/* Real-time stats snippet */}
                  <div className="grid grid-cols-2 gap-2 text-center pt-1">
                    <div className="bg-[#FAF8F2] p-2 rounded-xl border border-[#E8E5DC]">
                      <div className="text-base font-extrabold text-[#174C3C]">85 / 100</div>
                      <div className="text-[10px] font-semibold text-[#73796F]">Seats Reserved</div>
                    </div>
                    <div className="bg-[#FAF8F2] p-2 rounded-xl border border-[#E8E5DC]">
                      <div className="text-base font-extrabold text-[#FF6B4A]">0 Conflicts</div>
                      <div className="text-[10px] font-semibold text-[#73796F]">Venue Verified</div>
                    </div>
                  </div>
                </div>

                {/* Layered Card 2: Floating AI badge */}
                <div className="absolute -bottom-6 -left-6 bg-[#174C3C] text-white p-3.5 rounded-2xl shadow-xl border border-[#27866A] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#27866A] flex items-center justify-center text-[#F4C95D]">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F4C95D]">AI Flyer Extraction</div>
                    <div className="text-[10px] text-[#FAF8F2]/80">Poster to draft in 3 seconds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B4A]">
            Frictionless Lifecycle
          </span>
          <h2 className="text-3xl font-extrabold text-[#202923]">
            How CampusPulse Works
          </h2>
          <p className="text-sm text-[#73796F]">
            Three effortless steps linking student discovery to organizer precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center font-extrabold text-xl">
              1
            </div>
            <h3 className="text-xl font-bold text-[#202923]">
              Discover
            </h3>
            <p className="text-sm text-[#73796F] leading-relaxed">
              Find events tailored to your academic department, technical skills, cultural interests, and sports communities without hunting through WhatsApp groups.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center font-extrabold text-xl">
              2
            </div>
            <h3 className="text-xl font-bold text-[#202923]">
              Participate
            </h3>
            <p className="text-sm text-[#73796F] leading-relaxed">
              Register with a single click, secure your seat with live capacity protection, receive an encrypted QR pass, and sync with your phone calendar.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4C95D]/30 text-[#A07010] flex items-center justify-center font-extrabold text-xl">
              3
            </div>
            <h3 className="text-xl font-bold text-[#202923]">
              Organize & Measure
            </h3>
            <p className="text-sm text-[#73796F] leading-relaxed">
              Host events, prevent double-booked auditoriums with automated conflict checks, scan QR tickets at the gate, and track real attendance rates.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-[#FAF8F2] py-16 border-y border-[#E8E5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold tracking-widest uppercase text-[#27866A]">
              Engineered For Campuses
            </span>
            <h2 className="text-3xl font-extrabold text-[#202923]">
              Smart Features That Eliminate Campus Chaos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#174C3C]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">Smart Event Discovery</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Filter by technical, hackathons, cultural, or sports. Rule-based recommendations surface events matching student interests.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#FF6B4A]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">AI Flyer-to-Event Conversion</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Upload poster images directly. Vision AI automatically extracts title, date, venue, category, and eligibility suggestions for instant drafting.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#27866A]/15 text-[#27866A] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#27866A]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">Seamless QR Registration</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Cryptographically signed HMAC tokens prevent counterfeit tickets while protecting student privacy.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F4C95D]/30 text-[#A07010] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D99B16]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">Intelligent Venue Conflict Detection</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Server-side interval overlap engine prevents double-booking auditoriums and suggests available alternate slots & free rooms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#174C3C]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">Digital Event Approvals</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Deans and faculty approvers review pending events, verify safety guidelines, and log feedback with complete audit logs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E8E5DC] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#FF6B4A]" />
              </div>
              <h4 className="font-bold text-base text-[#202923]">Live Attendance Analytics</h4>
              <p className="text-xs text-[#73796F] leading-relaxed">
                Real-time gate scan verification with camera scanner, duplicate rejection, and instant attendee check-in rate updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Sided Platform Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold tracking-widest uppercase text-[#FF6B4A]">
            Two Unified Workflows
          </span>
          <h2 className="text-3xl font-extrabold text-[#202923]">
            Tailored Experiences for Students & Organizers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Students */}
          <div className="bg-white p-8 rounded-3xl border-2 border-[#27866A]/30 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#27866A] text-white flex items-center justify-center">
                <Users className="w-6 h-6 text-[#F4C95D]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#174C3C]">For Students</h3>
                <span className="text-xs text-[#73796F]">Find, Attend, & Connect</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-[#202923]">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                <span>Discover verified campus events in one centralized feed</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                <span>Personalized recommendations based on your selected interests</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                <span>1-click registration with real-time seat reservation</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                <span>Encrypted QR ticket available anytime on your dashboard</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#27866A] shrink-0" />
                <span>Instant .ics calendar sync for Google, Apple, and Outlook calendars</span>
              </li>
            </ul>

            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#174C3C] hover:text-[#27866A] transition-colors"
            >
              Browse Upcoming Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* For Organizers */}
          <div className="bg-white p-8 rounded-3xl border-2 border-[#174C3C]/30 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#174C3C] text-white flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#FF6B4A]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#174C3C]">For Organizers</h3>
                <span className="text-xs text-[#73796F]">Create, Manage, & Measure</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-[#202923]">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                <span>AI flyer extraction to draft events in seconds</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                <span>Automated venue conflict warnings before submitting for approval</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                <span>Official digital sign-off and approval audit history</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                <span>Live camera QR check-in gate scanner with duplicate detection</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#174C3C] shrink-0" />
                <span>Post-event attendance rate and registration trend analytics</span>
              </li>
            </ul>

            <Link
              to="/host"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#174C3C] hover:text-[#27866A] transition-colors"
            >
              Host a Campus Event <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Events (Real Database Records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#27866A]">
              Live From Campus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202923]">
              Featured Upcoming Events
            </h2>
          </div>
          <Link
            to="/events"
            className="text-sm font-bold text-[#174C3C] hover:text-[#27866A] flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-[#73796F]">
            Loading upcoming events...
          </div>
        ) : featuredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E5DC] text-sm text-[#73796F]">
            No upcoming events found. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Final Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#174C3C] rounded-3xl p-10 sm:p-14 text-white text-center relative overflow-hidden shadow-xl border border-[#27866A]">
          {/* Subtle golden circle accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#F4C95D]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#27866A]/40 border border-[#F4C95D]/30 text-xs font-bold text-[#F4C95D] uppercase tracking-wider">
              SYNESIS '26 Hackathon
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Make Every Campus Event Count.
            </h2>

            <p className="text-sm sm:text-base text-[#FAF8F2]/80 leading-relaxed">
              Say goodbye to fragmented WhatsApp group invites and double-booked halls. Step into connected campus intelligence with CampusPulse.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/events"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[#174C3C] bg-[#F4C95D] hover:bg-[#E5BB4E] transition-all shadow-md"
              >
                Discover Events
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-[#27866A] hover:bg-[#206E57] border border-white/20 transition-all"
              >
                Join as Student or Club
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
