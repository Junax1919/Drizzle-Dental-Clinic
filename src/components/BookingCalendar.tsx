import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dentist } from '../types';

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  selectedDentist?: Dentist;
  className?: string;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  selectedDentist,
  className = '',
}) => {
  // Parse initial selectedDate or default to current / September 2025
  const initialDateObj = useMemo(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date();
  }, [selectedDate]);

  // Current calendar viewing month/year
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDateObj.getFullYear(), initialDateObj.getMonth(), 1)
  );

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onSelectDate(formatted);
  };

  // Build days for month
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0-11

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Reference for "today" to avoid booking past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate calendar cells
  interface CalendarCell {
    dayNum: number;
    dateString: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isPast: boolean;
    isSunday: boolean;
    isAvailable: boolean;
    availableSlotsCount: number;
  }

  // Doctor's available days mapping (e.g. 'Monday', 'Tuesday')
  const doctorDays = selectedDentist?.availableDays;

  const calendarDays = useMemo(() => {
    const days: CalendarCell[] = [];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isPast: true,
        isSunday: prevDate.getDay() === 0,
        isAvailable: false,
        availableSlotsCount: 0,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateObj = new Date(year, month, dayNum);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeekIndex = dateObj.getDay();
      const isSunday = dayOfWeekIndex === 0;
      const isPast = dateObj < today;

      // Check doctor availability if specified
      const dayNamesLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayNameLong = dayNamesLong[dayOfWeekIndex];
      
      let isDocWorking = true;
      if (doctorDays && doctorDays.length > 0) {
        isDocWorking = doctorDays.includes(dayNameLong);
      }

      // Clinic is open Monday to Saturday, closed Sundays
      const isAvailable = !isPast && !isSunday && isDocWorking;
      
      // Calculate mock available slots count (e.g. 4 to 8 slots available)
      const slotCount = isAvailable ? 5 + ((dayNum * 3) % 4) : 0;

      days.push({
        dayNum,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday: dateObj.getTime() === today.getTime(),
        isPast,
        isSunday,
        isAvailable,
        availableSlotsCount: slotCount,
      });
    }

    // Next month filler days to complete grid to 35 or 42
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNum: i,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isPast: false,
        isSunday: nextDate.getDay() === 0,
        isAvailable: false,
        availableSlotsCount: 0,
      });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex, daysInPrevMonth, today, doctorDays]);

  // Available Time Slots grouped by Morning and Afternoon
  const morningSlots = [
    { time: '09:00 AM', status: 'available' },
    { time: '09:30 AM', status: 'available' },
    { time: '10:00 AM', status: 'available' },
    { time: '10:30 AM', status: 'popular' },
    { time: '11:00 AM', status: 'available' },
    { time: '11:30 AM', status: 'available' },
  ];

  const afternoonSlots = [
    { time: '01:00 PM', status: 'available' },
    { time: '01:30 PM', status: 'available' },
    { time: '02:00 PM', status: 'popular' },
    { time: '02:30 PM', status: 'available' },
    { time: '03:30 PM', status: 'available' },
    { time: '04:00 PM', status: 'available' },
    { time: '04:30 PM', status: 'available' },
    { time: '05:00 PM', status: 'available' },
  ];

  // Formatted date display string
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return 'Please select a date';
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return selectedDate;
  }, [selectedDate]);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Calendar Header with Month Navigation */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {monthNames[month]} {year}
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedDentist ? `Available days for ${selectedDentist.name}` : 'Clinic open Mon – Sat'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleGoToday}
              className="text-[11px] font-semibold text-teal-700 hover:bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((day, idx) => (
            <div
              key={day}
              className={`py-1 text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 ? 'text-rose-400' : 'text-slate-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {calendarDays.map((cell, idx) => {
            const isSelected = cell.dateString === selectedDate;

            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={idx}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-300 text-xs select-none pointer-events-none opacity-40"
                >
                  {cell.dayNum}
                </div>
              );
            }

            if (cell.isSunday) {
              return (
                <div
                  key={idx}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-50/60 text-slate-400 text-xs border border-transparent select-none cursor-not-allowed group relative"
                  title="Clinic is closed on Sundays"
                >
                  <span className="font-medium text-slate-400">{cell.dayNum}</span>
                  <div className="text-[9px] text-rose-400 font-semibold tracking-tighter scale-90 sm:scale-100">
                    Closed
                  </div>
                </div>
              );
            }

            if (cell.isPast) {
              return (
                <div
                  key={idx}
                  className="p-2 sm:p-2.5 rounded-xl text-slate-300 text-xs select-none cursor-not-allowed opacity-50"
                  title="Past date"
                >
                  <span>{cell.dayNum}</span>
                </div>
              );
            }

            // Available working day
            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  if (cell.isAvailable) {
                    onSelectDate(cell.dateString);
                  }
                }}
                disabled={!cell.isAvailable}
                className={`p-1.5 sm:p-2 rounded-xl text-xs transition-all relative flex flex-col items-center justify-center cursor-pointer border ${
                  isSelected
                    ? 'bg-teal-700 text-white font-bold border-teal-700 shadow-md ring-2 ring-teal-500/30'
                    : cell.isAvailable
                    ? 'bg-white hover:bg-teal-50/60 text-slate-800 border-slate-200/80 hover:border-teal-400 shadow-2xs'
                    : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span className={isSelected ? 'font-extrabold text-white' : 'font-semibold'}>
                    {cell.dayNum}
                  </span>
                  {cell.isToday && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-300' : 'bg-teal-600'
                      }`}
                      title="Today"
                    />
                  )}
                </div>

                {cell.isAvailable ? (
                  <div className="mt-0.5 flex items-center space-x-0.5">
                    <span
                      className={`text-[9px] font-bold ${
                        isSelected ? 'text-teal-100' : 'text-teal-700'
                      }`}
                    >
                      {cell.availableSlotsCount} slots
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 mt-0.5">Off</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-700"></span>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-white border border-teal-400"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 text-slate-400"></span>
              <span>Closed / Past</span>
            </div>
          </div>

          <div className="text-teal-800 font-medium bg-teal-50 px-2 py-0.5 rounded-md">
            Selected: <span className="font-bold">{formattedSelectedDate}</span>
          </div>
        </div>
      </div>

      {/* Time Slots Section for Chosen Date */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Available Time Slots</h4>
              <p className="text-[11px] text-slate-400">{formattedSelectedDate}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
            {selectedTime ? `Selected: ${selectedTime}` : 'Pick a time slot'}
          </span>
        </div>

        {/* Morning slots */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span>Morning Sessions</span>
            <span className="h-px bg-slate-100 flex-1" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {morningSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  type="button"
                  key={slot.time}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center relative ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-500/30'
                      : 'bg-white hover:bg-teal-50/50 text-slate-700 border-slate-200/80 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  <div>{slot.time}</div>
                  {slot.status === 'popular' && (
                    <span
                      className={`text-[9px] block ${
                        isSelected ? 'text-teal-200' : 'text-teal-600'
                      }`}
                    >
                      Popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon slots */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span>Afternoon Sessions</span>
            <span className="h-px bg-slate-100 flex-1" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {afternoonSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  type="button"
                  key={slot.time}
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center relative ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm ring-2 ring-teal-500/30'
                      : 'bg-white hover:bg-teal-50/50 text-slate-700 border-slate-200/80 hover:border-teal-300 shadow-2xs'
                  }`}
                >
                  <div>{slot.time}</div>
                  {slot.status === 'popular' && (
                    <span
                      className={`text-[9px] block ${
                        isSelected ? 'text-teal-200' : 'text-teal-600'
                      }`}
                    >
                      Popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
