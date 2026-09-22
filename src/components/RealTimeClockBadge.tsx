import React from 'react';
import { useRealTimeClock } from '../hooks/useRealTimeClock';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface RealTimeClockBadgeProps {
  variant?: 'light' | 'dark' | 'compact' | 'header';
  showDate?: boolean;
  showSeconds?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const RealTimeClockBadge: React.FC<RealTimeClockBadgeProps> = ({
  variant = 'light',
  showDate = true,
  showSeconds = true,
  showStatus = false,
  className = '',
}) => {
  const { formattedFullDate, formattedShortDate, formattedTime, formattedTimeShort, isOpen, hoursStatus } =
    useRealTimeClock();

  const displayTime = showSeconds ? formattedTime : formattedTimeShort;

  if (variant === 'dark') {
    return (
      <div
        id="real-time-clock-dark"
        className={`flex items-center space-x-2 bg-slate-950/80 border border-slate-800/90 px-3 py-1.5 rounded-xl text-xs text-slate-200 shadow-xs ${className}`}
        title="Live System Time"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span className="font-mono font-bold tracking-tight text-white">{displayTime}</span>
        {showDate && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 hidden sm:inline text-[11px]">{formattedShortDate}</span>
          </>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        id="real-time-clock-compact"
        className={`inline-flex items-center space-x-1.5 text-xs text-slate-600 ${className}`}
      >
        <Clock className="w-3.5 h-3.5 text-teal-600" />
        <span className="font-mono font-semibold text-slate-800">{displayTime}</span>
      </div>
    );
  }

  // Default 'header' or 'light'
  return (
    <div
      id="real-time-clock-header"
      className={`bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl shadow-2xs flex items-center space-x-2 text-xs text-slate-600 ${className}`}
      title="Clinic Clock • Real Time"
    >
      <div className="relative flex h-2 w-2 mr-0.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
      </div>
      <CalendarIcon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
      {showDate && <span className="font-semibold text-slate-800">{formattedFullDate}</span>}
      {showDate && <span className="text-slate-400">•</span>}
      <div className="flex items-center space-x-1 font-mono font-bold text-slate-900">
        <Clock className="w-3 h-3 text-slate-400" />
        <span>{displayTime}</span>
      </div>
      {showStatus && (
        <span
          className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold border hidden lg:inline-flex items-center space-x-1 ${
            isOpen
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span>{hoursStatus}</span>
        </span>
      )}
    </div>
  );
};
