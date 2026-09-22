import React, { useState, useMemo } from 'react';
import { Appointment, Dentist, DentalService, AppointmentStatus } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Eye,
  Plus,
  BellRing,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  User,
  CalendarDays,
  Sparkles,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';

interface AdminAppointmentSchedulingProps {
  appointments: Appointment[];
  dentists: Dentist[];
  services: DentalService[];
  onApproveAppointment: (id: string) => void;
  onRejectAppointment: (id: string, reason?: string) => void;
  onCompleteAppointment: (id: string) => void;
  onOpenBookingModal: () => void;
  onToast: (msg: string) => void;
}

export const AdminAppointmentScheduling: React.FC<AdminAppointmentSchedulingProps> = ({
  appointments,
  dentists,
  services,
  onApproveAppointment,
  onRejectAppointment,
  onCompleteAppointment,
  onOpenBookingModal,
  onToast,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [dentistFilter, setDentistFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty means all dates

  // Automated reminder modal state
  const [reminderModalAppointment, setReminderModalAppointment] = useState<Appointment | null>(null);
  const [reminderChannel, setReminderChannel] = useState<'both' | 'sms' | 'whatsapp'>('both');
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  // Detail modal
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);

  // Dynamic real-time week timeline calculation
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekDays = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + weekOffset * 7);

    const days: { dateStr: string; dayName: string; formatted: string; isToday: boolean }[] = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 6; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = d.toDateString() === today.toDateString();
      days.push({
        dateStr,
        dayName: dayNames[i],
        formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday,
      });
    }
    return days;
  }, [weekOffset]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length < 6) return '';
    const first = weekDays[0];
    const last = weekDays[5];
    return `${first.formatted} – ${last.formatted}, ${new Date(first.dateStr).getFullYear()}`;
  }, [weekDays]);

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesDentist = dentistFilter === 'all' || a.dentistId === dentistFilter || a.dentistName.includes(dentistFilter);
    const matchesDate = !selectedDate || a.date === selectedDate;
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dentistName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesDentist && matchesDate && matchesSearch;
  });

  const handleSendReminder = (appt: Appointment) => {
    setIsSendingReminder(true);
    setTimeout(() => {
      setIsSendingReminder(false);
      setReminderModalAppointment(null);
      onToast(`✓ Automated reminder dispatched to ${appt.patientName} (${appt.patientPhone}) via ${reminderChannel === 'both' ? 'SMS & WhatsApp' : reminderChannel.toUpperCase()}!`);
    }, 900);
  };

  const handleSendBulkRemindersToday = () => {
    const todayApproved = appointments.filter((a) => a.status === 'Approved');
    onToast(`✓ Dispatched automated reminders to ${todayApproved.length} scheduled patients for today!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <CalendarDays className="w-4 h-4 text-teal-600" />
            <span>Appointment Scheduling & Reminders Engine</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Appointment Management</h2>
          <p className="text-xs text-slate-500">
            Schedule visits, track approval queues, manage doctor chairs, and send automated patient reminders.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleSendBulkRemindersToday}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-2"
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Remind Today's Patients</span>
          </button>

          <button
            onClick={onOpenBookingModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {/* 4 Status KPI Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-2">
            {appointments.filter((a) => a.status === 'Pending').length}
          </div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Requires staff approval</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Approved' ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400' : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-teal-700 text-xs font-semibold">
            <span>Confirmed / Approved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-800 mt-2">
            {appointments.filter((a) => a.status === 'Approved').length}
          </div>
          <div className="text-[11px] text-teal-600 font-bold mt-1">Ready for patient visit</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Completed' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400' : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>Completed Treatments</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">
            {appointments.filter((a) => a.status === 'Completed').length}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Successfully treated</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Cancelled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Cancelled' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400' : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Cancelled / Rescheduled</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800 mt-2">
            {appointments.filter((a) => a.status === 'Cancelled').length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Declined or patient cancelled</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, reference #, doctor, or treatment..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending ({appointments.filter(a => a.status === 'Pending').length})</option>
            <option value="Approved">Approved ({appointments.filter(a => a.status === 'Approved').length})</option>
            <option value="Completed">Completed ({appointments.filter(a => a.status === 'Completed').length})</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Dentist filter */}
          <select
            value={dentistFilter}
            onChange={(e) => setDentistFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Dentists</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Patient & Ref</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Assigned Dentist</th>
                  <th className="py-3.5 px-4">Dental Service</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No appointments match this criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Patient */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={appt.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={appt.patientName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{appt.patientName}</div>
                            <div className="text-[10px] text-teal-700 font-mono font-bold">{appt.referenceNo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{appt.date}</div>
                        <div className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{appt.timeSlot}</span>
                        </div>
                      </td>

                      {/* Dentist */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{appt.dentistName}</div>
                        <div className="text-[11px] text-slate-500">{appt.dentistRole}</div>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{appt.serviceName}</div>
                        <div className="text-[10px] text-teal-700 font-medium">{appt.serviceDuration}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {appt.status === 'Approved' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            Approved
                          </span>
                        )}
                        {appt.status === 'Pending' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                        {appt.status === 'Completed' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                        {appt.status === 'Cancelled' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Send Automated Reminder */}
                          <button
                            title="Send Automated Reminder"
                            onClick={() => setReminderModalAppointment(appt)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                          >
                            <BellRing className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick details */}
                          <button
                            title="View appointment details"
                            onClick={() => setDetailAppointment(appt)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Approve / Reject if Pending */}
                          {appt.status === 'Pending' && (
                            <>
                              <button
                                title="Approve Request"
                                onClick={() => {
                                  onApproveAppointment(appt.id);
                                  onToast(`✓ Approved appointment for ${appt.patientName}`);
                                }}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-bold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Decline Request"
                                onClick={() => {
                                  onRejectAppointment(appt.id);
                                  onToast(`Declined appointment request for ${appt.patientName}`);
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Mark Complete if Approved */}
                          {appt.status === 'Approved' && (
                            <button
                              title="Mark Treatment Completed"
                              onClick={() => {
                                onCompleteAppointment(appt.id);
                                onToast(`✓ Completed visit for ${appt.patientName}`);
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Schedule Matrix View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly Schedule Timeline</h3>
              <p className="text-xs text-slate-500">{weekRangeLabel}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                >
                  Current Week
                </button>
              )}
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {weekDays.map((dayObj) => {
              const dayAppts = appointments.filter((a) => a.date === dayObj.dateStr);
              return (
                <div
                  key={dayObj.dateStr}
                  className={`rounded-2xl p-3 border space-y-2 transition-all ${
                    dayObj.isToday
                      ? 'bg-teal-50/50 border-teal-300 ring-2 ring-teal-500/20'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="border-b border-slate-200/80 pb-2 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold ${dayObj.isToday ? 'text-teal-900' : 'text-slate-900'}`}>
                          {dayObj.dayName}
                        </span>
                        {dayObj.isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-teal-600 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{dayObj.formatted}</div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                      {dayAppts.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 min-h-[140px]">
                    {dayAppts.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic py-6 text-center">No bookings</div>
                    ) : (
                      dayAppts.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => setDetailAppointment(a)}
                          className="p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-teal-400 cursor-pointer transition-all text-[11px]"
                        >
                          <div className="font-bold text-teal-800 flex items-center justify-between">
                            <span>{a.timeSlot}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                a.status === 'Approved'
                                  ? 'bg-teal-500'
                                  : a.status === 'Pending'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <div className="font-semibold text-slate-900 truncate mt-0.5">{a.patientName}</div>
                          <div className="text-[10px] text-slate-500 truncate">{a.serviceName}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Automated Reminder Modal */}
      {reminderModalAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-teal-700 to-[#0e7490] p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BellRing className="w-5 h-5 text-teal-200" />
                <h3 className="text-base font-bold">Automated Patient Reminder</h3>
              </div>
              <button
                onClick={() => setReminderModalAppointment(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-3.5 space-y-1">
                <div className="text-slate-500 font-medium">Recipient Patient:</div>
                <div className="font-bold text-slate-900 text-sm">{reminderModalAppointment.patientName}</div>
                <div className="text-teal-700 font-mono">{reminderModalAppointment.patientPhone} • {reminderModalAppointment.patientEmail}</div>
                <div className="text-slate-600 text-[11px] pt-1">
                  Scheduled for: <span className="font-bold text-slate-900">{reminderModalAppointment.date} at {reminderModalAppointment.timeSlot}</span>
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Dispatch Channels:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderChannel('both')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      reminderChannel === 'both' ? 'bg-teal-700 text-white border-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    SMS & WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('sms')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      reminderChannel === 'sms' ? 'bg-teal-700 text-white border-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    SMS Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderChannel('whatsapp')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold cursor-pointer transition-colors ${
                      reminderChannel === 'whatsapp' ? 'bg-teal-700 text-white border-teal-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              {/* Message Template Preview */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Automated Notification Content:</label>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-slate-700 leading-relaxed font-mono text-[11px]">
                  "Hello {reminderModalAppointment.patientName}! 👋 This is an automated reminder from Drizzle Dental Clinic for your {reminderModalAppointment.serviceName} appointment on {reminderModalAppointment.date} at {reminderModalAppointment.timeSlot} with {reminderModalAppointment.dentistName}. Please reply YES to confirm or call us if you need to reschedule. See you soon!"
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReminderModalAppointment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSendingReminder}
                  onClick={() => handleSendReminder(reminderModalAppointment)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReminder ? 'Dispatching...' : 'Dispatch Automated Reminder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {detailAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden my-auto space-y-4 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Appointment Overview</span>
                <h3 className="text-lg font-bold text-slate-900">{detailAppointment.referenceNo}</h3>
              </div>
              <button
                onClick={() => setDetailAppointment(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Patient Details</div>
                <div className="font-bold text-slate-900 text-sm">{detailAppointment.patientName}</div>
                <div className="text-slate-600">{detailAppointment.patientPhone} • {detailAppointment.patientEmail}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Treatment & Provider</div>
                <div className="font-bold text-slate-900">{detailAppointment.serviceName} ({detailAppointment.serviceDuration})</div>
                <div className="text-teal-700 font-semibold">{detailAppointment.dentistName} • {detailAppointment.dentistRole}</div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Schedule</div>
                <div className="font-bold text-slate-900">{detailAppointment.date} at {detailAppointment.timeSlot}</div>
                <div className="text-[11px] font-semibold text-slate-600">Status: <span className="uppercase font-bold text-teal-700">{detailAppointment.status}</span></div>
              </div>

              {detailAppointment.notes && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Patient Notes</div>
                  <p className="text-slate-700">{detailAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const appt = detailAppointment;
                  setDetailAppointment(null);
                  setReminderModalAppointment(appt);
                }}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 cursor-pointer text-xs"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Send Reminder</span>
              </button>
              <button
                onClick={() => setDetailAppointment(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
