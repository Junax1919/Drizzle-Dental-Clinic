import React, { useState } from 'react';
import { Patient, Appointment, TreatmentRecord } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  FileText, 
  Stethoscope, 
  ShieldAlert, 
  Heart, 
  Edit3, 
  X,
  Activity,
  UserCheck
} from 'lucide-react';

interface AdminPatientManagementProps {
  patients: Patient[];
  appointments: Appointment[];
  treatments: TreatmentRecord[];
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onOpenBookingForPatient: (patientName: string, patientEmail: string, patientPhone: string) => void;
  onToast: (msg: string) => void;
}

export const AdminPatientManagement: React.FC<AdminPatientManagementProps> = ({
  patients,
  appointments,
  treatments,
  onAddPatient,
  onUpdatePatient,
  onOpenBookingForPatient,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAllergy, setFilterAllergy] = useState<'all' | 'with-allergies'>('all');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);

  // Form state for adding/editing patient
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: 28,
    gender: 'Female',
    bloodType: 'O+',
    allergies: '',
    historySummary: '',
  });

  const filteredPatients = patients.filter((p) => {
    const matchesQuery = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAllergy = filterAllergy === 'all' || (p.allergies && p.allergies.length > 0);
    return matchesQuery && matchesAllergy;
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+63 ',
      age: 30,
      gender: 'Female',
      bloodType: 'O+',
      allergies: '',
      historySummary: '',
    });
    setIsEditingPatient(false);
    setIsAddPatientModalOpen(true);
  };

  const handleOpenEditModal = (patient: Patient) => {
    setFormData({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType || 'O+',
      allergies: (patient.allergies || []).join(', '),
      historySummary: patient.historySummary || '',
    });
    setIsEditingPatient(true);
    setIsAddPatientModalOpen(true);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter patient name');
      return;
    }

    const allergyList = formData.allergies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditingPatient && selectedPatient) {
      const updated: Patient = {
        ...selectedPatient,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        bloodType: formData.bloodType,
        allergies: allergyList,
        historySummary: formData.historySummary,
      };
      onUpdatePatient(updated);
      setSelectedPatient(updated);
      onToast(`✓ Updated profile for ${updated.name}`);
    } else {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        code: `PT-000${Math.floor(100 + Math.random() * 900)}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        age: Number(formData.age),
        gender: formData.gender,
        bloodType: formData.bloodType,
        allergies: allergyList,
        totalVisits: 1,
        lastVisit: 'New Patient',
        historySummary: formData.historySummary || 'Registered via Clinic Portal',
      };
      onAddPatient(newPatient);
      setSelectedPatient(newPatient);
      onToast(`✓ Registered new patient ${newPatient.name} (${newPatient.code})`);
    }

    setIsAddPatientModalOpen(false);
  };

  // Get patient's linked appointments and treatments
  const patientAppointments = selectedPatient
    ? appointments.filter((a) => a.patientId === selectedPatient.id || a.patientName === selectedPatient.name)
    : [];
  
  const patientTreatments = selectedPatient
    ? treatments.filter((t) => t.patientId === selectedPatient.id || t.patientName === selectedPatient.name)
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Patient Registry & Health Records</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Patient Management</h2>
          <p className="text-xs text-slate-500">
            Centralized hub for patient profiles, medical alerts, dental charts, and visit records.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Registered</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{patients.length}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Active Clinic Roster</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Medical Alerts / Allergies</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">
            {patients.filter((p) => p.allergies && p.allergies.length > 0).length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Special precaution tags</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active Treatment Plans</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{treatments.length}</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">Ongoing clinical cases</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Appointments Scheduled</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 mt-2">{appointments.length}</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Lifetime clinic visits</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Patient Code (e.g. PT-000124), phone number, or email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterAllergy('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterAllergy === 'all'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Patients ({patients.length})
          </button>
          <button
            onClick={() => setFilterAllergy('with-allergies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
              filterAllergy === 'with-allergies'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Has Allergies</span>
          </button>
        </div>
      </div>

      {/* Main Patients Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Patient Details</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Demographics</th>
                <th className="py-3.5 px-4">Medical Alerts</th>
                <th className="py-3.5 px-4">Visits & History</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No patients match your search query.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const hasAllergies = p.allergies && p.allergies.length > 0;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-teal-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedPatient(p)}
                    >
                      {/* Name & Code */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                              <span>{p.name}</span>
                              {hasAllergies && (
                                <span title="Allergy Alert" className="w-2 h-2 rounded-full bg-rose-500"></span>
                              )}
                            </div>
                            <div className="text-[10px] text-teal-700 font-mono font-bold">{p.code}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{p.email}</span>
                        </div>
                      </td>

                      {/* Demographics */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-semibold">{p.age} yrs • {p.gender}</div>
                        <div className="text-slate-500 text-[11px]">Blood: <span className="font-bold text-slate-700">{p.bloodType || 'Unknown'}</span></div>
                      </td>

                      {/* Allergies / Alert */}
                      <td className="py-3.5 px-4">
                        {hasAllergies ? (
                          <div className="flex flex-wrap gap-1">
                            {p.allergies!.map((all, i) => (
                              <span
                                key={i}
                                className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              >
                                ⚠ {all}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No known allergies</span>
                        )}
                      </td>

                      {/* Visits */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{p.totalVisits} visits logged</div>
                        <div className="text-slate-400 text-[10px]">Last: {p.lastVisit}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            title="View Full Patient Record"
                            onClick={() => setSelectedPatient(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            title="Schedule Appointment"
                            onClick={() => onOpenBookingForPatient(p.name, p.email, p.phone)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Drawer / Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto space-y-0">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0e7490] to-teal-800 p-6 text-white relative">
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-4">
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold text-white">{selectedPatient.name}</h3>
                    <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {selectedPatient.code}
                    </span>
                  </div>
                  <p className="text-teal-100 text-xs mt-0.5">
                    {selectedPatient.age} years old • {selectedPatient.gender} • Blood: {selectedPatient.bloodType || 'O+'}
                  </p>
                  <p className="text-teal-200 text-xs mt-1">
                    {selectedPatient.totalVisits} clinic visits • Last visit: {selectedPatient.lastVisit}
                  </p>
                </div>
              </div>

              {/* Quick Communication Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-white/15 text-xs">
                <a
                  href={`tel:${selectedPatient.phone}`}
                  className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors text-white font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {selectedPatient.phone}</span>
                </a>
                <a
                  href={`mailto:${selectedPatient.email}`}
                  className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors text-white font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                <button
                  onClick={() => handleOpenEditModal(selectedPatient)}
                  className="ml-auto bg-white text-teal-800 hover:bg-teal-50 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
              
              {/* Allergy / Medical Alert Notice */}
              {selectedPatient.allergies && selectedPatient.allergies.length > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900 text-sm">Medical Alert & Allergies</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {selectedPatient.allergies.map((a, i) => (
                        <span key={i} className="bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-md text-xs">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center space-x-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">No known medical allergies on record.</span>
                </div>
              )}

              {/* Medical & Dental History Summary */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Medical & Dental History</span>
                </h4>
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-slate-700 leading-relaxed">
                  {selectedPatient.historySummary || 'No preliminary notes recorded for this patient.'}
                </div>
              </div>

              {/* Teeth Notes / Conditions */}
              {selectedPatient.teethNotes && selectedPatient.teethNotes.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center space-x-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Teeth Condition Notes</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPatient.teethNotes.map((tn, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                        <div className="font-bold text-slate-900 text-xs">Tooth #{tn.toothNumber}</div>
                        <div className="text-teal-700 font-semibold text-[11px] mt-0.5">{tn.condition}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">{tn.treatment}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked Treatment Plans */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Treatment Plans ({patientTreatments.length})</span>
                </h4>
                {patientTreatments.length === 0 ? (
                  <div className="text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
                    No active or historical treatment plans recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientTreatments.map((t) => (
                      <div key={t.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{t.procedureName} ({t.toothNumber})</div>
                          <div className="text-[11px] text-slate-500">Dr. {t.dentistName} • Started: {t.dateStarted}</div>
                          <div className="text-[10px] text-teal-700 font-semibold mt-0.5">Est. Cost: ₱{t.estimatedCost.toLocaleString()}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Appointments */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>Appointment History ({patientAppointments.length})</span>
                </h4>
                {patientAppointments.length === 0 ? (
                  <div className="text-slate-400 p-3 bg-slate-50 rounded-xl text-center">
                    No appointments scheduled yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientAppointments.map((a) => (
                      <div key={a.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{a.serviceName} with {a.dentistName}</div>
                          <div className="text-[11px] text-slate-500">{a.date} at {a.timeSlot} • Ref: {a.referenceNo}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                          a.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          a.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedPatient(null);
                  onOpenBookingForPatient(selectedPatient.name, selectedPatient.email, selectedPatient.phone);
                }}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule New Appointment</span>
              </button>

              <button
                onClick={() => setSelectedPatient(null)}
                className="text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-teal-700 to-[#0e7490] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {isEditingPatient ? 'Edit Patient Profile' : 'Register New Patient'}
                </h3>
                <p className="text-teal-100 text-xs">
                  {isEditingPatient ? 'Update demographic and medical history details' : 'Store patient details, contact, and medical record'}
                </p>
              </div>
              <button
                onClick={() => setIsAddPatientModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sofia Ramirez"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sofia@example.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Blood Type</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Allergies / Drug Sensitivities (comma-separated)</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Latex, Aspirin (or leave blank)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Medical / Dental History Summary</label>
                <textarea
                  rows={3}
                  value={formData.historySummary}
                  onChange={(e) => setFormData({ ...formData, historySummary: e.target.value })}
                  placeholder="Record prior restorations, systemic conditions (hypertension, diabetes), or current oral symptoms..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                >
                  {isEditingPatient ? 'Save Changes' : 'Create Patient Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
