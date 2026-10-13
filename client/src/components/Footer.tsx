import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#174C3C] text-[#FAF8F2] pt-14 pb-8 border-t border-[#27866A]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#27866A]/40">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#27866A] flex items-center justify-center text-[#F4C95D] font-extrabold text-lg border border-[#F4C95D]/30">
                CP
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CampusPulse
              </span>
            </div>
            <p className="text-sm text-[#FAF8F2]/75 leading-relaxed">
              Discover Better. Organize Smarter. Connect Campus.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#27866A]/40 border border-[#F4C95D]/30 text-xs font-semibold text-[#F4C95D]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
              SYNESIS '26 Hackathon Finalist
            </div>
          </div>

          {/* Student Experience */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4C95D] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FF6B4A]" />
              Find Events
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF8F2]/80">
              <li>
                <Link to="/events" className="hover:text-white hover:underline transition-colors">
                  All Campus Events
                </Link>
              </li>
              <li>
                <Link to="/events?category=Hackathons" className="hover:text-white hover:underline transition-colors">
                  Hackathons & Dev Sprints
                </Link>
              </li>
              <li>
                <Link to="/events?category=Technical" className="hover:text-white hover:underline transition-colors">
                  Technical Masterclasses
                </Link>
              </li>
              <li>
                <Link to="/events?category=Cultural" className="hover:text-white hover:underline transition-colors">
                  Cultural & Music Fests
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-white hover:underline transition-colors">
                  My Tickets & QR Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Organizer Experience */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4C95D] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#27866A]" />
              Host & Manage
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF8F2]/80">
              <li>
                <Link to="/host" className="hover:text-white hover:underline transition-colors">
                  Organizer Overview
                </Link>
              </li>
              <li>
                <Link to="/host/create" className="hover:text-white hover:underline transition-colors">
                  Submit New Event
                </Link>
              </li>
              <li>
                <Link to="/host/create" className="hover:text-white hover:underline transition-colors">
                  AI Flyer Auto-Extractor
                </Link>
              </li>
              <li>
                <Link to="/dashboard/organizer" className="hover:text-white hover:underline transition-colors">
                  Organizer Analytics
                </Link>
              </li>
              <li>
                <Link to="/check-in" className="hover:text-white hover:underline transition-colors">
                  Live QR Gate Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration & Oversight */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#F4C95D] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F4C95D]" />
              Campus Governance
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF8F2]/80">
              <li>
                <Link to="/approvals" className="hover:text-white hover:underline transition-colors">
                  Digital Approval Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" className="hover:text-white hover:underline transition-colors">
                  Administrative Analytics
                </Link>
              </li>
              <li>
                <span className="text-[#FAF8F2]/60 text-xs block leading-relaxed">
                  Strict venue conflict engine prevents double-booking across auditoriums, labs, and sports arenas.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF8F2]/70 gap-4">
          <p>© 2026 CampusPulse — Built for SYNESIS '26 Smart Campus Hackathon.</p>
          <div className="flex items-center gap-2">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-[#FF6B4A] fill-[#FF6B4A]" />
            <span>for frictionless campus life</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
