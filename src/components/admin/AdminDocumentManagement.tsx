import React, { useState, useRef } from 'react';
import { PatientDocument, Patient, Dentist, DocumentCategory } from '../../types';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  Image as ImageIcon,
  FolderOpen,
  Plus,
  X,
  FileCheck,
  Shield,
  Layers,
  ZoomIn,
  Calendar,
  User,
  Clock
} from 'lucide-react';

interface AdminDocumentManagementProps {
  documents: PatientDocument[];
  patients: Patient[];
  dentists: Dentist[];
  onAddDocument: (doc: PatientDocument) => void;
  onDeleteDocument: (id: string) => void;
  onToast: (msg: string) => void;
}

export const AdminDocumentManagement: React.FC<AdminDocumentManagementProps> = ({
  documents,
  patients,
  dentists,
  onAddDocument,
  onDeleteDocument,
  onToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | DocumentCategory>('All');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('X-Ray');
  const [formDentistName, setFormDentistName] = useState(dentists[0]?.name || 'Dr. Juan Dela Cruz');
  const [formNotes, setFormNotes] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState('2.4 MB');

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesPatient = selectedPatientId === 'all' || doc.patientId === selectedPatientId;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesPatient && matchesSearch;
  });

  const handleOpenUploadModal = () => {
    setFormPatientId(patients[0]?.id || '');
    setFormTitle('');
    setFormCategory('X-Ray');
    setFormDentistName(dentists[0]?.name || 'Dr. Juan Dela Cruz');
    setFormNotes('');
    setUploadedFileName('');
    setUploadedFilePreview(null);
    setUploadedFileSize('2.4 MB');
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFileSize(`${sizeMB} MB`);
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFilePreview(null);
      }
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a document title');
      return;
    }

    const patientObj = patients.find((p) => p.id === formPatientId);

    const defaultUrls: Record<DocumentCategory, string> = {
      'X-Ray': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
      'Lab Report': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      'Consent Form': 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
      'Treatment Plan': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
      'Prescription': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    };

    const newDoc: PatientDocument = {
      id: `doc-${Date.now()}`,
      patientId: formPatientId,
      patientName: patientObj ? patientObj.name : 'Maria Lopez',
      title: formTitle,
      category: formCategory,
      fileType: formCategory === 'X-Ray' ? 'image' : 'pdf',
      fileSize: uploadedFileSize,
      uploadedAt: new Date().toISOString().slice(0, 10),
      fileUrl: uploadedFilePreview || defaultUrls[formCategory],
      notes: formNotes || 'Secure patient record uploaded to clinic document archive.',
      dentistName: formDentistName,
    };

    onAddDocument(newDoc);
    setIsUploadModalOpen(false);
    onToast(`✓ Securely uploaded ${newDoc.title} for ${newDoc.patientName}`);
  };

  const handleDownloadSimulation = (doc: PatientDocument) => {
    onToast(`✓ Downloaded ${doc.title} (${doc.fileSize})`);
  };

  const categories: ('All' | DocumentCategory)[] = [
    'All',
    'X-Ray',
    'Lab Report',
    'Treatment Plan',
    'Consent Form',
    'Prescription',
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <FolderOpen className="w-4 h-4 text-teal-600" />
            <span>Encrypted Dental Vault & Radiograph Archive</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Document Management</h2>
          <p className="text-xs text-slate-500">
            Securely upload, organize, and inspect dental X-rays, CBCT scans, lab prescriptions, and consent forms.
          </p>
        </div>

        <button
          onClick={handleOpenUploadModal}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Files</span>
            <FolderOpen className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{documents.length}</div>
          <div className="text-[11px] text-teal-600 font-bold mt-1">Archived in HIPAA vault</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>X-Rays & Radiographs</span>
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">
            {documents.filter((d) => d.category === 'X-Ray').length}
          </div>
          <div className="text-[11px] text-blue-600 font-bold mt-1">OPG, CBCT, bitewings</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lab Reports</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {documents.filter((d) => d.category === 'Lab Report').length}
          </div>
          <div className="text-[11px] text-amber-600 font-bold mt-1">Crowns, aligners, biopsies</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Consent Forms</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {documents.filter((d) => d.category === 'Consent Form').length}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Signed patient waivers</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, patient name, category, or notes..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Patient dropdown filter */}
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Patients ({patients.length})</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
            No documents found matching this filter.
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Document Thumbnail / Preview header */}
              <div 
                onClick={() => setPreviewDoc(doc)}
                className="h-44 bg-slate-900 relative cursor-pointer overflow-hidden flex items-center justify-center group-hover:opacity-95 transition-opacity"
              >
                <img
                  src={doc.fileUrl}
                  alt={doc.title}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-md ${
                    doc.category === 'X-Ray' ? 'bg-blue-600/80' :
                    doc.category === 'Lab Report' ? 'bg-amber-600/80' :
                    doc.category === 'Consent Form' ? 'bg-emerald-600/80' : 'bg-teal-600/80'
                  }`}>
                    {doc.category}
                  </span>
                </div>

                {/* Inspect Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/90 text-slate-900 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-lg">
                    <ZoomIn className="w-3.5 h-3.5 text-teal-700" />
                    <span>Inspect</span>
                  </div>
                </div>

                {/* File size tag */}
                <div className="absolute bottom-2.5 right-3 text-white text-[10px] font-mono bg-black/50 px-2 py-0.5 rounded-md">
                  {doc.fileSize}
                </div>
              </div>

              {/* Document Meta Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {doc.title}
                  </h4>
                  <div className="text-[11px] text-teal-700 font-semibold mt-1">
                    Patient: {doc.patientName}
                  </div>
                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-400">
                    Uploaded: {doc.uploadedAt}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      title="Download Document"
                      onClick={() => handleDownloadSimulation(doc)}
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="View Details"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete Document"
                      onClick={() => {
                        if (confirm(`Delete document "${doc.title}"?`)) {
                          onDeleteDocument(doc.id);
                          onToast(`Removed document ${doc.title}`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox / Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-800 overflow-hidden my-auto text-white">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                  {previewDoc.category} • {previewDoc.fileSize}
                </div>
                <h3 className="text-base font-bold text-white">{previewDoc.title}</h3>
                <p className="text-slate-400 text-xs">
                  Patient: {previewDoc.patientName} • Uploaded on {previewDoc.uploadedAt}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadSimulation(previewDoc)}
                  className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Image / Canvas */}
            <div className="p-4 bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-h-[55vh] max-w-full object-contain rounded-lg border border-slate-800"
              />
            </div>

            {/* Notes & Provider footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Clinical Notes</div>
              <p className="text-slate-300 leading-relaxed">
                {previewDoc.notes || 'No specific clinical findings recorded for this image.'}
              </p>
              {previewDoc.dentistName && (
                <div className="text-teal-400 text-[11px] pt-1">
                  Verified by: {previewDoc.dentistName}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden my-auto">
            <div className="bg-gradient-to-r from-teal-700 to-[#0e7490] p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Secure Document Upload</h3>
                <p className="text-teal-100 text-xs">Add radiographs, lab results, or signed consent forms</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="p-6 space-y-4 text-xs">
              
              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs text-teal-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-xs">
                  {uploadedFileName ? (
                    <span className="text-teal-700">{uploadedFileName} ({uploadedFileSize})</span>
                  ) : (
                    <span>Click or Drag & Drop file here</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  Supports DICOM / JPG / PNG / PDF (Up to 25MB)
                </div>
              </div>

              {/* Patient and Category */}
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
                  <label className="font-semibold text-slate-700">Document Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="X-Ray">X-Ray / Panoramic</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Treatment Plan">Treatment Plan</option>
                    <option value="Consent Form">Consent Form</option>
                    <option value="Prescription">Prescription</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Full Mouth Radiograph (OPG)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Attending / Verifying Dentist</label>
                <select
                  value={formDentistName}
                  onChange={(e) => setFormDentistName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  {dentists.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Diagnostic Findings / Clinical Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Radiographic landmarks, bone level observations, or lab instructions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                >
                  Upload & Archive
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
