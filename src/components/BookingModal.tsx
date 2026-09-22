import React, { useState } from 'react';
import { DentalService, Dentist, Appointment } from '../types';
import { BookingCalendar } from './BookingCalendar';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: DentalService[];
  dentists: Dentist[];
  onBookAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  initialServiceId?: string;
  initialDentistId?: string;
  onNavigateToStaffReview?: () => void;
  onNavigateToPatientPortal?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  dentists,
  onBookAppointment,
  initialServiceId,
  initialDentistId,
  onNavigateToStaffReview,
  onNavigateToPatientPortal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || services[0]?.id || '');
  const [selectedDentistId, setSelectedDentistId] = useState<string>(initialDentistId || dentists[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  
  // Patient details
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [medicalHistory, setMedicalHistory] = useState<string>('');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  // Created appointment result
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '10:30 AM',
    '11:30 AM',
    '01:00 PM',
    '02:00 PM',
    '02:30 PM',
    '03:30 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  const availableDates = [
    { label: 'Today (Tue, Sep 16)', value: '2025-09-16' },
    { label: 'Tomorrow (Wed, Sep 17)', value: '2025-09-17' },
    { label: 'Thu, Sep 18', value: '2025-09-18' },
    { label: 'Fri, Sep 19', value: '2025-09-19' },
    { label: 'Sat, Sep 20', value: '2025-09-20' },
  ];

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentDentist = dentists.find((d) => d.id === selectedDentistId) || dentists[0];

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) return;

    const refNum = `DRZ-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppt = onBookAppointment({
      referenceNo: refNum,
      patientId: `pat-${Date.now().toString().slice(-4)}`,
      patientName,
      patientEmail,
      patientPhone,
      patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      dentistId: currentDentist.id,
      dentistName: currentDentist.name,
      dentistRole: currentDentist.specialization,
      dentistAvatar: currentDentist.avatar,
      serviceId: currentService.id,
      serviceName: currentService.name,
      serviceDuration: currentService.duration,
      date: selectedDate,
      timeSlot: selectedTime,
      notes: patientNotes,
      medicalHistory,
      firstTime: isFirstTime,
    });

    setCreatedAppointment(newAppt);
    setStep(4);
  };

  return (
    <div id="booking-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-teal-700 to-[#0e7490] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center space-x-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Appointment Booking Portal</span>
          </div>
          <h2 className="text-2xl font-bold mt-1 text-white">
            Schedule Your Dental Visit
          </h2>
          <p className="text-teal-100/80 text-xs mt-1">
            Gentle, personalized care with our experienced dental professionals.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center space-x-2 mt-5">
            {[
              { num: 1, label: 'Service' },
              { num: 2, label: 'Schedule' },
              { num: 3, label: 'Your Info' },
              { num: 4, label: 'Confirmation' },
            ].map((s) => (
              <div key={s.num} className="flex-1">
                <div className="flex items-center space-x-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step >= s.num ? 'bg-white text-teal-800' : 'bg-white/20 text-white/60'
                  }`}>
                    {s.num}
                  </div>
                  <span className={`text-[11px] font-medium hidden sm:inline ${
                    step >= s.num ? 'text-white' : 'text-teal-200/50'
                  }`}>
                    {s.label}
                  </span>
                </div>
                <div className={`h-1 rounded-full mt-1.5 ${
                  step >= s.num ? 'bg-teal-300' : 'bg-white/10'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Dental Service */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Select Treatment or Service</h3>
              <span className="text-xs text-slate-400">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedServiceId === srv.id
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">
                      {srv.category}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{srv.priceEstimate}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{srv.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                  <div className="mt-3 text-[11px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-teal-600" />
                    <span>Duration: approx. {srv.duration}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <span>Continue to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Doctor, Date & Time */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose Dentist & Time Slot</h3>
                <p className="text-xs text-slate-500">Service: {currentService.name} ({currentService.duration})</p>
              </div>
              <span className="text-xs text-slate-400">Step 2 of 3</span>
            </div>

            {/* Select Dentist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Dentist</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {dentists.slice(0, 3).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDentistId(doc.id)}
                    className={`p-3 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                      selectedDentistId === doc.id
                        ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{doc.name}</div>
                      <div className="text-[11px] text-teal-700 truncate">{doc.specialization}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar View with Available Dates & Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">Calendar View & Available Slots</label>
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold">
                  Live Availability
                </span>
              </div>
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                selectedTime={selectedTime}
                onSelectTime={(t) => setSelectedTime(t)}
                selectedDentist={currentDentist}
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <span>Enter Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Patient Information */}
        {step === 3 && (
          <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Your Contact & Health Info</h3>
              <span className="text-xs text-slate-400">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Maria Lopez"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +63 917 123 4567"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="e.g. maria.lopez@example.com (for appointment updates)"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="first-time-check"
                checked={isFirstTime}
                onChange={(e) => setIsFirstTime(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="first-time-check" className="text-xs text-slate-700 cursor-pointer">
                This is my first time visiting Drizzle Dental Clinic
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dental Concerns or Symptoms (Optional)</label>
              <textarea
                rows={2}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="e.g. Toothache on upper molar, sensitive to cold water..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Alerts / Allergies (Optional)</label>
              <input
                type="text"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Penicillin allergy, hypertension, asthma..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Clinic Booking Workflow Notice */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Staff Approval Required:</span> Upon submitting, your request will be reviewed and approved by clinic staff (Maria Santos) to prevent schedule overlap before final calendar confirmation.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                id="btn-confirm-booking-submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Request Appointment</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 4: Success & Confirmation */}
        {step === 4 && createdAppointment && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Status: Pending Staff Approval
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                Booking Request Submitted!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                Your appointment request has been recorded into the Drizzle Dental clinic schedule. Our staff will review your schedule slot shortly.
              </p>
            </div>

            {/* Reference ticket summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-teal-800 text-sm">{createdAppointment.referenceNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{createdAppointment.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{createdAppointment.serviceName} ({createdAppointment.serviceDuration})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dentist:</span>
                <span className="font-semibold text-slate-900">{createdAppointment.dentistName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-teal-700">{createdAppointment.date} at {createdAppointment.timeSlot}</span>
              </div>
            </div>

            {/* Google Sheets / Apps script sync status indicator */}
            <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-3 max-w-md mx-auto flex items-center space-x-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-teal-900">
                <span className="font-bold">Google Sheets Data Storage:</span> Ready to sync with Google Apps Script Webhook payload.
              </div>
            </div>

            {/* Quick Navigation CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onNavigateToStaffReview && (
                <button
                  type="button"
                  id="btn-goto-staff-approve"
                  onClick={() => {
                    onClose();
                    onNavigateToStaffReview();
                  }}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  Go to Staff Dashboard to Approve →
                </button>
              )}

              {onNavigateToPatientPortal && (
                <button
                  type="button"
                  id="btn-goto-patient-view"
                  onClick={() => {
                    onClose();
                    onNavigateToPatientPortal();
                  }}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  View in Patient Portal
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-700 py-2.5 px-3"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
