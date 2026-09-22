import React from 'react';
import { AppView } from '../types';
import { Globe, ShieldCheck, Stethoscope, User, FileCode2, Sparkles } from 'lucide-react';

interface RoleSwitcherProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  pendingCount: number;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentView,
  onViewChange,
  pendingCount,
}) => {
  const views: { id: AppView; label: string; icon: React.ReactNode; badge?: number; desc: string }[] = [
    {
      id: 'website',
      label: 'Public Website',
      icon: <Globe className="w-4 h-4" />,
      desc: 'Patient landing page & booking',
    },
    {
      id: 'admin',
      label: 'Staff & Admin Dashboard',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: pendingCount,
      desc: 'Approve bookings, metrics, calendar',
    },
    {
      id: 'dentist',
      label: 'Dentist Portal',
      icon: <Stethoscope className="w-4 h-4" />,
      desc: 'Patient charts, clinical notes & history',
    },
    {
      id: 'patient',
      label: 'Patient Portal',
      icon: <User className="w-4 h-4" />,
      desc: 'Booking status, QR pass, records',
    },
    {
      id: 'gas_guide',
      label: 'Google Apps Script & Sheets',
      icon: <FileCode2 className="w-4 h-4" />,
      desc: 'Full Prompt, Code.gs & Sheet Schema',
    },
  ];

  return (
    <div id="role-switcher-banner" className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left clinic branding badge */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Role Preview & Switcher</span>
            <p className="text-[11px] text-slate-400 hidden sm:block">Experience all interactive roles & Google Apps Script architecture</p>
          </div>
        </div>

        {/* View Switch Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {views.map((v) => {
            const isActive = currentView === v.id;
            return (
              <button
                key={v.id}
                id={`btn-switch-view-${v.id}`}
                onClick={() => onViewChange(v.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={v.desc}
              >
                {v.icon}
                <span className="whitespace-nowrap">{v.label}</span>
                {v.badge !== undefined && v.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'
                  }`}>
                    {v.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
