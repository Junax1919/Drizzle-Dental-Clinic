import React, { useState, useEffect } from 'react';
import { 
  Appointment, 
  Patient, 
  Dentist, 
  DentalService, 
  Testimonial, 
  ActivityItem, 
  ClinicNotification, 
  AppView 
} from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_DENTISTS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_ACTIVITY, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PublicWebsite } from './components/PublicWebsite';
import { AdminDashboard } from './components/AdminDashboard';
import { DentistDashboard } from './components/DentistDashboard';
import { PatientDashboard } from './components/PatientDashboard';
import { BookingModal } from './components/BookingModal';
import { GasIntegrationStudio } from './components/GasIntegrationStudio';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('website');

  // Persistence in localStorage
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [dentists] = useState<Dentist[]>(INITIAL_DENTISTS);
  const [services] = useState<DentalService[]>(INITIAL_SERVICES);

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [activity, setActivity] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem('drizzle_dental_activity');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY;
  });

  const [notifications, setNotifications] = useState<ClinicNotification[]>(INITIAL_NOTIFICATIONS);

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
    }
  };

  // Reject / Cancel appointment
  const handleRejectAppointment = (id: string, reason?: string) => {
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

    const targetAppt = appointments.find((a) => a.id === id);
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

  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      
      {/* 1. Global Role Preview & Switcher Banner */}
      <RoleSwitcher
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        pendingCount={pendingCount}
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
            onApproveAppointment={handleApproveAppointment}
            onRejectAppointment={handleRejectAppointment}
            onCompleteAppointment={(id) => handleCompleteAppointment(id)}
            onOpenBookingModal={() => handleOpenBooking()}
            onSelectPatient={() => setCurrentView('patient')}
            onSelectDentist={() => setCurrentView('dentist')}
          />
        )}

        {currentView === 'dentist' && (
          <DentistDashboard
            dentists={dentists}
            appointments={appointments}
            patients={patients}
            onCompleteAppointment={handleCompleteAppointment}
            onUpdatePatientHistory={handleUpdatePatientHistory}
          />
        )}

        {currentView === 'patient' && (
          <PatientDashboard
            patients={patients}
            appointments={appointments}
            onOpenBookingModal={() => handleOpenBooking()}
            onCancelAppointment={(id) => handleRejectAppointment(id, 'Patient cancelled via portal')}
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
