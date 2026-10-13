import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EventCategory, UserRole } from '../types';
import {
  User,
  Mail,
  Lock,
  Building,
  Check,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const CATEGORIES: EventCategory[] = [
  'Technical',
  'Hackathons',
  'Workshops',
  'Cultural',
  'Sports',
  'Entrepreneurship',
  'Art and Design',
  'Clubs and Communities'
];

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [organization, setOrganization] = useState('');
  const [interests, setInterests] = useState<string[]>(['Technical', 'Hackathons']);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleInterest = (cat: string) => {
    setInterests(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await register({
        name,
        email,
        password,
        role,
        department,
        organization: role === 'organizer' ? organization : '',
        interests
      });
      navigate(role === 'organizer' ? '/dashboard/organizer' : '/events');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-[#202923] tracking-tight">
            Create Your CampusPulse Account
          </h1>
          <p className="text-xs text-[#73796F]">
            Join as a student to discover events, or as an organizer to host and manage.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E8E5DC] shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FF6B4A]/10 border border-[#FF6B4A] text-xs font-bold text-[#D94528] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF6B4A] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-2">
                Account Purpose
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all ${
                    role === 'student'
                      ? 'border-[#174C3C] bg-[#174C3C] text-white shadow-sm'
                      : 'border-[#E8E5DC] bg-[#FAF8F2] text-[#73796F] hover:bg-[#E8E5DC]'
                  }`}
                >
                  I am a Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold text-center transition-all ${
                    role === 'organizer'
                      ? 'border-[#174C3C] bg-[#174C3C] text-white shadow-sm'
                      : 'border-[#E8E5DC] bg-[#FAF8F2] text-[#73796F] hover:bg-[#E8E5DC]'
                  }`}
                >
                  I am an Organizer / Club
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="yourname@campus.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                  required
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                Academic Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
              />
            </div>

            {/* Organizer Club Name (if role === organizer) */}
            {role === 'organizer' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-1.5">
                  Student Club / Committee Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#73796F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organization}
                    onChange={e => setOrganization(e.target.value)}
                    placeholder="e.g. Robotics Club, Cultural Committee"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8E5DC] text-sm text-[#202923] focus:outline-none focus:border-[#27866A]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Interests Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#73796F] mb-2">
                Event Interests (For Personalized Feed)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const selected = interests.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selected
                          ? 'bg-[#174C3C] text-white shadow-sm ring-1 ring-[#F4C95D]'
                          : 'bg-[#FAF8F2] text-[#73796F] hover:bg-[#E8E5DC] border border-[#E8E5DC]'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-[#F4C95D]" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-[#174C3C] hover:bg-[#133E31] transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#E8E5DC] text-xs text-[#73796F]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#174C3C] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
