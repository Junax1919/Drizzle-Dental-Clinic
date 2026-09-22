import React, { useState } from 'react';
import { TreatmentRecord, Patient, Dentist, TreatmentStatus } from '../../types';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Stethoscope,
  Pill,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ChevronRight,
  User,
  X,
  Sparkles,
  Tag,
  DollarSign
} from 'lucide-react';

interface AdminTreatmentTrackingProps {
  treatments: TreatmentRecord[];
  patients: Patient[];
  dentists: Dentist[];
  onAddTreatment: (record: TreatmentRecord) => void;
  onUpdateTreatment: (record: TreatmentRecord) => void;
  onToast: (msg: string) => void;
}

export const AdminTreatmentTracking: React.FC<AdminTreatmentTrackingProps> = ({
  treatments,
  patients,
  dentists,
  onAddTreatment,
  onUpdateTreatment,
  onToast,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | TreatmentStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProgressNote, setNewProgressNote] = useState('');

  // Form state
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || '');
  const [formDentistId, setFormDentistId] = useState(dentists[0]?.id || '');
  const [formProcedure, setFormProcedure] = useState('');
  const [formTooth, setFormTooth] = useState('Tooth #16');
  const [formDiagnosis, setFormDiagnosis] = useState('');
  const [formCost, setFormCost] = useState(3500);
  const [formStatus, setFormStatus] = useState<TreatmentStatus>('Planned');
  const [formPrescriptionText, setFormPrescriptionText] = useState('');
  const [formInitialNote, setFormInitialNote] = useState('');
  const [formFollowUp, setFormFollowUp] = useState('2025-09-30');

  const filteredTreatments = treatments.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.procedureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dentistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toothNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setFormPatientId(patients[0]?.id || '');
    setFormDentistId(dentists[0]?.id || '');
    setFormProcedure('');
    setFormTooth('Tooth #16');
    setFormDiagnosis('');
    setFormCost(3500);
    setFormStatus('Planned');
    setFormPrescriptionText('');
    setFormInitialNote('');
    setFormFollowUp('2025-09-30');
    setIsAddModalOpen(true);
  };

  const handleQuickAddPrescriptionTag = (med: string) => {
    if (!formPrescriptionText.includes(med)) {
      setFormPrescriptionText((prev) => (prev ? `${prev}, ${med}` : med));
    }
  };

  const handleCreateTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProcedure.trim()) {
      alert('Please specify the procedure name');
      return;
    }

    const patientObj = patients.find((p) => p.id === formPatientId);
    const dentistObj = dentists.find((d) => d.id === formDentistId);

    const prescriptions = formPrescriptionText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const progressNotes = formInitialNote.trim() ? [formInitialNote.trim()] : ['Treatment plan initialized in clinic records.'];

    const newRecord: TreatmentRecord = {
      id: `trt-${Date.now()}`,
      patientId: formPatientId,
      patientName: patientObj ? patientObj.name : 'Unknown Patient',
      dentistId: formDentistId,
      dentistName: dentistObj ? dentistObj.name : 'Attending Dentist',
      procedureName: formProcedure,
      toothNumber: formTooth,
      diagnosis: formDiagnosis || 'Clinical oral evaluation',
      status: formStatus,
      estimatedCost: Number(formCost),
      dateStarted: new Date().toISOString().slice(0, 10),
      nextFollowUp: formFollowUp,
      prescriptions,
      progressNotes,
    };

    onAddTreatment(newRecord);
    setSelectedTreatment(newRecord);
    setIsAddModalOpen(false);
    onToast(`✓ Created treatment plan: ${newRecord.procedureName} for ${newRecord.patientName}`);
  };

  const handleAddProgressNoteToSelected = () => {
    if (!selectedTreatment || !newProgressNote.trim()) return;

    const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedNote = `[${timestamp}] ${newProgressNote.trim()}`;

    const updated: TreatmentRecord = {
      ...selectedTreatment,
      progressNotes: [...selectedTreatment.progressNotes, formattedNote],
    };

    onUpdateTreatment(updated);
    setSelectedTreatment(updated);
    setNewProgressNote('');
    onToast('✓ Added clinical progress note to patient record');
  };

  const handleUpdateStatus = (status: TreatmentStatus) => {
    if (!selectedTreatment) return;
    const updated: TreatmentRecord = {
      ...selectedTreatment,
      status,
      dateCompleted: status === 'Completed' ? new Date().toISOString().slice(0, 10) : selectedTreatment.dateCompleted,
    };
    onUpdateTreatment(updated);
    setSelectedTreatment(updated);
    onToast(`✓ Treatment status updated to ${status}`);
  };

  // Metrics
  const totalCostValue = treatments.reduce((acc, t) => acc + t.estimatedCost, 0);
  const plannedCount = treatments.filter((t) => t.status === 'Planned').length;
  const inProgressCount = treatments.filter((t) => t.status === 'In Progress').length;
  const completedCount = treatments.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Clinical Records & Dental Procedures</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Treatment Plans & Records</h2>
          <p className="text-xs text-slate-500">
            Track patient treatment plans, operative notes, clinical tooth numbers, prescriptions, and stages.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Treatment Plan</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Value</span>
            <span className="text-teal-700 font-bold">₱</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₱{totalCostValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-teal-600 font-bold mt-1">Active procedure value</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{inProgressCount}</div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">Active patient cases</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Planned / Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{plannedCount}</div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Ready for appointment</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Completed Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{completedCount}</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Successfully finished</div>
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
            placeholder="Search by patient, procedure, tooth #, or doctor..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['All', 'Planned', 'In Progress', 'Completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Treatment Plans Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Patient & Provider</th>
                <th className="py-3.5 px-4">Procedure & Tooth</th>
                <th className="py-3.5 px-4">Diagnosis</th>
                <th className="py-3.5 px-4">Est. Cost</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTreatments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No treatment records found matching this query.
                  </td>
                </tr>
              ) : (
                filteredTreatments.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTreatment(t)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    {/* Patient & Doctor */}
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{t.patientName}</div>
                      <div className="text-[11px] text-teal-700 font-medium flex items-center space-x-1 mt-0.5">
                        <Stethoscope className="w-3 h-3 text-teal-600" />
                        <span>{t.dentistName}</span>
                      </div>
                    </td>

                    {/* Procedure */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{t.procedureName}</div>
                      <div className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                        {t.toothNumber}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="text-slate-600 truncate">{t.diagnosis}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Started: {t.dateStarted}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₱{t.estimatedCost.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        t.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTreatment(t);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Clinical Record
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Treatment Record Detail Modal */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-auto space-y-0">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-800 to-[#0e7490] p-6 text-white relative">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-[10px] uppercase font-bold tracking-widest text-teal-200 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Dental Treatment Record</span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">{selectedTreatment.procedureName}</h3>
              <p className="text-teal-100 text-xs mt-0.5">
                Patient: <span className="font-bold text-white">{selectedTreatment.patientName}</span> • Attending: <span className="font-bold text-white">{selectedTreatment.dentistName}</span>
              </p>

              {/* Status and Cost Badges */}
              <div className="flex items-center space-x-3 mt-4 text-xs font-semibold">
                <div className="bg-white/20 px-3 py-1 rounded-xl">
                  {selectedTreatment.toothNumber}
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-xl font-bold">
                  Cost: ₱{selectedTreatment.estimatedCost.toLocaleString()}
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedTreatment.status === 'Completed' ? 'bg-emerald-400 text-slate-900' :
                    selectedTreatment.status === 'In Progress' ? 'bg-blue-400 text-slate-900' :
                    'bg-amber-300 text-slate-900'
                  }`}>
                    {selectedTreatment.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto text-xs">
              
              {/* Diagnosis */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Clinical Diagnosis</div>
                <div className="font-bold text-slate-900 text-sm mt-1">{selectedTreatment.diagnosis}</div>
                <div className="text-slate-500 text-[11px] mt-1">
                  Started: {selectedTreatment.dateStarted} • Next Review: {selectedTreatment.nextFollowUp || 'Not scheduled'}
                </div>
              </div>

              {/* Prescriptions */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Prescriptions & Medications</span>
                </h4>
                {selectedTreatment.prescriptions.length === 0 ? (
                  <div className="text-slate-400 p-3 bg-slate-50 rounded-xl">No medications prescribed.</div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedTreatment.prescriptions.map((rx, i) => (
                      <div key={i} className="p-2.5 bg-teal-50/60 border border-teal-100 rounded-xl text-teal-900 font-semibold flex items-center space-x-2">
                        <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{rx}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chronological Progress Notes */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>Clinical Progress Notes & Operative Log</span>
                </h4>
                <div className="space-y-2">
                  {selectedTreatment.progressNotes.map((note, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-700 leading-relaxed font-sans">
                      {note}
                    </div>
                  ))}
                </div>

                {/* Add new progress note inline */}
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    value={newProgressNote}
                    onChange={(e) => setNewProgressNote(e.target.value)}
                    placeholder="Enter new clinical progress note, shade test, or adjustment log..."
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddProgressNoteToSelected}
                      disabled={!newProgressNote.trim()}
                      className="bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-xl cursor-pointer text-xs transition-colors"
                    >
                      Add Note to Record
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Switcher Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Update Case Status:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus('Planned')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                      selectedTreatment.status === 'Planned' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Planned
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('In Progress')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                      selectedTreatment.status === 'In Progress' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Completed')}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                      selectedTreatment.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedTreatment(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer text-xs"
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Treatment Plan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-teal-700 to-[#0e7490] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">New Treatment Plan & Record</h3>
                <p className="text-teal-100 text-xs">Record dental procedure, tooth number, prescriptions, and prognosis</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTreatment} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Patient *</label>
                  <select
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Treating Dentist *</label>
                  <select
                    value={formDentistId}
                    onChange={(e) => setFormDentistId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Procedure Name *</label>
                  <input
                    type="text"
                    required
                    value={formProcedure}
                    onChange={(e) => setFormProcedure(e.target.value)}
                    placeholder="e.g. Root Canal Therapy"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tooth Number / Area</label>
                  <input
                    type="text"
                    value={formTooth}
                    onChange={(e) => setFormTooth(e.target.value)}
                    placeholder="e.g. Tooth #16 or Upper Arch"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinical Diagnosis</label>
                <input
                  type="text"
                  value={formDiagnosis}
                  onChange={(e) => setFormDiagnosis(e.target.value)}
                  placeholder="e.g. Irreversible Pulpitis, Class II Fracture"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Est. Cost (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as TreatmentStatus)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Follow-up Date</label>
                  <input
                    type="date"
                    value={formFollowUp}
                    onChange={(e) => setFormFollowUp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Prescriptions input with quick buttons */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Prescribed Medications</label>
                <input
                  type="text"
                  value={formPrescriptionText}
                  onChange={(e) => setFormPrescriptionText(e.target.value)}
                  placeholder="e.g. Amoxicillin 500mg, Mefenamic Acid 500mg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold self-center">Quick add:</span>
                  {[
                    'Amoxicillin 500mg (1 cap TID x 7d)',
                    'Mefenamic Acid 500mg (PRN pain)',
                    'Chlorhexidine 0.12% Oral Rinse',
                    'Paracetamol 500mg',
                  ].map((med, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickAddPrescriptionTag(med)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      + {med.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Initial Progress / Operative Note</label>
                <textarea
                  rows={2}
                  value={formInitialNote}
                  onChange={(e) => setFormInitialNote(e.target.value)}
                  placeholder="Record initial findings, anesthesia administered, materials used..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                >
                  Save Treatment Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
