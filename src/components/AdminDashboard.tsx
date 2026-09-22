import React, { useState, useMemo } from 'react';
import { Appointment, Patient, Dentist, DentalService, ActivityItem, ClinicNotification, AppointmentStatus, TreatmentRecord, PatientDocument } from '../types';
import { 
  Search, 
  Bell, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  UserCheck, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Check, 
  X, 
  Edit3, 
  MoreVertical, 
  Filter, 
  LayoutDashboard, 
  CalendarDays, 
  UserSquare2, 
  Stethoscope, 
  HeartHandshake, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Plus,
  FolderOpen,
  Activity as ActivityIcon,
  Layers,
  FileText,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { AdminPatientManagement } from './admin/AdminPatientManagement';
import { AdminAppointmentScheduling } from './admin/AdminAppointmentScheduling';
import { AdminTreatmentTracking } from './admin/AdminTreatmentTracking';
import { AdminDocumentManagement } from './admin/AdminDocumentManagement';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { AdminDentistsView } from './admin/AdminDentistsView';
import { AdminServicesView } from './admin/AdminServicesView';
import { AdminNotificationsView } from './admin/AdminNotificationsView';
import { useRealTimeClock } from '../hooks/useRealTimeClock';
import { RealTimeClockBadge } from './RealTimeClockBadge';

interface AdminDashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  dentists: Dentist[];
  services: DentalService[];
  activity: ActivityItem[];
  notifications: ClinicNotification[];
  treatments?: TreatmentRecord[];
  documents?: PatientDocument[];
  onApproveAppointment: (id: string) => void;
  onRejectAppointment: (id: string, reason?: string) => void;
  onCompleteAppointment: (id: string) => void;
  onOpenBookingModal: () => void;
  onSelectPatient: (patientId: string) => void;
  onSelectDentist: (dentistId: string) => void;
  onAddPatient?: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onAddTreatment?: (record: TreatmentRecord) => void;
  onUpdateTreatment?: (record: TreatmentRecord) => void;
  onAddDocument?: (doc: PatientDocument) => void;
  onDeleteDocument?: (id: string) => void;
  isSyncingSheets?: boolean;
  onSyncWithGoogleSheets?: () => void;
  lastSyncTime?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  appointments,
  patients,
  dentists,
  services,
  activity,
  notifications,
  treatments = [],
  documents = [],
  onApproveAppointment,
  onRejectAppointment,
  onCompleteAppointment,
  onOpenBookingModal,
  onSelectPatient,
  onSelectDentist,
  onAddPatient,
  onUpdatePatient,
  onAddTreatment,
  onUpdateTreatment,
  onAddDocument,
  onDeleteDocument,
  isSyncingSheets = false,
  onSyncWithGoogleSheets,
  lastSyncTime = 'Just now',
}) => {
  const { greeting, now } = useRealTimeClock();
  const [activeSidebarTab, setActiveSidebarTab] = useState<string>('dashboard');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointmentForDetail, setSelectedAppointmentForDetail] = useState<Appointment | null>(null);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(() => new Date());
  const [selectedDateCalendar, setSelectedDateCalendar] = useState<number>(() => new Date().getDate());
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute live counts
  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const approvedAppointments = appointments.filter((a) => a.status === 'Approved');
  const completedAppointments = appointments.filter((a) => a.status === 'Completed');
  const cancelledAppointments = appointments.filter((a) => a.status === 'Cancelled');

  const serviceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    appointments.forEach((a) => {
      const s = a.serviceName || 'General Dentistry';
      counts[s] = (counts[s] || 0) + 1;
    });
    const colors = ['#0ea5e9', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    const total = appointments.length || 1;
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
      color: colors[idx % colors.length],
    }));
  }, [appointments]);

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSearch = 
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.dentistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleQuickApprove = (id: string, name: string) => {
    onApproveAppointment(id);
    showToast(`✓ Approved appointment for ${name}. Patient notified.`);
  };

  const handleQuickReject = (id: string, name: string) => {
    onRejectAppointment(id, 'Schedule conflict / clinic capacity');
    showToast(`Appointment declined for ${name}.`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-teal-500/30 flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar matching AdminDashboard.png */}
      <header className="bg-white border-b border-slate-200 sticky top-[41px] z-30 px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo left */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-bold text-slate-900 tracking-tight">Drizzle</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 ml-1.5 tracking-widest">Dental Clinic</span>
          </div>
        </div>

        {/* Global Search Bar matching inspiration */}
        <div className="flex-1 max-w-lg mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, appointments, or anything..."
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right tools: Google Sheets Sync, Notifications & Staff Profile */}
        <div className="flex items-center space-x-3">
          {/* Google Sheets Live Status & Sync Button */}
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

          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notification drop */}
            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] text-teal-600 font-semibold cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-50 mt-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg">
                      <div className="text-xs font-semibold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{n.description}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{n.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Maria Santos Staff Profile */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
              alt="Maria Santos"
              className="w-9 h-9 rounded-xl object-cover border border-teal-300 shadow-2xs"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">Maria Santos</div>
              <div className="text-[10px] text-teal-700 font-semibold">Staff & Reception</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar Navigation matching inspiration */}
        <aside className="w-60 bg-[#0f172a] text-slate-300 hidden lg:flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
              Menu Navigation
            </div>

            <button
              onClick={() => setActiveSidebarTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSidebarTab('appointments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'appointments'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <CalendarDays className="w-4 h-4" />
                <span>Appointments</span>
              </div>
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingAppointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('patients')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'patients'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>Patients</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {patients.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('treatments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'treatments'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ActivityIcon className="w-4 h-4" />
                <span>Treatment Plans</span>
              </div>
              <span className="bg-blue-600/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {treatments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('documents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'documents'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-4 h-4" />
                <span>Document Vault</span>
              </div>
              <span className="bg-teal-700/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'analytics' || activeSidebarTab === 'reports'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & KPIs</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('dentists')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'dentists'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Dentists</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('services')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'services'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Services & Fees</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('notifications')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSidebarTab === 'notifications'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </button>
          </div>

          {/* Bottom decorative tooth card matching inspiration */}
          <div className="bg-gradient-to-br from-[#0e7490] to-teal-900 rounded-2xl p-4 text-white border border-teal-700/50 shadow-sm mt-4">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
              </svg>
            </div>
            <div className="text-xs font-bold leading-tight">Healthy Smiles</div>
            <div className="text-[11px] text-teal-200/90 font-medium">Brighter Tomorrows.</div>
          </div>
        </aside>

        {/* Center Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Mobile Tab Navigation */}
          <div className="lg:hidden flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'appointments', label: `Appts (${pendingAppointments.length})`, icon: CalendarDays },
              { id: 'patients', label: `Patients (${patients.length})`, icon: Users },
              { id: 'treatments', label: `Treatments (${treatments.length})`, icon: ActivityIcon },
              { id: 'documents', label: `Vault (${documents.length})`, icon: FolderOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'dentists', label: 'Dentists', icon: Stethoscope },
              { id: 'services', label: 'Services', icon: Layers },
              { id: 'notifications', label: `Alerts (${notifications.length})`, icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    activeSidebarTab === tab.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conditional Rendering for Staff & Admin Modules */}
          {activeSidebarTab === 'appointments' ? (
            <AdminAppointmentScheduling
              appointments={appointments}
              dentists={dentists}
              services={services}
              onApproveAppointment={onApproveAppointment}
              onRejectAppointment={onRejectAppointment}
              onCompleteAppointment={onCompleteAppointment}
              onOpenBookingModal={onOpenBookingModal}
              onToast={showToast}
            />
          ) : activeSidebarTab === 'patients' ? (
            <AdminPatientManagement
              patients={patients}
              appointments={appointments}
              treatments={treatments}
              onAddPatient={onAddPatient || (() => {})}
              onUpdatePatient={onUpdatePatient || (() => {})}
              onOpenBookingForPatient={(name, email, phone) => {
                onOpenBookingModal();
              }}
              onToast={showToast}
            />
          ) : activeSidebarTab === 'treatments' ? (
            <AdminTreatmentTracking
              treatments={treatments}
              patients={patients}
              dentists={dentists}
              onAddTreatment={onAddTreatment || (() => {})}
              onUpdateTreatment={onUpdateTreatment || (() => {})}
              onToast={showToast}
            />
          ) : activeSidebarTab === 'documents' ? (
            <AdminDocumentManagement
              documents={documents}
              patients={patients}
              dentists={dentists}
              onAddDocument={onAddDocument || (() => {})}
              onDeleteDocument={onDeleteDocument || (() => {})}
              onToast={showToast}
            />
          ) : (activeSidebarTab === 'analytics' || activeSidebarTab === 'reports') ? (
            <AdminAnalytics
              appointments={appointments}
              patients={patients}
              dentists={dentists}
              services={services}
              treatments={treatments}
              onToast={showToast}
            />
          ) : activeSidebarTab === 'dentists' ? (
            <AdminDentistsView
              dentists={dentists}
              appointments={appointments}
              onSelectDentist={() => onSelectDentist('doc-1')}
            />
          ) : activeSidebarTab === 'services' ? (
            <AdminServicesView
              services={services}
              onOpenBooking={onOpenBookingModal}
            />
          ) : activeSidebarTab === 'notifications' ? (
            <AdminNotificationsView
              notifications={notifications}
              activity={activity}
            />
          ) : (
            <>
              {/* Welcome Header row matching inspiration */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    Staff & Reception Portal
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    {greeting}, Maria Santos!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Here's what's happening at Drizzle Dental Clinic today.
                  </p>
                </div>

            <div className="flex items-center space-x-3">
              <RealTimeClockBadge variant="header" showStatus={true} showSeconds={true} />

              <button
                onClick={onOpenBookingModal}
                className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-2xl shadow-sm flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Booking</span>
              </button>
            </div>
          </div>

          {/* 6 Metric Cards matching AdminDashboard.png */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* 1. Total Appointments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Total Bookings</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{appointments.length}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center space-x-0.5">
                <span>Live records</span>
              </div>
            </div>

            {/* 2. Pending Requests */}
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-amber-900">Pending Requests</div>
              <div className="text-2xl font-black text-amber-700 mt-1">{pendingAppointments.length}</div>
              <div className="text-[10px] text-amber-600 font-bold mt-1 flex items-center space-x-0.5">
                <span>{pendingAppointments.length > 0 ? 'Action needed' : 'All clear'}</span>
              </div>
            </div>

            {/* 3. Approved Appointments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Approved</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{approvedAppointments.length}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center space-x-0.5">
                <span>Confirmed visits</span>
              </div>
            </div>

            {/* 4. Completed Appointments */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Completed</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{completedAppointments.length}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center space-x-0.5">
                <span>Finished care</span>
              </div>
            </div>

            {/* 5. Cancelled / No Shows */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                <XCircle className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Cancelled / No Shows</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{cancelledAppointments.length}</div>
              <div className="text-[10px] text-slate-400 font-normal mt-1 flex items-center space-x-0.5">
                <span>{cancelledAppointments.length} cancelled</span>
              </div>
            </div>

            {/* 6. Total Patients */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-semibold text-slate-500">Total Patients</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{patients.length}</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-1 flex items-center space-x-0.5">
                <span>Google Sheets</span>
              </div>
            </div>

          </div>

          {/* Charts Row matching inspiration: Appointment Overview + Appointments by Service */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Chart: Appointment Overview Line Chart */}
            <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Appointment Overview</h3>
                  <p className="text-[11px] text-slate-400">Weekly patient visits trend</p>
                </div>
                <select className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden">
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              {/* Clean SVG Line Chart matching Inspiration */}
              <div className="w-full h-48 relative pt-4">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  {/* Grid horizontal lines */}
                  <line x1="20" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="20" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Left Axis numbers */}
                  <text x="5" y="24" fill="#94a3b8" fontSize="9">20</text>
                  <text x="5" y="64" fill="#94a3b8" fontSize="9">15</text>
                  <text x="5" y="104" fill="#94a3b8" fontSize="9">10</text>
                  <text x="5" y="144" fill="#94a3b8" fontSize="9">5</text>

                  {/* Shaded gradient area */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d="M 50 135 L 115 130 L 180 115 L 245 95 L 310 50 L 375 75 L 440 85 L 440 150 L 50 150 Z"
                    fill="url(#chartGradient)"
                  />

                  {/* Active Line */}
                  <path
                    d="M 50 135 L 115 130 L 180 115 L 245 95 L 310 50 L 375 75 L 440 85"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  {[
                    { x: 50, y: 135, val: 5, day: 'Mon', date: 'Sep 15' },
                    { x: 115, y: 130, val: 7, day: 'Tue', date: 'Sep 16' },
                    { x: 180, y: 115, val: 9, day: 'Wed', date: 'Sep 17' },
                    { x: 245, y: 95, val: 12, day: 'Thu', date: 'Sep 18' },
                    { x: 310, y: 50, val: 18, day: 'Fri', date: 'Sep 19' },
                    { x: 375, y: 75, val: 14, day: 'Sat', date: 'Sep 20' },
                    { x: 440, y: 85, val: 13, day: 'Sun', date: 'Sep 21' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="#ffffff"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                      />
                      <text x={pt.x} y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="600">
                        {pt.day}
                      </text>
                      <text x={pt.x} y="165" textAnchor="middle" fill="#94a3b8" fontSize="8">
                        {pt.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right Chart: Appointments by Service Donut Chart */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Appointments by Service</h3>
                <p className="text-[11px] text-slate-400">Distribution across treatments</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3">
                {/* Donut SVG */}
                <div className="sm:col-span-5 flex justify-center relative">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 transform -rotate-90">
                    <circle cx="50" cy="50" r="38" stroke="#0ea5e9" strokeWidth="12" fill="none" strokeDasharray="180 200" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="38" stroke="#3b82f6" strokeWidth="12" fill="none" strokeDasharray="60 200" strokeDashoffset="-180" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                    <span className="text-xl font-bold text-slate-900 leading-none">{appointments.length}</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="sm:col-span-7 space-y-1.5 text-xs">
                  {serviceDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 font-medium truncate max-w-[140px]">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {item.count} <span className="text-slate-400 font-normal">({item.percent}%)</span>
                      </span>
                    </div>
                  ))}
                  {serviceDistribution.length === 0 && (
                    <div className="text-slate-400 italic text-center py-2">No procedures recorded yet</div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Recent Appointment Requests Table with Approval Workflow matching AdminDashboard.png */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            
            {/* Header & Filter Tabs */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Appointment Requests</h3>
                <p className="text-xs text-slate-500">Staff review & approval queue for incoming clinic bookings</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('All')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'All' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setStatusFilter('Pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                    statusFilter === 'Pending' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pending</span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingAppointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter('Approved')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                    statusFilter === 'Approved' ? 'bg-white text-teal-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Approved</span>
                  <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {approvedAppointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter('Completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                    statusFilter === 'Completed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Completed</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {completedAppointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setStatusFilter('Cancelled')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                    statusFilter === 'Cancelled' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Cancelled</span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {cancelledAppointments.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Patient</th>
                    <th className="py-3 px-5">Dentist</th>
                    <th className="py-3 px-5">Service</th>
                    <th className="py-3 px-5">Date & Time</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No appointments found for this filter or search query.
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Patient */}
                        <td className="py-3 px-5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={appt.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                              alt={appt.patientName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{appt.patientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{appt.referenceNo}</div>
                            </div>
                          </div>
                        </td>

                        {/* Dentist */}
                        <td className="py-3 px-5">
                          <div className="font-semibold text-slate-900">{appt.dentistName}</div>
                          <div className="text-[10px] text-slate-500">{appt.dentistRole}</div>
                        </td>

                        {/* Service */}
                        <td className="py-3 px-5">
                          <div className="font-semibold text-slate-900">{appt.serviceName}</div>
                          <div className="text-[10px] text-teal-700 font-semibold">{appt.serviceDuration}</div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3 px-5">
                          <div className="text-slate-900 font-semibold">{appt.date}</div>
                          <div className="text-[10px] text-slate-500">{appt.timeSlot}</div>
                        </td>

                        {/* Status badge matching AdminDashboard.png */}
                        <td className="py-3 px-5">
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

                        {/* Actions matching AdminDashboard.png */}
                        <td className="py-3 px-5">
                          <div className="flex items-center justify-center space-x-1.5">
                            
                            {/* View Details Eye */}
                            <button
                              title="View Patient & Appointment Details"
                              onClick={() => setSelectedAppointmentForDetail(appt)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* If Pending: Quick Approve checkmark and Reject X */}
                            {appt.status === 'Pending' && (
                              <>
                                <button
                                  title="Approve Appointment (Staff)"
                                  onClick={() => handleQuickApprove(appt.id, appt.patientName)}
                                  className="w-7 h-7 rounded-lg text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer font-bold"
                                >
                                  <Check className="w-4 h-4" />
                                </button>

                                <button
                                  title="Decline / Reject Request"
                                  onClick={() => handleQuickReject(appt.id, appt.patientName)}
                                  className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* If Approved: Quick Mark Complete */}
                            {appt.status === 'Approved' && (
                              <button
                                title="Mark Treatment Completed"
                                onClick={() => {
                                  onCompleteAppointment(appt.id);
                                  showToast(`Marked ${appt.patientName}'s visit as Completed.`);
                                }}
                                className="w-7 h-7 rounded-lg text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit pencil */}
                            <button
                              title="Edit appointment"
                              onClick={() => setSelectedAppointmentForDetail(appt)}
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* More Options */}
                            <button
                              title="More options"
                              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredAppointments.length} of {appointments.length} total entries</span>
              <div className="flex items-center space-x-2">
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40">Previous</button>
                <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">Next</button>
              </div>
            </div>

          </div>
          </>
          )}

        </main>

        {/* Right Sidebar matching AdminDashboard.png */}
        {activeSidebarTab === 'dashboard' && (
        <aside className="w-80 bg-white border-l border-slate-200 p-5 space-y-6 hidden xl:block overflow-y-auto shrink-0">
          
          {/* Calendar Widget matching inspiration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Today's Appointments</h3>
              <span className="text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer flex items-center">
                View Calendar <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2.5">
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                  className="p-1 hover:bg-slate-200 rounded-md cursor-pointer transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold">
                  {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button 
                  onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                  className="p-1 hover:bg-slate-200 rounded-md cursor-pointer transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}
                {Array.from({ length: new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDateCalendar === day;
                  const isToday = 
                    day === now.getDate() && 
                    calendarViewDate.getMonth() === now.getMonth() && 
                    calendarViewDate.getFullYear() === now.getFullYear();

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDateCalendar(day)}
                      className={`h-7 rounded-lg text-[11px] font-semibold flex items-center justify-center relative transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white font-bold shadow-xs'
                          : isToday
                          ? 'bg-teal-100/70 text-teal-800 font-bold border border-teal-300'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      {day}
                      {isToday && !isSelected && (
                        <span className="w-1 h-1 bg-teal-600 rounded-full absolute bottom-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Appointments schedule timeline matching inspiration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upcoming Appointments</h3>
              <span className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">View All →</span>
            </div>

            <div className="space-y-2.5">
              {appointments.slice(0, 5).map((a) => (
                <div key={a.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-800">{a.timeSlot}</div>
                    <div className="text-xs font-semibold text-slate-900">{a.patientName}</div>
                    <div className="text-[10px] text-slate-500">{a.serviceName}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    a.status === 'Approved' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                    a.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed matching inspiration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
              <span className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer">View All →</span>
            </div>

            <div className="space-y-3">
              {activity.map((act) => (
                <div key={act.id} className="flex items-start space-x-2.5 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    act.type === 'approve' ? 'bg-teal-100 text-teal-600' :
                    act.type === 'request' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {act.type === 'approve' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     act.type === 'request' ? <Clock className="w-3.5 h-3.5" /> :
                     <UserCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-[11px] leading-tight">{act.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{act.actor} • {act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
        )}

      </div>

      {/* Appointment Details Modal */}
      {selectedAppointmentForDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Appointment Record</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedAppointmentForDetail.referenceNo}</h3>
              </div>
              <button
                onClick={() => setSelectedAppointmentForDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedAppointmentForDetail.patientName}</span>
                <span className="block text-slate-500 mt-0.5">{selectedAppointmentForDetail.patientPhone}</span>
                <span className="block text-slate-500">{selectedAppointmentForDetail.patientEmail}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dentist Assigned</span>
                <span className="font-bold text-slate-900 text-sm">{selectedAppointmentForDetail.dentistName}</span>
                <span className="block text-teal-700 font-medium">{selectedAppointmentForDetail.dentistRole}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{selectedAppointmentForDetail.serviceName} ({selectedAppointmentForDetail.serviceDuration})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled For:</span>
                <span className="font-bold text-teal-700">{selectedAppointmentForDetail.date} at {selectedAppointmentForDetail.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold uppercase tracking-wider">{selectedAppointmentForDetail.status}</span>
              </div>
            </div>

            {selectedAppointmentForDetail.notes && (
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Patient Concerns:</span>
                <p className="text-slate-600 bg-slate-50 p-2 rounded-xl mt-1">{selectedAppointmentForDetail.notes}</p>
              </div>
            )}

            {selectedAppointmentForDetail.medicalHistory && (
              <div className="text-xs">
                <span className="font-semibold text-rose-700">Medical Alert / Allergies:</span>
                <p className="text-rose-900 bg-rose-50 border border-rose-200 p-2 rounded-xl mt-1">{selectedAppointmentForDetail.medicalHistory}</p>
              </div>
            )}

            {/* Actions in detail modal */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              {selectedAppointmentForDetail.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleQuickReject(selectedAppointmentForDetail.id, selectedAppointmentForDetail.patientName);
                      setSelectedAppointmentForDetail(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => {
                      handleQuickApprove(selectedAppointmentForDetail.id, selectedAppointmentForDetail.patientName);
                      setSelectedAppointmentForDetail(null);
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                  >
                    Approve Appointment
                  </button>
                </>
              )}

              {selectedAppointmentForDetail.status === 'Approved' && (
                <button
                  onClick={() => {
                    onCompleteAppointment(selectedAppointmentForDetail.id);
                    setSelectedAppointmentForDetail(null);
                    showToast(`Marked ${selectedAppointmentForDetail.patientName}'s visit as Completed.`);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  Mark as Completed
                </button>
              )}

              <button
                onClick={() => setSelectedAppointmentForDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
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
