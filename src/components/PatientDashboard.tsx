import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  FileText, 
  Sparkles, 
  Phone, 
  XCircle, 
  Download,
  Share2,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { RealTimeClockBadge } from './RealTimeClockBadge';

interface PatientDashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  onOpenBookingModal: () => void;
  onCancelAppointment: (id: string) => void;
  isSyncingSheets?: boolean;
  onSyncWithGoogleSheets?: () => void;
  lastSyncTime?: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patients,
  appointments,
  onOpenBookingModal,
  onCancelAppointment,
  isSyncingSheets = false,
  onSyncWithGoogleSheets,
  lastSyncTime = 'Just now',
}) => {
  // Let patient switch profile or default to first patient (e.g. Aljune G. Quinones from Google Sheets)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  
  // Find all appointments for this patient
  const patientAppointments = appointments.filter(
    (a) =>
      a.patientId === currentPatient?.id ||
      a.patientName?.toLowerCase() === currentPatient?.name.toLowerCase() ||
      (currentPatient?.code && a.referenceNo && a.referenceNo.includes(currentPatient.code.replace('PT-', '')))
  );

  const latestAppointment = patientAppointments[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentPatient.avatar}
            alt={currentPatient.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
                Patient Self-Service Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentPatient.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Welcome back, {currentPatient.name}!
            </h1>
            <p className="text-xs text-slate-500">Track appointment status, dental passes & medical history</p>
          </div>
        </div>

        {/* Patient Switcher, Google Sheets Sync & Live Clock */}
        <div className="flex flex-wrap items-center gap-3">
          {onSyncWithGoogleSheets && (
            <button
              onClick={onSyncWithGoogleSheets}
              disabled={isSyncingSheets}
              title={`Google Sheets Connected. Click to re-fetch live records. Last synced: ${lastSyncTime}`}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/70 transition-all cursor-pointer shadow-2xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Google Sheets</span>
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 shrink-0 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            </button>
          )}
          <RealTimeClockBadge variant="header" showStatus={false} showSeconds={true} />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenBookingModal}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            + Book Appointment
          </button>
        </div>
      </div>

      {/* Main Grid: Active Appointment Pass & Status Tracker + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Appointment & Real-Time Approval Tracker */}
        <div className="lg:col-span-7 space-y-6">
          
          {latestAppointment ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
              
              {/* Header with status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Next Scheduled Visit
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {latestAppointment.serviceName}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-slate-500">{latestAppointment.referenceNo}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    latestAppointment.status === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                    latestAppointment.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                    latestAppointment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {latestAppointment.status === 'Pending' ? '⏳ Pending Staff Approval' :
                     latestAppointment.status === 'Approved' ? '✓ Approved & Confirmed' :
                     latestAppointment.status}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Bar for Approval */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-[11px] font-bold text-slate-700 mb-3">Booking Status Timeline</div>
                
                <div className="flex items-center justify-between text-xs relative">
                  {/* Line background */}
                  <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                  
                  {/* Step 1: Requested */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      ✓
                    </div>
                    <span className="font-bold text-slate-900 mt-1.5 text-[11px]">Request Sent</span>
                    <span className="text-[10px] text-slate-400">Online booking</span>
                  </div>

                  {/* Step 2: Staff Review & Approval */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      latestAppointment.status === 'Approved' || latestAppointment.status === 'Completed'
                        ? 'bg-teal-600 text-white'
                        : latestAppointment.status === 'Pending'
                        ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-300 text-white'
                    }`}>
                      {latestAppointment.status === 'Approved' || latestAppointment.status === 'Completed' ? '✓' : '2'}
                    </div>
                    <span className="font-bold text-slate-900 mt-1.5 text-[11px]">Staff Review</span>
                    <span className="text-[10px] text-slate-500">
                      {latestAppointment.status === 'Approved' ? 'Approved by Staff' :
                       latestAppointment.status === 'Pending' ? 'Reviewing in queue' : 'Cancelled'}
                    </span>
                  </div>

                  {/* Step 3: Check-in Ready */}
                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      latestAppointment.status === 'Approved' || latestAppointment.status === 'Completed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {latestAppointment.status === 'Completed' ? '✓' : '3'}
                    </div>
                    <span className="font-bold text-slate-900 mt-1.5 text-[11px]">Clinic Visit</span>
                    <span className="text-[10px] text-slate-400">Reception check-in</span>
                  </div>
                </div>

                {latestAppointment.status === 'Pending' && (
                  <div className="mt-4 p-2.5 bg-amber-100/50 rounded-xl text-[11px] text-amber-900 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Our clinic staff (Maria Santos) is currently verifying doctor room schedules. You will receive SMS/Email confirmation immediately upon approval.
                    </span>
                  </div>
                )}
              </div>

              {/* Appointment Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Doctor</div>
                  <div className="font-bold text-slate-900 text-sm">{latestAppointment.dentistName}</div>
                  <div className="text-teal-700 font-medium">{latestAppointment.dentistRole}</div>
                  <div className="text-slate-500 text-[11px] pt-1">Room: Suite 102 - Orthodontics</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Date & Schedule</div>
                  <div className="font-bold text-slate-900 text-sm">{latestAppointment.date}</div>
                  <div className="text-teal-700 font-medium">{latestAppointment.timeSlot} ({latestAppointment.serviceDuration})</div>
                  <div className="text-slate-500 text-[11px] pt-1">Duration: approx. {latestAppointment.serviceDuration}</div>
                </div>
              </div>

              {/* Clinic Location & Instructions */}
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-teal-900 font-bold">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <span>Drizzle Dental Clinic Location</span>
                </div>
                <p className="text-slate-600">
                  123 Smile Street, Quezon City, Philippines • Phone: +63 912 345 6789
                </p>
                <p className="text-[11px] text-slate-500">
                  * Please arrive 10 minutes before your scheduled appointment. Bring any past dental x-rays or current medication lists.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowCancelModal(latestAppointment.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Cancel or Reschedule
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert(`Downloaded Appointment Slip: ${latestAppointment.referenceNo}`)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Slip</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Active Appointments</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You do not have any pending or upcoming appointments scheduled right now.
              </p>
              <button
                onClick={onOpenBookingModal}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer"
              >
                Schedule Your Next Visit
              </button>
            </div>
          )}

          {/* Past Treatment Records */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Treatment History & Clinical Summary
            </h3>
            
            <div className="space-y-3">
              {patientAppointments.map((appt) => (
                <div key={appt.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{appt.serviceName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {appt.date} with {appt.dentistName}
                    </div>
                    {appt.notes && (
                      <div className="text-[11px] text-slate-600 mt-1 italic">
                        "{appt.notes}"
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    appt.status === 'Approved' ? 'bg-teal-50 text-teal-700' :
                    appt.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Digital Dental Pass / QR Check-in Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Digital Dental Pass */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/50 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight">Drizzle Dental Clinic</div>
                  <div className="text-[9px] text-teal-300 uppercase tracking-widest">Digital Patient Pass</div>
                </div>
              </div>

              <span className="font-mono text-xs text-teal-300 font-bold bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-800/50">
                {currentPatient.code}
              </span>
            </div>

            {/* QR Representation */}
            <div className="my-6 flex flex-col items-center text-center">
              <div className="bg-white p-3.5 rounded-2xl shadow-md border-2 border-teal-400/50">
                {/* Modern clean SVG QR representation */}
                <svg className="w-36 h-36 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  {/* Corners */}
                  <rect x="10" y="10" width="24" height="24" rx="4" />
                  <rect x="14" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="18" width="8" height="8" rx="1" />

                  <rect x="66" y="10" width="24" height="24" rx="4" />
                  <rect x="70" y="14" width="16" height="16" fill="white" rx="2" />
                  <rect x="74" y="18" width="8" height="8" rx="1" />

                  <rect x="10" y="66" width="24" height="24" rx="4" />
                  <rect x="14" y="70" width="16" height="16" fill="white" rx="2" />
                  <rect x="18" y="74" width="8" height="8" rx="1" />

                  {/* QR Data Matrix dots */}
                  <rect x="42" y="14" width="6" height="6" />
                  <rect x="52" y="14" width="6" height="6" />
                  <rect x="42" y="24" width="6" height="6" />
                  <rect x="52" y="28" width="6" height="6" />
                  <rect x="14" y="44" width="6" height="6" />
                  <rect x="24" y="44" width="6" height="6" />
                  <rect x="34" y="44" width="8" height="8" />
                  <rect x="48" y="44" width="6" height="6" />
                  <rect x="62" y="44" width="6" height="6" />
                  <rect x="74" y="44" width="8" height="8" />
                  <rect x="44" y="58" width="6" height="6" />
                  <rect x="56" y="58" width="6" height="6" />
                  <rect x="70" y="58" width="6" height="6" />
                  <rect x="42" y="72" width="8" height="8" />
                  <rect x="58" y="72" width="6" height="6" />
                  <rect x="74" y="72" width="6" height="6" />
                  <rect x="50" y="84" width="6" height="6" />
                  <rect x="68" y="84" width="6" height="6" />
                  <rect x="80" y="84" width="6" height="6" />
                </svg>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Scan at reception desk for instant check-in
              </p>
            </div>

            {/* Pass details */}
            <div className="space-y-2 text-xs border-t border-slate-700/60 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-white">{currentPatient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Phone:</span>
                <span className="font-medium text-slate-200">{currentPatient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Clinic Visits:</span>
                <span className="font-bold text-teal-400">{currentPatient.totalVisits} visits completed</span>
              </div>
            </div>
          </div>

          {/* Quick Dental Health Tips */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Dental Care Reminders</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>Brush twice daily with fluoridated toothpaste for at least 2 minutes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>Floss daily to prevent interdental plaque and tartar buildup.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                <span>Replace toothbrush every 3 months or after recovering from illness.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this booking? You can reschedule anytime.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setShowCancelModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                onClick={() => {
                  onCancelAppointment(showCancelModal);
                  setShowCancelModal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
