import { useState, useEffect } from 'react';

export interface RealTimeClockState {
  now: Date;
  formattedFullDate: string; // e.g. "Tuesday, September 22, 2026"
  formattedShortDate: string; // e.g. "Tue, Sep 22, 2026"
  formattedMonthYear: string; // e.g. "September 2026"
  formattedTime: string; // e.g. "06:59:14 AM"
  formattedTimeShort: string; // e.g. "6:59 AM"
  greeting: string; // "Good morning", "Good afternoon", "Good evening"
  dayName: string; // "Tuesday"
  dayNumber: number; // 22
  monthNumber: number; // 9
  year: number; // 2026
  isOpen: boolean; // Clinic is open
  hoursStatus: string; // "Open Today until 7:00 PM"
}

export function useRealTimeClock(): RealTimeClockState {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Update every second for smooth ticking
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const dayOfWeek = now.getDay(); // 0 = Sunday
  const hour = now.getHours();
  const minutes = now.getMinutes();

  // Clinic Schedule: Mon-Sat 8:00 AM - 7:00 PM, Sun 9:00 AM - 4:00 PM
  let isOpen = false;
  let hoursStatus = '';

  if (dayOfWeek === 0) {
    // Sunday
    isOpen = hour >= 9 && hour < 16;
    hoursStatus = isOpen ? 'Open Today until 4:00 PM' : 'Closed • Reopens Mon at 8:00 AM';
  } else {
    // Mon - Sat
    isOpen = hour >= 8 && hour < 19;
    hoursStatus = isOpen ? 'Open Today until 7:00 PM' : hour < 8 ? 'Opens at 8:00 AM' : 'Closed • Reopens Tomorrow at 8:00 AM';
  }

  // Greeting logic
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good evening';
  } else if (hour >= 22 || hour < 5) {
    greeting = 'Good evening';
  }

  const formattedFullDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedShortDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedMonthYear = now.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedTimeShort = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  return {
    now,
    formattedFullDate,
    formattedShortDate,
    formattedMonthYear,
    formattedTime,
    formattedTimeShort,
    greeting,
    dayName,
    dayNumber: now.getDate(),
    monthNumber: now.getMonth() + 1,
    year: now.getFullYear(),
    isOpen,
    hoursStatus,
  };
}
