import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, CalendarCheck, Crown } from 'lucide-react';

export const DemoAccountSwitcher: React.FC = () => {
  const { user, switchDemoRole } = useAuth();

  const roles: Array<{ role: UserRole; name: string; label: string; icon: React.ReactNode }> = [
    {
      role: 'student',
      name: 'Alex Rivera',
      label: 'Student',
      icon: <UserCheck className="w-3.5 h-3.5 text-[#27866A]" />
    },
    {
      role: 'organizer',
      name: 'Maya Patel',
      label: 'Organizer',
      icon: <CalendarCheck className="w-3.5 h-3.5 text-[#FF6B4A]" />
    },
    {
      role: 'approver',
      name: 'Dean Vance',
      label: 'Approver',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-[#D99B16]" />
    },
    {
      role: 'admin',
      name: 'Campus Admin',
      label: 'Admin',
      icon: <Crown className="w-3.5 h-3.5 text-[#174C3C]" />
    }
  ];

  return (
    <div className="bg-[#174C3C] text-white text-xs py-1.5 px-4 border-b border-[#27866A]/40 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-wide uppercase text-[#F4C95D] flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#F4C95D] animate-pulse"></span>
          SYNESIS '26 Demo Bar:
        </span>
        <span className="text-[#FAF8F2]/80 hidden sm:inline">
          Test any campus role instantly:
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {roles.map(item => {
          const isActive = user?.role === item.role;
          return (
            <button
              key={item.role}
              onClick={() => switchDemoRole(item.role)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all ${
                isActive
                  ? 'bg-[#FAF8F2] text-[#174C3C] shadow-sm font-bold scale-102 ring-1 ring-[#F4C95D]'
                  : 'bg-[#27866A]/30 text-white/90 hover:bg-[#27866A]/60'
              }`}
              title={`Switch role to ${item.name} (${item.label})`}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4A]"></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
