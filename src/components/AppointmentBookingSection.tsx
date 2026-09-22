import React, { useState } from 'react';
import { DentalService, Dentist, Appointment } from '../types';
import { BookingCalendar } from './BookingCalendar';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  Stethoscope,
  Building2,
  Check
} from 'lucide-react';

interface AppointmentBookingSectionProps {
  services: DentalService[];
  dentists: Dentist[];
  onBookAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  onNavigateToStaff?: () => void;
  onNavigateToPatient?: () => void;
}

export const AppointmentBookingSection: React.FC<AppointmentBookingSectionProps> = ({
  services,
  dentists,
  onBookAppointment,
  onNavigateToStaff,
  onNavigateToPatient,
}) => {
  // Booking state
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedDentistId, setSelectedDentistId] = useState<string>(dentists[0]?.id || '');
  
  // Default date to today or tomorrow
  const getInitialDate = () => {
    const d = new Date();
    // If today is Sunday, default to tomorrow Monday
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + 1);
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');

  // Patient details state
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [medicalAlerts, setMedicalAlerts] = useState<string>('');
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentDentist = dentists.find((d) => d.id === selectedDentistId) || dentists[0];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientEmail.trim() || !patientPhone.trim()) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);

    const refNo = `DRZ-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppt = onBookAppointment({
      referenceNo: refNo,
      patientId: `pat-${Date.now().toString().slice(-4)}`,
      patientName: patientName.trim(),
      patientEmail: patientEmail.trim(),
      patientPhone: patientPhone.trim(),
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
      medicalHistory: medicalAlerts,
      firstTime: isFirstTime,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedAppointment(newAppt);
    }, 400);
  };

  const handleReset = () => {
    setConfirmedAppointment(null);
    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setPatientNotes('');
    setMedicalAlerts('');
  };

  return (
    <section id="booking-section" className="py-20 bg-linear-to-b from-[#f8fafc] via-[#f0fdfa]/30 to-white relative overflow-hidden border-y border-teal-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#0e7490] uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online Patient Booking System</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Book Your Appointment with Calendar View
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Browse our interactive calendar to check available dates and time slots with our dental practitioners. Fill in your details below for instant clinic review.
          </p>
        </div>

        {/* Confirmed Pass Modal / View */}
        {confirmedAppointment ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border-2 border-teal-600 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-teal-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                Booking Request Registered
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Thank You, {confirmedAppointment.patientName}!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your appointment has been added to our clinic queue under reference code:
              </p>
              <div className="font-mono text-lg font-bold text-teal-800 bg-teal-50/80 py-2 px-4 rounded-xl inline-block mt-2 border border-teal-200">
                {confirmedAppointment.referenceNo}
              </div>
            </div>

            {/* Pass Summary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Service</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.serviceName}</span>
                <span className="text-slate-500 block text-[11px]">Duration: {confirmedAppointment.serviceDuration}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Attending Doctor</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.dentistName}</span>
                <span className="text-teal-700 block text-[11px]">{confirmedAppointment.dentistRole}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Confirmed Schedule</span>
                <span className="font-bold text-slate-900">{confirmedAppointment.date}</span>
                <span className="text-teal-700 font-semibold block">{confirmedAppointment.timeSlot}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status</span>
                <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px] mt-0.5">
                  <span>⏳ Pending Staff Review</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
              Our clinic receptionist (<span className="font-semibold text-slate-700">Maria Santos</span>) will verify doctor schedules and room sterilization. You will receive an SMS and email notification upon approval.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onNavigateToPatient && (
                <button
                  type="button"
                  onClick={onNavigateToPatient}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  View in Patient Portal & Pass
                </button>
              )}
              {onNavigateToStaff && (
                <button
                  type="button"
                  onClick={onNavigateToStaff}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Review as Staff (Maria Santos)
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-3 rounded-xl cursor-pointer transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        ) : (
          /* Main Two-Column Booking Interface: Left = Service/Doctor/Calendar; Right = Patient Fill-Up Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Doctor Selection, Service Selection & Visual Calendar View */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Service & Doctor Pickers */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Service */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      1. Select Dental Service
                    </label>
                    <select
                      id="select-booking-service"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.duration} • {s.priceEstimate})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-1">
                      {currentService.description}
                    </p>
                  </div>

                  {/* Select Dentist */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      2. Preferred Dentist
                    </label>
                    <select
                      id="select-booking-dentist"
                      value={selectedDentistId}
                      onChange={(e) => setSelectedDentistId(e.target.value)}
                      className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      {dentists.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} – {doc.specialization}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-teal-700 font-medium mt-1.5">
                      Available: {currentDentist.availableDays.join(', ')} ({currentDentist.room})
                    </p>
                  </div>
                </div>

                {/* Quick Doctor Summary Preview */}
                <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                  <img
                    src={currentDentist.avatar}
                    alt={currentDentist.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">{currentDentist.name}, {currentDentist.title}</div>
                    <div className="text-slate-500">{currentDentist.specialization} • {currentDentist.room}</div>
                  </div>
                </div>
              </div>

              {/* 3. Interactive Calendar View with Available Dates & Time Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Choose Available Date & Time Slot
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md">
                    Calendar View
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

            </div>

            {/* Right Column: Patient Fill-Up Form & Appointment Summary */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Form Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5 sticky top-20">
                <div>
                  <h3 className="text-base font-bold text-slate-900">4. Fill-Up Patient Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide your contact information to reserve this slot.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        id="booking-input-name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Maria Cruz"
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          id="booking-input-phone"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+63 917 123 4567"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">We will send SMS confirmation to this number</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          id="booking-input-email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="maria.cruz@example.com"
                          className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Medical history / Allergy Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Drug Allergies / Medical Conditions (Optional)
                    </label>
                    <input
                      type="text"
                      id="booking-input-allergies"
                      value={medicalAlerts}
                      onChange={(e) => setMedicalAlerts(e.target.value)}
                      placeholder="e.g. Penicillin allergy, Hypertension, none"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Reason for Visit */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Symptoms / Reason for Visit (Optional)
                    </label>
                    <textarea
                      rows={2}
                      id="booking-input-notes"
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      placeholder="e.g. Tooth sensitivity on lower right molar, routine dental check-up"
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* First Time Patient Checkbox */}
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none text-xs text-slate-700 pt-1">
                    <input
                      type="checkbox"
                      checked={isFirstTime}
                      onChange={(e) => setIsFirstTime(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span>I am a new / first-time patient at Drizzle Dental</span>
                  </label>

                  {/* Schedule Summary Box */}
                  <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-100 space-y-2 text-xs">
                    <div className="font-bold text-teal-900 flex items-center justify-between">
                      <span>Booking Summary</span>
                      <span className="font-mono text-[11px] text-teal-700">{currentService.priceEstimate}</span>
                    </div>
                    <div className="text-slate-700 space-y-1 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-semibold">{selectedDate}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-teal-800">{selectedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{currentDentist.name} ({currentDentist.room})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>123 Smile Street, Quezon City</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="btn-submit-calendar-booking"
                    disabled={isSubmitting}
                    className="w-full bg-[#0e7490] hover:bg-[#08637c] text-white py-3.5 px-4 rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Scheduling Appointment...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Book Appointment</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    🔒 No upfront payment required. Booking is reviewed by clinic staff.
                  </p>
                </form>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
