export type AppointmentStatus = 'Pending' | 'Approved' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  referenceNo: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAvatar?: string;
  dentistId: string;
  dentistName: string;
  dentistRole: string;
  dentistAvatar?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: string; // e.g. "60 mins"
  servicePrice?: number;
  date: string; // e.g. "2025-09-16"
  timeSlot: string; // e.g. "09:00 AM"
  status: AppointmentStatus;
  notes?: string;
  medicalHistory?: string;
  firstTime?: boolean;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  clinicalNotes?: string;
  prescriptions?: string[];
}

export interface Patient {
  id: string;
  code: string; // e.g. PT-000124
  name: string;
  email: string;
  phone: string;
  avatar: string;
  age: number;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  totalVisits: number;
  lastVisit: string;
  historySummary?: string;
  teethNotes?: {
    toothNumber: number;
    condition: string;
    treatment: string;
  }[];
}

export interface Dentist {
  id: string;
  name: string;
  title: string;
  specialization: string;
  avatar: string;
  bio: string;
  quote: string;
  availableDays: string[];
  rating: number;
  reviewsCount: number;
  room: string;
}

export interface DentalService {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: string;
  priceEstimate: string;
  popular?: boolean;
  icon: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  actor: string;
  type: 'approve' | 'request' | 'update' | 'complete' | 'cancel';
}

export interface ClinicNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'request' | 'testimonial' | 'approval';
}

export type TreatmentStatus = 'Planned' | 'In Progress' | 'Completed';

export interface TreatmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  procedureName: string;
  toothNumber: string; // e.g. "Tooth #16" or "Full Arch"
  diagnosis: string;
  status: TreatmentStatus;
  estimatedCost: number;
  dateStarted: string;
  dateCompleted?: string;
  nextFollowUp?: string;
  prescriptions: string[];
  progressNotes: string[];
}

export type DocumentCategory = 'X-Ray' | 'Lab Report' | 'Treatment Plan' | 'Consent Form' | 'Prescription';

export interface PatientDocument {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: DocumentCategory;
  fileType: 'image' | 'pdf' | 'doc';
  fileSize: string; // e.g. "2.4 MB"
  uploadedAt: string;
  fileUrl: string;
  notes?: string;
  dentistName?: string;
}

export type AppView = 'website' | 'admin' | 'dentist' | 'patient' | 'gas_guide';
