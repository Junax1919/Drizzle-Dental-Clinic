import React, { useState, useEffect } from 'react';
import { 
  Appointment, 
  Patient, 
  Dentist, 
  DentalService, 
  Testimonial, 
  ActivityItem, 
  ClinicNotification, 
  AppView,
  TreatmentRecord,
  PatientDocument
} from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_DENTISTS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_ACTIVITY, 
  INITIAL_NOTIFICATIONS,
  INITIAL_TREATMENTS,
  INITIAL_DOCUMENTS
} from './data/mockData';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PublicWebsite } from './components/PublicWebsite';
import { AdminDashboard } from './components/AdminDashboard';
import { DentistDashboard } from './components/DentistDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { BookingModal } from './components/BookingModal';
import { GasIntegrationStudio } from './components/GasIntegrationStudio';
import { fetchLiveGoogleSheetsData } from './services/sheetsDataService';

// Helper to filter out dummy or sample records
const isDummyRecord = (id: string, name?: string) => {
  const dummyIds = new Set([
    'apt-1', 'apt-2', 'apt-3', 'apt-4', 'apt-5', 'apt-6', 'apt-7', 'apt-8', 'apt-9',
    'pat-1', 'pat-2', 'pat-3', 'pat-4', 'pat-5', 'pat-6'
  ]);
  const dummyNames = new Set([
    'maria lopez', 'john dela cruz', 'ana santos', 'luis garcia', 'grace villanueva', 'pedro reyes'
  ]);
  if (dummyIds.has(id)) return true;
  if (name && dummyNames.has(name.trim().toLowerCase())) return true;
  return false;
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('website');
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Persistence in localStorage, strictly keeping ONLY actual records from Google Sheets
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const actualSaved = parsed.filter(
            (a: any) => !isDummyRecord(a.id, a.patientName)
          );
          if (actualSaved.length > 0) {
            const existingIds = new Set(actualSaved.map((a: any) => a.id));
            const existingRefs = new Set(actualSaved.map((a: any) => a.referenceNo));
            const missingRealRecords = INITIAL_APPOINTMENTS.filter(
              (a) => !existingIds.has(a.id) && !existingRefs.has(a.referenceNo)
            );
            return [...missingRealRecords, ...actualSaved];
          }
        }
      } catch (e) {
        console.warn('Error parsing saved appointments:', e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_patients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const actualSaved = parsed.filter(
            (p: any) => !isDummyRecord(p.id, p.name)
          );
          if (actualSaved.length > 0) {
            const existingIds = new Set(actualSaved.map((p: any) => p.id));
            const existingNames = new Set(actualSaved.map((p: any) => p.name?.toLowerCase()));
            const missingRealPatients = INITIAL_PATIENTS.filter(
              (p) => !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase())
            );
            return [...missingRealPatients, ...actualSaved];
          }
        }
      } catch (e) {
        console.warn('Error parsing saved patients:', e);
      }
    }
    return INITIAL_PATIENTS;
  });

  const [dentists] = useState<Dentist[]>(INITIAL_DENTISTS);
  const [services] = useState<DentalService[]>(INITIAL_SERVICES);

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [activity, setActivity] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_activity');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (item: any) =>
              !['Maria Lopez', 'John Dela Cruz', 'Ana Santos', 'Luis Garcia', 'Pedro Reyes'].some((name) =>
                item.title?.includes(name) || item.subtitle?.includes(name)
              )
          );
          if (valid.length > 0) return valid;
        }
      } catch (e) {
        console.warn('Error parsing activity:', e);
      }
    }
    return INITIAL_ACTIVITY;
  });

  const [notifications, setNotifications] = useState<ClinicNotification[]>(INITIAL_NOTIFICATIONS);

  const [treatments, setTreatments] = useState<TreatmentRecord[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_treatments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((t: any) => !isDummyRecord(t.patientId, t.patientName));
          if (valid.length > 0) return valid;
        }
      } catch (e) {
        console.warn('Error parsing treatments:', e);
      }
    }
    return INITIAL_TREATMENTS;
  });

  const [documents, setDocuments] = useState<PatientDocument[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((d: any) => !isDummyRecord(d.patientId, d.patientName));
          if (valid.length > 0) return valid;
        }
      } catch (e) {
        console.warn('Error parsing documents:', e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPreselectedServiceId, setBookingPreselectedServiceId] = useState<string | undefined>();
  const [bookingPreselectedDentistId, setBookingPreselectedDentistId] = useState<string | undefined>();

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('drizzle_dental_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('drizzle_dental_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('drizzle_dental_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('drizzle_dental_activity', JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    localStorage.setItem('drizzle_dental_treatments', JSON.stringify(treatments));
  }, [treatments]);

  useEffect(() => {
    localStorage.setItem('drizzle_dental_documents', JSON.stringify(documents));
  }, [documents]);

  // Live Google Sheets Data Synchronization
  const handleSyncWithGoogleSheets = async () => {
    setIsSyncingSheets(true);
    try {
      const res = await fetchLiveGoogleSheetsData();
      if (res.success && res.appointments.length > 0) {
        setAppointments((prev) => {
          const liveIds = new Set(res.appointments.map((a) => a.id));
          const liveRefs = new Set(res.appointments.map((a) => a.referenceNo));
          const nonConflicting = prev.filter(
            (a) => !liveIds.has(a.id) && !liveRefs.has(a.referenceNo) && !isDummyRecord(a.id, a.patientName)
          );
          return [...res.appointments, ...nonConflicting];
        });

        setPatients((prev) => {
          const livePatIds = new Set(res.patients.map((p) => p.id));
          const livePatNames = new Set(res.patients.map((p) => p.name?.toLowerCase()));
          const nonConflicting = prev.filter(
            (p) => !livePatIds.has(p.id) && !livePatNames.has(p.name?.toLowerCase()) && !isDummyRecord(p.id, p.name)
          );
          return [...res.patients, ...nonConflicting];
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      }
    } catch (err) {
      console.warn('Google Sheets live fetch warning:', err);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  useEffect(() => {
    handleSyncWithGoogleSheets();
    const timer = setInterval(() => {
      handleSyncWithGoogleSheets();
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  // Open booking modal helper
  const handleOpenBooking = (serviceId?: string, dentistId?: string) => {
    setBookingPreselectedServiceId(serviceId);
    setBookingPreselectedDentistId(dentistId);
    setIsBookingOpen(true);
  };

  // Create appointment
  const handleCreateAppointment = (
    data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ): Appointment => {
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Check if patient exists, or create new patient record
    setPatients((prev) => {
      const exists = prev.find((p) => p.name.toLowerCase() === data.patientName.toLowerCase());
      if (!exists) {
        const newPat: Patient = {
          id: data.patientId,
          code: `PT-000${Math.floor(130 + Math.random() * 800)}`,
          name: data.patientName,
          email: data.patientEmail,
          phone: data.patientPhone,
          avatar: data.patientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          age: 30,
          gender: 'Not specified',
          totalVisits: 1,
          lastVisit: 'New Booking',
          historySummary: data.notes || 'First appointment booked online',
          allergies: data.medicalHistory ? [data.medicalHistory] : [],
        };
        return [newPat, ...prev];
      }
      return prev;
    });

    // Add activity
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `New appointment request from ${data.patientName}`,
      subtitle: `${data.serviceName} with ${data.dentistName} (Pending review)`,
      timestamp: 'Just now',
      actor: 'Patient Online Booking',
      type: 'request',
    };
    setActivity((prev) => [newActivity, ...prev]);

    // Automatic Real-Time Sync to Google Apps Script / Google Sheets
    const gasWebhook = localStorage.getItem('drizzle_gas_webhook_url') || 'https://script.google.com/macros/s/AKfycbwNAfiMm4EggvNQvF5eVwZ9QWUXtM-Oxisk1nfxTAp6I4Sj95YbDKxf3uCBqKSpe0c/exec';
    if (gasWebhook) {
      fetch(gasWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_appointment',
          referenceNo: newAppointment.referenceNo,
          patientId: newAppointment.patientId,
          patientName: newAppointment.patientName,
          patientEmail: newAppointment.patientEmail,
          patientPhone: newAppointment.patientPhone,
          dentistId: newAppointment.dentistId,
          dentistName: newAppointment.dentistName,
          serviceName: newAppointment.serviceName,
          date: newAppointment.date,
          timeSlot: newAppointment.timeSlot,
          notes: newAppointment.notes,
          medicalAlerts: newAppointment.medicalHistory,
        }),
      }).catch((err) => console.warn('Google Sheets sync warning:', err));
    }

    return newAppointment;
  };

  // Approve appointment (Staff Maria Santos action)
  const handleApproveAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: 'Approved',
            approvedBy: 'Maria Santos (Staff)',
            approvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return a;
      })
    );

    const targetAppt = appointments.find((a) => a.id === id);
    if (targetAppt) {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: `Appointment approved for ${targetAppt.patientName}`,
        subtitle: `${targetAppt.serviceName} with ${targetAppt.dentistName}`,
        timestamp: 'Just now',
        actor: 'Maria Santos (Staff)',
        type: 'approve',
      };
      setActivity((prev) => [newActivity, ...prev]);

      // Add notification
      const newNotif: ClinicNotification = {
        id: `notif-${Date.now()}`,
        title: `Appointment Approved: ${targetAppt.patientName}`,
        description: `Confirmed for ${targetAppt.date} at ${targetAppt.timeSlot}. Email and Calendar synced.`,
        timestamp: 'Just now',
        read: false,
        type: 'approval',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Sync approval to Google Sheets
      const gasWebhook = localStorage.getItem('drizzle_gas_webhook_url') || 'https://script.google.com/macros/s/AKfycbwNAfiMm4EggvNQvF5eVwZ9QWUXtM-Oxisk1nfxTAp6I4Sj95YbDKxf3uCBqKSpe0c/exec';
      if (gasWebhook) {
        fetch(gasWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'approve_appointment',
            appointmentId: targetAppt.id,
            referenceNo: targetAppt.referenceNo,
            staffName: 'Maria Santos (Staff)',
          }),
        }).catch((err) => console.warn('Google Sheets sync warning:', err));
      }
    }
  };

  // Reject / Cancel appointment
  const handleRejectAppointment = (id: string, reason?: string) => {
    const targetAppt = appointments.find((a) => a.id === id);
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: 'Cancelled',
            notes: reason ? `${a.notes || ''} [Cancelled: ${reason}]` : a.notes,
          };
        }
        return a;
      })
    );

    // Sync cancellation to Google Sheets
    const gasWebhook = localStorage.getItem('drizzle_gas_webhook_url') || 'https://script.google.com/macros/s/AKfycbwNAfiMm4EggvNQvF5eVwZ9QWUXtM-Oxisk1nfxTAp6I4Sj95YbDKxf3uCBqKSpe0c/exec';
    if (gasWebhook && targetAppt) {
      fetch(gasWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject_appointment',
          appointmentId: targetAppt.id,
          referenceNo: targetAppt.referenceNo,
          reason: reason || 'Cancelled by clinic',
        }),
      }).catch((err) => console.warn('Google Sheets sync warning:', err));
    }

    if (targetAppt) {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: `Appointment cancelled: ${targetAppt.patientName}`,
        subtitle: reason || 'Declined by staff or cancelled by patient',
        timestamp: 'Just now',
        actor: 'Maria Santos (Staff)',
        type: 'cancel',
      };
      setActivity((prev) => [newActivity, ...prev]);
    }
  };

  // Mark appointment completed (by Dentist or Staff)
  const handleCompleteAppointment = (id: string, clinicalNotes?: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            status: 'Completed',
            clinicalNotes: clinicalNotes || a.clinicalNotes || 'Treatment successfully completed.',
          };
        }
        return a;
      })
    );

    const targetAppt = appointments.find((a) => a.id === id);
    if (targetAppt) {
      // Increment patient total visits
      setPatients((prev) =>
        prev.map((p) => {
          if (p.name === targetAppt.patientName || p.id === targetAppt.patientId) {
            return {
              ...p,
              totalVisits: p.totalVisits + 1,
              lastVisit: targetAppt.date,
            };
          }
          return p;
        })
      );

      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        title: `Appointment completed: ${targetAppt.patientName}`,
        subtitle: `${targetAppt.serviceName} with ${targetAppt.dentistName}`,
        timestamp: 'Just now',
        actor: targetAppt.dentistName,
        type: 'complete',
      };
      setActivity((prev) => [newActivity, ...prev]);
    }
  };

  // Update patient history from Dentist Dashboard
  const handleUpdatePatientHistory = (patientId: string, note: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            historySummary: p.historySummary ? `${p.historySummary}\n\n${note}` : note,
          };
        }
        return p;
      })
    );
  };

  // Add testimonial
  const handleAddTestimonial = (testData: Omit<Testimonial, 'id' | 'date'>) => {
    const newT: Testimonial = {
      ...testData,
      id: `test-${Date.now()}`,
      date: 'Just now',
    };
    setTestimonials((prev) => [newT, ...prev]);
  };

  // Patient CRUD
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Registered new patient: ${newPatient.name}`,
      subtitle: `Patient File ID: ${newPatient.code}`,
      timestamp: 'Just now',
      actor: 'Maria Santos (Staff)',
      type: 'request',
    };
    setActivity((prev) => [newActivity, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p)));
  };

  // Treatment Plans CRUD
  const handleAddTreatment = (record: TreatmentRecord) => {
    setTreatments((prev) => [record, ...prev]);
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Treatment plan logged for ${record.patientName}`,
      subtitle: `${record.procedureName} (${record.status})`,
      timestamp: 'Just now',
      actor: 'Maria Santos (Staff)',
      type: 'complete',
    };
    setActivity((prev) => [newActivity, ...prev]);
  };

  const handleUpdateTreatment = (record: TreatmentRecord) => {
    setTreatments((prev) => prev.map((t) => (t.id === record.id ? record : t)));
  };

  // Document Vault CRUD
  const handleAddDocument = (doc: PatientDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Uploaded document for ${doc.patientName}`,
      subtitle: `${doc.title} (${doc.category})`,
      timestamp: 'Just now',
      actor: 'Maria Santos (Staff)',
      type: 'request',
    };
    setActivity((prev) => [newActivity, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      
      {/* 1. Global Role Preview & Switcher Banner */}
      <RoleSwitcher
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        pendingCount={pendingCount}
        isSyncingSheets={isSyncingSheets}
        onSyncWithGoogleSheets={handleSyncWithGoogleSheets}
        lastSyncTime={lastSyncTime}
      />

      {/* 2. Active View Render */}
      <div className="flex-1">
        {currentView === 'website' && (
          <PublicWebsite
            services={services}
            dentists={dentists}
            testimonials={testimonials}
            onOpenBooking={handleOpenBooking}
            onBookAppointment={handleCreateAppointment}
            onNavigateToStaff={() => setCurrentView('admin')}
            onNavigateToPatient={() => setCurrentView('patient')}
            onAddTestimonial={handleAddTestimonial}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            appointments={appointments}
            patients={patients}
            dentists={dentists}
            services={services}
            activity={activity}
            notifications={notifications}
            treatments={treatments}
            documents={documents}
            onApproveAppointment={handleApproveAppointment}
            onRejectAppointment={handleRejectAppointment}
            onCompleteAppointment={(id) => handleCompleteAppointment(id)}
            onOpenBookingModal={() => handleOpenBooking()}
            onSelectPatient={() => setCurrentView('patient')}
            onSelectDentist={() => setCurrentView('dentist')}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onAddTreatment={handleAddTreatment}
            onUpdateTreatment={handleUpdateTreatment}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            isSyncingSheets={isSyncingSheets}
            onSyncWithGoogleSheets={handleSyncWithGoogleSheets}
            lastSyncTime={lastSyncTime}
          />
        )}

        {currentView === 'dentist' && (
          <DentistDashboard
            dentists={dentists}
            appointments={appointments}
            patients={patients}
            onCompleteAppointment={handleCompleteAppointment}
            onUpdatePatientHistory={handleUpdatePatientHistory}
            isSyncingSheets={isSyncingSheets}
            onSyncWithGoogleSheets={handleSyncWithGoogleSheets}
            lastSyncTime={lastSyncTime}
          />
        )}

        {currentView === 'patient' && (
          <PatientDashboard
            patients={patients}
            appointments={appointments}
            onOpenBookingModal={() => handleOpenBooking()}
            onCancelAppointment={(id) => handleRejectAppointment(id, 'Patient cancelled via portal')}
            isSyncingSheets={isSyncingSheets}
            onSyncWithGoogleSheets={handleSyncWithGoogleSheets}
            lastSyncTime={lastSyncTime}
          />
        )}

        {currentView === 'gas_guide' && (
          <GasIntegrationStudio />
        )}
      </div>

      {/* 3. Global Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        dentists={dentists}
        onBookAppointment={handleCreateAppointment}
        initialServiceId={bookingPreselectedServiceId}
        initialDentistId={bookingPreselectedDentistId}
        onNavigateToStaffReview={() => setCurrentView('admin')}
        onNavigateToPatientPortal={() => setCurrentView('patient')}
      />

    </div>
  );
}
