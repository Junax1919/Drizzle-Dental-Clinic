import React, { useState } from 'react';
import { Dentist, Appointment, Patient } from '../types';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Pill, 
  Search, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { RealTimeClockBadge } from './RealTimeClockBadge';

interface DentistDashboardProps {
  dentists: Dentist[];
  appointments: Appointment[];
  patients: Patient[];
  onCompleteAppointment: (appointmentId: string, clinicalNotes?: string) => void;
  onUpdatePatientHistory: (patientId: string, note: string) => void;
  isSyncingSheets?: boolean;
  onSyncWithGoogleSheets?: () => void;
  lastSyncTime?: string;
}

export const DentistDashboard: React.FC<DentistDashboardProps> = ({
  dentists,
  appointments,
  patients,
  onCompleteAppointment,
  onUpdatePatientHistory,
  isSyncingSheets = false,
  onSyncWithGoogleSheets,
  lastSyncTime = 'Just now',
}) => {
  const [selectedDentistId, setSelectedDentistId] = useState<string>(dentists[0]?.id || 'doc-1');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [clinicalNoteInput, setClinicalNoteInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [treatmentSuccessMsg, setTreatmentSuccessMsg] = useState<string | null>(null);

  const currentDentist = dentists.find((d) => d.id === selectedDentistId) || dentists[0];
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Dentist's assigned appointments (matching ID or doctor name)
  const dentistAppointments = appointments.filter(
    (a) => a.dentistId === selectedDentistId || a.dentistName?.toLowerCase().includes(currentDentist.name.toLowerCase())
  );
  const patientPastAppointments = appointments.filter(
    (a) =>
      a.patientId === selectedPatient?.id ||
      a.patientName?.toLowerCase() === selectedPatient?.name.toLowerCase()
  );

  const handleSaveClinicalRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalNoteInput.trim()) return;

    onUpdatePatientHistory(
      selectedPatient.id,
      `[${new Date().toLocaleDateString()}] Treated by ${currentDentist.name}: ${clinicalNoteInput}. Prescriptions: ${prescriptionInput || 'None'}`
    );

    // If there is an active appointment for this patient with this dentist, mark completed
    const activeAppt = dentistAppointments.find(
      (a) => (a.patientName === selectedPatient.name || a.patientId === selectedPatient.id) && a.status === 'Approved'
    );
    if (activeAppt) {
      onCompleteAppointment(activeAppt.id, clinicalNoteInput);
    }

    setTreatmentSuccessMsg(`Clinical entry and prescription successfully saved for ${selectedPatient.name}`);
    setClinicalNoteInput('');
    setPrescriptionInput('');
    setTimeout(() => setTreatmentSuccessMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header with Doctor Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentDentist.avatar}
            alt={currentDentist.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
                Clinical Practitioner Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentDentist.room}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {currentDentist.name}, {currentDentist.title}
            </h1>
            <p className="text-xs text-slate-500">{currentDentist.specialization} • Drizzle Dental Clinic</p>
          </div>
        </div>

        {/* Doctor Switcher Dropdown, Live Clock & Google Sheets Sync */}
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
          <RealTimeClockBadge variant="header" showStatus={true} showSeconds={true} />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Switch Doctor:</span>
            <select
              value={selectedDentistId}
              onChange={(e) => setSelectedDentistId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {dentists.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.specialization})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {treatmentSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{treatmentSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Schedule + Right Patient Chart & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dentist Today's Schedule & Patient Picker */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned Schedule</h3>
                <p className="text-[11px] text-slate-400">{dentistAppointments.length} bookings for this practitioner</p>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
                Today
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {dentistAppointments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No appointments booked for this practitioner yet.
                </div>
              ) : (
                dentistAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => {
                      const matched = patients.find((p) => p.name === appt.patientName);
                      if (matched) setSelectedPatientId(matched.id);
                    }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      selectedPatient.name === appt.patientName
                        ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-500/30'
                        : 'border-slate-200/70 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{appt.timeSlot}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        appt.status === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                        appt.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {appt.status}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 mt-1.5">{appt.patientName}</div>
                    <div className="text-[11px] text-slate-500">{appt.serviceName} • {appt.serviceDuration}</div>
                    
                    {appt.notes && (
                      <div className="mt-1.5 text-[10px] text-slate-600 bg-white/70 p-1.5 rounded-lg border border-slate-100 italic">
                        "{appt.notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Patient Selector */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">All Clinic Patients</h3>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {patients.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                    selectedPatient.id === pat.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={pat.avatar} alt={pat.name} className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-bold leading-tight">{pat.name}</div>
                      <div className={`text-[10px] ${selectedPatient.id === pat.id ? 'text-slate-300' : 'text-slate-400'}`}>
                        {pat.code}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Patient Dental History, Odontogram & Clinical Notes */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Patient Overview Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {selectedPatient.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {selectedPatient.age} yrs • {selectedPatient.gender} • Blood: <span className="font-bold text-slate-700">{selectedPatient.bloodType || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Patient Alert Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                  selectedPatient.allergies.map((allergy, i) => (
                    <span key={i} className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Allergy: {allergy}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    No Known Drug Allergies
                  </span>
                )}
              </div>
            </div>

            {/* Medical Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                Clinical History & Examination Notes
              </span>
              <p className="text-slate-600 leading-relaxed">
                {selectedPatient.historySummary || 'No preliminary notes recorded for this patient.'}
              </p>
            </div>

            {/* Interactive Visual Dental Odontogram Representation */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Dental Chart (Universal Numbering 1 - 32)
                </span>
                <span className="text-[11px] text-slate-400">Click tooth to inspect clinical notations</span>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-slate-200/80 space-y-3">
                {/* Upper Arch */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Upper Maxillary Arch</div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center text-[10px]">
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((tooth) => {
                    const isNoted = selectedPatient.teethNotes?.some((t) => t.toothNumber === tooth);
                    return (
                      <div
                        key={tooth}
                        className={`p-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                          isNoted
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400'
                        }`}
                        title={isNoted ? `Tooth #${tooth}: Has clinical treatment noted` : `Tooth #${tooth}`}
                      >
                        <div className="text-[8px] text-slate-400">T</div>
                        <div>{tooth}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Lower Arch */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center pt-2">Lower Mandibular Arch</div>
                <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-center text-[10px]">
                  {[32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17].map((tooth) => {
                    const isNoted = selectedPatient.teethNotes?.some((t) => t.toothNumber === tooth);
                    return (
                      <div
                        key={tooth}
                        className={`p-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                          isNoted
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400'
                        }`}
                        title={isNoted ? `Tooth #${tooth}: Has clinical treatment noted` : `Tooth #${tooth}`}
                      >
                        <div className="text-[8px] text-slate-400">T</div>
                        <div>{tooth}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Treatment & Clinical Notes Entry Form */}
            <form onSubmit={handleSaveClinicalRecord} className="pt-2 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Add Clinical Visit Note & Prescription</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Procedure Done / Diagnosis / Doctor's Finding
                </label>
                <textarea
                  rows={2}
                  required
                  value={clinicalNoteInput}
                  onChange={(e) => setClinicalNoteInput(e.target.value)}
                  placeholder="e.g. Conducted ultrasonic scaling and polishing. Plaque score 12%. No active bleeding upon probing."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescription / Medications / Home Care Instructions
                </label>
                <input
                  type="text"
                  value={prescriptionInput}
                  onChange={(e) => setPrescriptionInput(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg TID x 7 days, Mefenamic Acid 500mg PRN for pain"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Clinical Record & Complete Visit</span>
                </button>
              </div>
            </form>

            {/* Visit History Log */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Past Visits & Treatment Records</h4>
              <div className="space-y-2">
                {patientPastAppointments.map((pa) => (
                  <div key={pa.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{pa.serviceName}</span>
                      <span className="text-slate-400 mx-2">•</span>
                      <span className="text-slate-600">{pa.date} ({pa.timeSlot})</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">With {pa.dentistName} ({pa.dentistRole})</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {pa.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
