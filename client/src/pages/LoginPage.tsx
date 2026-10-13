import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CalendarCheck,
  Crown,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate('/events');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await switchDemoRole(role);
      if (role === 'approver') {
        navigate('/approvals');
      } else if (role === 'organizer') {
        navigate('/dashboard/organizer');
      } else if (role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#174C3C] text-[#F4C95D] flex items-center justify-center font-extrabold text-2xl mx-auto shadow-sm">
            CP
          </div>
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight">
            Sign In to CampusPulse
          </h1>
          <p className="text-xs text-[#73796F]">
            Access event registrations, ticketing, or organizer controls.
          </p>
        </div>

        {/* Demo Fast Login Area */}
        <div className="bg-[#FAF8F2] p-5 rounded-3xl border-2 border-[#27866A]/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
              1-Click Demo Evaluation:
            </span>
            <span className="text-[10px] text-[#73796F]">SYNESIS '26</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="p-2.5 rounded-xl bg-white border border-[#E8E5DC] hover:border-[#27866A] hover:bg-[#FAF8F2] text-left transition-all group flex items-start gap-2 shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-[#27866A] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#202923] group-hover:text-[#174C3C]">Student</div>
                <div className="text-[10px] text-[#73796F]">Alex Rivera</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('organizer')}
              className="p-2.5 rounded-xl bg-white border border-[#E8E5DC] hover:border-[#FF6B4A] hover:bg-[#FAF8F2] text-left transition-all group flex items-start gap-2 shadow-xs"
            >
              <CalendarCheck className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#202923] group-hover:text-[#174C3C]">Organizer</div>
                <div className="text-[10px] text-[#73796F]">Maya Patel</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('approver')}
              className="p-2.5 rounded-xl bg-white border border-[#E8E5DC] hover:border-[#D99B16] hover:bg-[#FAF8F2] text-left transition-all group flex items-start gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#D99B16] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#202923] group-hover:text-[#174C3C]">Approver</div>
                <div className="text-[10px] text-[#73796F]">Dean Vance</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-white border border-[#E8E5DC] hover:border-[#174C3C] hover:bg-[#FAF8F2] text-left transition-all group flex items-start gap-2 shadow-xs"
            >
              <Crown className="w-4 h-4 text-[#174C3C] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#202923] group-hover:text-[#174C3C]">Admin</div>
                <div className="text-[10px] text-[#73796F]">Campus Systems</div>
              </div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <div className="bg-white p-7 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs font-bold text-[#D94528] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Campus Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.student@campus.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8E5DC] text-xs text-[#73796F]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-[#174C3C] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
