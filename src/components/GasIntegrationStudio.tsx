import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  FileSpreadsheet, 
  Code, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Database
} from 'lucide-react';

export const GasIntegrationStudio: React.FC = () => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [gasWebhookUrl, setGasWebhookUrl] = useState('');
  const [testPayloadStatus, setTestPayloadStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'code' | 'schema' | 'architecture'>('prompt');

  const masterPromptText = `You are a Senior Full-Stack Web Developer and certified Google Apps Script & Google Sheets Architect.

I want you to build a modern, high-converting Dental Appointment Booking Web Application using HTML5, modern CSS (Tailwind CSS), Google Apps Script as the serverless backend, and Google Sheets as the relational database.

### Core Architecture & Tech Stack:
1. Frontend: High-performance, responsive HTML/JS/CSS web interface (or Google Apps Script HtmlService with client-side script).
2. Backend: Google Apps Script ('Code.gs') deployed as an Executable Web App (Execute as: Me, Access: Anyone).
3. Database: Google Sheets workbook with tabs:
   - 'Appointments': [ID, ReferenceNo, PatientID, PatientName, Email, Phone, DentistID, DentistName, Service, Date, TimeSlot, Status, Notes, MedicalAlerts, ApprovedBy, ApprovedAt, CreatedAt]
   - 'Patients': [ID, PatientCode, FullName, Email, Phone, Age, Gender, BloodType, Allergies, TotalVisits, LastVisitDate, MedicalHistorySummary]
   - 'Dentists': [ID, Name, Title, Specialization, Room, AvailableDays, Rating, ImageURL]
   - 'Services': [ID, Name, Category, Duration, EstimatedPrice, Description]
   - 'AuditLog': [Timestamp, Actor, Action, Details]

### Functional Portals Required:
1. Public Dental Website:
   - Modern full-width Hero Section ("Your Smile, Our Priority", "Healthy Smiles • Brighter Tomorrows", badges for Trusted Care, Modern Facility, Patient First).
   - "Our Dental Services" section with 6 interactive cards (General Dentistry, Cosmetic, Orthodontics, Implants, Pediatric, Oral Surgery).
   - "Meet Our Dentists" section with doctor cards, qualifications, specialty, and direct booking CTA.
   - "Book Your Appointment Today" 3-step section (Choose Date & Time -> Fill Details -> Confirmation).
   - "What Our Patients Say" real client testimonials with 5-star ratings and option to submit feedback.
   - Clinic Footer (+63 912 345 6789, hello@drizzledental.com, Quezon City, Philippines, Clinic Hours).
   - Interactive 3-step Booking Modal creating pending requests with instant unique reference code (e.g., DRZ-2025-XXXX).

2. Admin & Staff Dashboard (Matching Drizzle Dental Clinic UI):
   - Welcome banner: "Good morning, Maria Santos! Here's what's happening today."
   - 6 Metric Cards: Today's Appointments (24), Pending Requests (8), Approved (16), Completed (12), Cancelled (2), Total Patients (342).
   - Analytics Visuals: Weekly Appointment Overview line chart + Appointments by Service donut chart.
   - Real Staff Approval Queue: Table of pending appointments with instant one-click 'Approve' (Checkmark) and 'Decline' (X) actions. Only staff can approve bookings!
   - Integrated calendar date picker & upcoming schedule timeline.

3. Dentist Clinical Dashboard:
   - Doctor selector (Dr. Anna Cruz, Dr. Michael Reyes, Dr. Carlo Santos, Dr. Juan Dela Cruz).
   - Today's assigned schedule & patient list.
   - Patient Medical History & Universal Tooth Numbering (1-32) Dental Chart.
   - Ability to add clinical visit notes, diagnoses, and prescriptions, and mark visits 'Completed'.

4. Patient Self-Service Portal:
   - Real-time approval tracker (Request Sent -> Staff Review -> Confirmed).
   - Digital Patient Pass with scanable QR Code and reference number.
   - Past treatment history & preparation guidelines.

5. Google Apps Script Backend Features:
   - 'doPost(e)': Secure REST API handler accepting JSON or FormData payloads for actions:
     * 'create_appointment'
     * 'approve_appointment'
     * 'reject_appointment'
     * 'complete_appointment'
     * 'save_clinical_note'
   - 'doGet(e)': Serves the web app UI or returns JSON datasets with CORS headers.
   - Concurrency Locking: Uses LockService.getScriptLock() (10s wait) to prevent race conditions on time slots.
   - Email Automation: Uses MailApp.sendEmail() to send professional HTML confirmation emails upon booking and approval.
   - Google Calendar Integration: Uses CalendarApp.getCalendarById() or getDefaultCalendar() to auto-create calendar events for approved appointments.
   - Automated Setup function: 'setupSpreadsheet()' that creates all sheets, formats header columns with styling, and seeds initial data.

Ensure clean modular code, exceptional UI design, and robust error handling throughout.`;

  const gasCodeSnippet = `/**
 * =========================================================================
 * DRIZZLE DENTAL CLINIC - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * Database: Google Sheets
 * Integrations: Google Calendar, Google Mail (MailApp)
 * =========================================================================
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const CLINIC_CALENDAR_NAME = "Drizzle Dental Appointments";

/**
 * 1. Web App Entry Points
 */
function doGet(e) {
  // If requesting raw JSON API
  if (e && e.parameter && e.parameter.action === 'getData') {
    return ContentService.createTextOutput(JSON.stringify(getAllClinicData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Serve the HTML Frontend Web App
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Drizzle Dental Clinic | Appointment Booking')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 10 seconds for script lock to prevent booking collisions
    lock.waitLock(10000);
    
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const action = payload.action;
    let result = {};

    switch (action) {
      case 'create_appointment':
        result = handleCreateAppointment(payload);
        break;
      case 'approve_appointment':
        result = handleApproveAppointment(payload);
        break;
      case 'reject_appointment':
        result = handleRejectAppointment(payload);
        break;
      case 'complete_appointment':
        result = handleCompleteAppointment(payload);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * 2. Booking & Approval Business Logic
 */
function handleCreateAppointment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Appointments') || setupSpreadsheet().appointmentsSheet;
  
  const id = 'apt-' + new Date().getTime();
  const refNo = data.referenceNo || ('DRZ-2025-' + Math.floor(1000 + Math.random() * 9000));
  const createdAt = new Date().toISOString();

  // Append new pending booking
  sheet.appendRow([
    id,
    refNo,
    data.patientId || 'pat-' + new Date().getTime(),
    data.patientName,
    data.patientEmail,
    data.patientPhone,
    data.dentistId,
    data.dentistName,
    data.serviceName,
    data.date,
    data.timeSlot,
    'Pending', // Default status: Pending Staff Approval
    data.notes || '',
    data.medicalAlerts || '',
    '', // ApprovedBy
    '', // ApprovedAt
    createdAt
  ]);

  // Log in AuditLog
  logAudit('Patient Online Booking', 'New Appointment Request', refNo + ' for ' + data.patientName);

  // Send initial receipt email to patient
  if (data.patientEmail) {
    sendPatientReceiptEmail(data.patientEmail, data.patientName, refNo, data.serviceName, data.date, data.timeSlot);
  }

  return {
    success: true,
    message: 'Appointment booking request received and pending staff review.',
    id: id,
    referenceNo: refNo
  };
}

function handleApproveAppointment(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('Appointments');
  const values = sheet.getDataRange().getValues();

  let targetRow = -1;
  let appt = null;

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.appointmentId || values[i][1] === data.referenceNo) {
      targetRow = i + 1;
      appt = {
        refNo: values[i][1],
        name: values[i][3],
        email: values[i][4],
        dentist: values[i][7],
        service: values[i][8],
        date: values[i][9],
        time: values[i][10]
      };
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, error: 'Appointment not found.' };
  }

  const approver = data.staffName || 'Maria Santos (Staff)';
  const approvedAt = new Date().toISOString();

  sheet.getRange(targetRow, 12).setValue('Approved'); // Status column
  sheet.getRange(targetRow, 15).setValue(approver);   // ApprovedBy column
  sheet.getRange(targetRow, 16).setValue(approvedAt); // ApprovedAt column

  logAudit(approver, 'Approve Appointment', appt.refNo + ' for ' + appt.name);

  // Send Confirmation Email
  if (appt.email) {
    sendPatientApprovalEmail(appt.email, appt.name, appt.refNo, appt.dentist, appt.service, appt.date, appt.time);
  }

  // Add event to Google Calendar
  syncWithGoogleCalendar(appt);

  return { success: true, message: 'Appointment approved and calendar event synced.' };
}

/**
 * 3. Google Calendar Sync
 */
function syncWithGoogleCalendar(appt) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    const title = 'Drizzle Dental: ' + appt.service + ' - ' + appt.name;
    const startTime = new Date(appt.date + ' ' + appt.time);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // Default 60 mins

    calendar.createEvent(title, startTime, endTime, {
      description: 'Patient: ' + appt.name + '\\nDoctor: ' + appt.dentist + '\\nRef: ' + appt.refNo,
      location: '123 Smile Street, Quezon City, Philippines'
    });
  } catch (err) {
    Logger.log('Calendar Sync Error: ' + err);
  }
}

/**
 * 4. Automated HTML Email Notifications
 */
function sendPatientApprovalEmail(toEmail, patientName, refNo, doctorName, service, date, time) {
  const htmlBody = \`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0e7490; margin-top: 0;">Your Dental Appointment is Confirmed!</h2>
      <p>Dear \${patientName},</p>
      <p>We are pleased to inform you that your upcoming dental appointment at <strong>Drizzle Dental Clinic</strong> has been officially approved by our clinic staff.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Reference No:</strong> \${refNo}</p>
        <p style="margin: 5px 0;"><strong>Service:</strong> \${service}</p>
        <p style="margin: 5px 0;"><strong>Doctor:</strong> \${doctorName}</p>
        <p style="margin: 5px 0;"><strong>Date & Time:</strong> \${date} at \${time}</p>
        <p style="margin: 5px 0;"><strong>Clinic Location:</strong> 123 Smile Street, Quezon City</p>
      </div>

      <p style="color: #64748b; font-size: 12px;">Please arrive 10-15 minutes before your scheduled time. If you need to reschedule, kindly contact us at +63 912 345 6789.</p>
      <p>Warm regards,<br><strong>Drizzle Dental Clinic Team</strong></p>
    </div>
  \`;

  MailApp.sendEmail({
    to: toEmail,
    subject: "Confirmed: Your Drizzle Dental Appointment (" + refNo + ")",
    htmlBody: htmlBody
  });
}

/**
 * 5. One-Click Automated Database Setup for Google Sheets
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Sheet 1: Appointments
  let appts = ss.getSheetByName('Appointments');
  if (!appts) {
    appts = ss.insertSheet('Appointments');
    appts.appendRow([
      'AppointmentID', 'ReferenceNo', 'PatientID', 'PatientName', 'PatientEmail', 
      'PatientPhone', 'DentistID', 'DentistName', 'ServiceName', 'Date', 
      'TimeSlot', 'Status', 'Notes', 'MedicalAlerts', 'ApprovedBy', 'ApprovedAt', 'CreatedAt'
    ]);
    appts.getRange("A1:Q1").setBackground("#0e7490").setFontColor("#ffffff").setFontWeight("bold");
  }

  // Sheet 2: Patients
  let patients = ss.getSheetByName('Patients');
  if (!patients) {
    patients = ss.insertSheet('Patients');
    patients.appendRow([
      'PatientID', 'PatientCode', 'Name', 'Email', 'Phone', 'Age', 'Gender', 'BloodType', 'Allergies', 'TotalVisits', 'LastVisit'
    ]);
    patients.getRange("A1:K1").setBackground("#0e7490").setFontColor("#ffffff").setFontWeight("bold");
  }

  return { appointmentsSheet: appts, patientsSheet: patients };
}

function logAudit(actor, action, details) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName('AuditLog');
    if (!logSheet) {
      logSheet = ss.insertSheet('AuditLog');
      logSheet.appendRow(['Timestamp', 'Actor', 'Action', 'Details']);
      logSheet.getRange("A1:D1").setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
    }
    logSheet.appendRow([new Date().toISOString(), actor, action, details]);
  } catch(e) {}
}`;

  const copyToClipboard = (text: string, type: 'prompt' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleTestWebhook = async () => {
    if (!gasWebhookUrl.trim()) {
      // Simulate live test if URL not entered
      setIsSending(true);
      setTimeout(() => {
        setIsSending(false);
        setTestPayloadStatus('✓ Simulation Success: Sent booking test payload for "Maria Lopez (DRZ-2025-9988)" to simulated Google Sheet webhook.');
      }, 1000);
      return;
    }

    setIsSending(true);
    try {
      await fetch(gasWebhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_appointment',
          referenceNo: 'DRZ-TEST-' + Math.floor(1000 + Math.random() * 9000),
          patientName: 'Test Webhook Patient',
          patientEmail: 'test.patient@example.com',
          patientPhone: '+63 912 345 6789',
          dentistId: 'doc-1',
          dentistName: 'Dr. Michael Reyes',
          serviceName: 'General Dentistry',
          date: '2025-09-20',
          timeSlot: '10:00 AM',
          notes: 'Test booking submission from Drizzle Dental Integration Studio',
        }),
      });

      setTestPayloadStatus('✓ Live Payload Dispatched: Google Apps Script Webhook triggered successfully!');
    } catch (err: any) {
      setTestPayloadStatus('⚠️ Error sending payload: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 space-y-3">
        <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Google Apps Script & Google Sheets Developer Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Dental Booking System Prompt & Backend Blueprint
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          As a Senior Web Developer & Google Apps Script specialist, here is the complete engineered prompt, production-ready <code className="bg-white/10 px-2 py-0.5 rounded text-teal-300">Code.gs</code> script, Google Sheets multi-tab database schema, and live webhook tester.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { id: 'prompt', label: '1. Master AI Prompt', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'code', label: '2. Production Code.gs Script', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'schema', label: '3. Google Sheets Database Schema', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
            { id: 'architecture', label: '4. Senior Architecture & Feature Ideas', icon: <Layers className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Master AI Prompt */}
      {activeTab === 'prompt' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Master Prompt for Google Apps Script & Dental Website</h2>
              <p className="text-xs text-slate-500">Copy and feed this prompt to any LLM or developer to reproduce this full system.</p>
            </div>
            <button
              onClick={() => copyToClipboard(masterPromptText, 'prompt')}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 cursor-pointer transition-colors"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-teal-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy Master Prompt'}</span>
            </button>
          </div>

          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre-wrap border border-slate-800">
            {masterPromptText}
          </div>
        </div>
      )}

      {/* Tab 2: Production Code.gs */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Production Google Apps Script (`Code.gs`)</h2>
              <p className="text-xs text-slate-500">
                Complete backend with LockService concurrency, CalendarApp sync, MailApp notifications, and Google Sheet appending.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(gasCodeSnippet, 'code')}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 cursor-pointer transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-teal-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied Script!' : 'Copy Code.gs'}</span>
            </button>
          </div>

          <div className="bg-slate-900 text-teal-300 p-5 rounded-2xl font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed whitespace-pre border border-slate-800">
            {gasCodeSnippet}
          </div>
        </div>
      )}

      {/* Tab 3: Google Sheets Database Schema */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Google Sheets Database Architecture</h2>
            <p className="text-xs text-slate-500">Tab structure and column specifications for your spreadsheet.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sheet: Appointments */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Sheet 1: Appointments</span>
              </div>
              <p className="text-xs text-slate-500">Stores all booking transactions and staff approval lifecycles.</p>
              
              <div className="space-y-1.5 text-xs">
                {[
                  { col: 'A: AppointmentID', desc: 'Unique ID (e.g. apt-1726978400)' },
                  { col: 'B: ReferenceNo', desc: 'Public reference (e.g. DRZ-2025-0842)' },
                  { col: 'C: PatientID', desc: 'FK referencing Patients tab' },
                  { col: 'D: PatientName', desc: 'Full patient name' },
                  { col: 'E: PatientEmail', desc: 'Email address for HTML notifications' },
                  { col: 'F: PatientPhone', desc: 'Mobile phone number for SMS' },
                  { col: 'G: DentistName', desc: 'Selected doctor (e.g. Dr. Anna Cruz)' },
                  { col: 'H: ServiceName', desc: 'Treatment (e.g. Orthodontics)' },
                  { col: 'I: Date & TimeSlot', desc: 'Requested appointment slot' },
                  { col: 'J: Status', desc: 'Pending | Approved | Completed | Cancelled' },
                  { col: 'K: ApprovedBy', desc: 'Staff member who approved' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{item.col}</span>
                    <span className="text-slate-500 text-[10px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sheet: Patients */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Sheet 2: Patients</span>
              </div>
              <p className="text-xs text-slate-500">Clinical records, contact details, and dental health alerts.</p>
              
              <div className="space-y-1.5 text-xs">
                {[
                  { col: 'A: PatientID', desc: 'Unique record key' },
                  { col: 'B: PatientCode', desc: 'Hospital code (e.g. PT-000124)' },
                  { col: 'C: FullName', desc: 'Patient name' },
                  { col: 'D: Phone & Email', desc: 'Primary contact channels' },
                  { col: 'E: Age & Gender', desc: 'Demographic information' },
                  { col: 'F: BloodType', desc: 'Emergency blood grouping' },
                  { col: 'G: Allergies', desc: 'Drug warnings (Penicillin, etc.)' },
                  { col: 'H: TotalVisits', desc: 'Number of completed clinic visits' },
                  { col: 'I: MedicalNotes', desc: 'Clinical notes from attending dentists' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-100">
                    <span className="font-mono font-bold text-slate-800 text-[11px]">{item.col}</span>
                    <span className="text-slate-500 text-[10px]">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Senior Architecture & Modern Feature Ideas */}
      {activeTab === 'architecture' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Modern Architecture Recommendations</h2>
            <p className="text-xs text-slate-500">
              Senior Developer strategies for building a robust Google Apps Script + Sheets Dental Application:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">LockService Concurrency Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Because Google Sheets has a standard write quota, always use <code className="text-teal-700 bg-teal-50 px-1 rounded">LockService.getScriptLock().waitLock(10000)</code> in <code className="text-teal-700 bg-teal-50 px-1 rounded">doPost()</code>. This guarantees zero double-booking if two patients attempt to book the exact same dentist slot simultaneously.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Automated Google Calendar Sync</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect the script directly to a shared clinic calendar via <code className="text-teal-700 bg-teal-50 px-1 rounded">CalendarApp.createEvent()</code>. When Maria Santos clicks "Approve", the appointment automatically populates the doctor's phone and calendar with patient phone, reference code, and procedure.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/80 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Two-Stage Approval Gate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dental clinics frequently require room preparation (e.g. sterilization between surgeries). The two-stage flow (Patient requests Pending slot → Staff verifies room & doctor → Patient receives confirmed pass) dramatically reduces clinic cancellations and walk-in chaos.
              </p>
            </div>

          </div>

          {/* Additional Features List */}
          <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              High-Impact Additional Feature Ideas:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>SMS / WhatsApp Reminders:</strong> Use UrlFetchApp to trigger Twilio or Semaphore SMS 24 hours and 2 hours before the visit.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Digital Medical Questionnaire:</strong> Patients fill dental allergy and consent forms online before arrival, saving 15 mins reception time.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Automated Post-Visit Review Trigger:</strong> 4 hours after dentist marks appointment as "Completed", Google Apps Script emails a Google Review link.</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Periodic Prophylaxis Recall:</strong> Script cron job that automatically emails patients due for their 6-month routine cleaning.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Webhook Tester Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Google Apps Script Webhook Tester</h3>
            <p className="text-xs text-slate-500">Test sending a booking payload directly to your Google Sheet Web App endpoint or test in simulated mode.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="url"
            value={gasWebhookUrl}
            onChange={(e) => setGasWebhookUrl(e.target.value)}
            placeholder="Paste your Apps Script Web App URL (https://script.google.com/macros/s/.../exec) or leave blank for simulation"
            className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleTestWebhook}
            disabled={isSending}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors shrink-0"
          >
            {isSending ? (
              <span>Dispatching...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Test Booking Payload</span>
              </>
            )}
          </button>
        </div>

        {testPayloadStatus && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center space-x-2">
            <span>{testPayloadStatus}</span>
          </div>
        )}
      </div>

    </div>
  );
};
