import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Calendar,
  Layers,
  Bot,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';

export const HostIntroPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-20">
      {/* Hero */}
      <section className="bg-[#FAF8F2] py-16 border-b border-[#E8E5DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#174C3C]/10 border border-[#174C3C]/30 text-xs font-bold text-[#174C3C] tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
              CampusPulse Organizer Suite
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#202923] tracking-tight leading-tight">
              Host With Precision. <br />
              <span className="text-[#174C3C]">Say Goodbye to Venue Clashes.</span>
            </h1>

            <p className="text-base text-[#73796F] leading-relaxed">
              From uploading your student club poster to automated auditorium conflict checks, digital faculty sign-offs, and QR gate passes — manage your campus event in one unified hub.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/host/create"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#F4C95D]" />
                <span>Create New Event</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {user && (
                <Link
                  to="/dashboard/organizer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[#174C3C] bg-white border border-[#174C3C] hover:bg-[#FAF8F2] transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Organizer Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of CampusPulse Event Hosting */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
            The Connected Journey
          </span>
          <h2 className="text-3xl font-extrabold text-[#202923]">
            How Hosting on CampusPulse Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: AI Poster Extraction */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/15 text-[#FF6B4A] flex items-center justify-center font-bold">
              <Bot className="w-6 h-6 text-[#FF6B4A]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#202923]">1. AI Flyer Extraction</h3>
            <p className="text-xs text-[#73796F] leading-relaxed">
              Drop your design poster or flyer. Our AI vision parser extracts title, date, time, venue, category, and eligibility suggestions for you to review and adjust.
            </p>
          </div>

          {/* Pillar 2: Venue Conflict Detection */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#F4C95D]/30 text-[#A07010] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-[#D99B16]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#202923]">2. Conflict Detection</h3>
            <p className="text-xs text-[#73796F] leading-relaxed">
              Never get double-booked. Our backend verifies time slot intervals against all active auditorium and lab bookings, proposing alternative slots if conflicts occur.
            </p>
          </div>

          {/* Pillar 3: Digital Approvals */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#174C3C]/10 text-[#174C3C] flex items-center justify-center font-bold">
              <Layers className="w-6 h-6 text-[#174C3C]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#202923]">3. Digital Approvals</h3>
            <p className="text-xs text-[#73796F] leading-relaxed">
              No paper approval forms lost in administrative inboxes. Campus authorities review, approve, or provide targeted revision feedback with timestamped history.
            </p>
          </div>

          {/* Pillar 4: Live Check-in & Stats */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-4 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-[#27866A]/15 text-[#27866A] flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6 text-[#27866A]" />
            </div>
            <h3 className="font-extrabold text-lg text-[#202923]">4. QR Gate Check-in</h3>
            <p className="text-xs text-[#73796F] leading-relaxed">
              Scan attendees’ encrypted QR passes at the entrance. Instant duplicate prevention and real-time attendance analytics synced to your organizer dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Guidelines Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#174C3C] text-[#F4C95D] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#174C3C]">Campus Event Hosting Rules & Checklist</h3>
              <p className="text-xs text-[#73796F]">Ensure smooth approvals by following these standards</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#202923]">
            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-2">
              <span className="font-bold text-[#174C3C] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#27866A]" />
                Auditorium Bookings
              </span>
              <p className="text-[#73796F] leading-relaxed">
                Submit submissions at least 48 hours prior. Venues like Raman Auditorium and Turing Lab require confirmed expected audience sizes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-2">
              <span className="font-bold text-[#174C3C] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#27866A]" />
                Poster & Flyer Quality
              </span>
              <p className="text-[#73796F] leading-relaxed">
                High-resolution PNG/JPG flyers result in maximum AI extraction precision. Always review dates and times suggested by the AI parser.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E8E5DC] space-y-2">
              <span className="font-bold text-[#174C3C] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#27866A]" />
                Gate Verification
              </span>
              <p className="text-[#73796F] leading-relaxed">
                Organizers or assigned volunteers can use the in-app camera QR check-in tool on any phone or laptop at the event entrance.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E5DC] flex justify-end">
            <Link
              to="/host/create"
              className="px-6 py-3 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all flex items-center gap-2 text-xs"
            >
              <span>Get Started: Create Event Draft</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
