import React, { useState } from 'react';
import { DentalService, Dentist, Testimonial, Appointment } from '../types';
import { AppointmentBookingSection } from './AppointmentBookingSection';
import heroImage from '../assets/images/dental_hero_patient_1790050849093.jpg';
import { 
  Calendar, 
  Clock, 
  Shield, 
  ShieldCheck,
  Heart, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  ArrowRight,
  Stethoscope,
  Smile,
  ChevronRight,
  Award,
  Users,
  Building2,
  Check
} from 'lucide-react';

interface PublicWebsiteProps {
  services: DentalService[];
  dentists: Dentist[];
  testimonials: Testimonial[];
  onOpenBooking: (preselectedServiceId?: string, preselectedDentistId?: string) => void;
  onBookAppointment: (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  onNavigateToStaff: () => void;
  onNavigateToPatient: () => void;
  onAddTestimonial: (test: Omit<Testimonial, 'id' | 'date'>) => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({
  services,
  dentists,
  testimonials,
  onOpenBooking,
  onBookAppointment,
  onNavigateToStaff,
  onNavigateToPatient,
  onAddTestimonial,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('Patient');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittedReviewSuccess, setSubmittedReviewSuccess] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    onAddTestimonial({
      patientName: reviewName,
      role: reviewRole || 'Patient',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      rating: reviewRating,
      comment: reviewComment,
    });

    setSubmittedReviewSuccess(true);
    setTimeout(() => {
      setSubmittedReviewSuccess(false);
      setShowReviewModal(false);
      setReviewName('');
      setReviewComment('');
    }, 1500);
  };

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'General Dentistry':
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
          </svg>
        );
      case 'Cosmetic Dentistry':
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        );
      case 'Orthodontics':
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="10" rx="3" />
            <path d="M7 7v10" />
            <path d="M12 7v10" />
            <path d="M17 7v10" />
          </svg>
        );
      case 'Dental Implants':
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2h8v5a4 4 0 0 1-8 0V2z" />
            <path d="M10 7v11l2 4 2-4V7" />
            <line x1="10" y1="11" x2="14" y2="11" />
            <line x1="10" y1="15" x2="14" y2="15" />
          </svg>
        );
      case 'Pediatric Dentistry':
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* 1. Header Navigation matching Inspiration */}
      <header id="clinic-public-header" className="bg-white border-b border-slate-100 sticky top-[41px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-xs">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 leading-none">Drizzle</div>
              <div className="text-[10px] tracking-widest font-bold text-slate-400 uppercase mt-0.5">Dental Clinic</div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#hero-section" className="hover:text-teal-600 transition-colors">Home</a>
            <a href="#services-section" className="hover:text-teal-600 transition-colors">Services</a>
            <a href="#dentists-section" className="hover:text-teal-600 transition-colors">Our Dentists</a>
            <a href="#booking-banner-section" className="hover:text-teal-600 transition-colors">Booking</a>
            <a href="#testimonials-section" className="hover:text-teal-600 transition-colors">Testimonials</a>
            <a href="#footer-section" className="hover:text-teal-600 transition-colors">Contact</a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-header-patient-portal"
              onClick={onNavigateToPatient}
              className="hidden sm:inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors"
            >
              My Appointments
            </button>
            <button
              id="btn-header-book-appointment"
              onClick={() => onOpenBooking()}
              className="bg-[#0e7490] hover:bg-[#08637c] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Full-Width Hero Section matching Inspiration */}
      <section id="hero-section" className="relative w-full bg-[#edf5f9] overflow-hidden">
        {/* Full-width container with responsive layout */}
        <div className="relative w-full min-h-[580px] lg:min-h-[620px] flex items-center">
          
          {/* Right Photographic Visual spanning across the right side */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[58%] xl:w-[54%] overflow-hidden pointer-events-none">
            <img
              src={heroImage}
              alt="Happy patient smiling during dental appointment with dentist"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_right] sm:object-[center_28%] xl:object-[center_35%]"
            />
            {/* Seamless gradient fade blending the image softly into the light blue-gray background on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#edf5f9] via-[#edf5f9]/75 via-25% to-transparent hidden sm:block"></div>
            {/* Mobile overlay to ensure text legibility */}
            <div className="absolute inset-0 bg-[#edf5f9]/90 sm:hidden"></div>
          </div>

          {/* Floating Handwritten Script Accent: "A Healthier Happier You" */}
          <div className="absolute top-8 sm:top-12 lg:top-14 left-[44%] lg:left-[45%] xl:left-[47%] z-20 pointer-events-none hidden md:block">
            <div className="font-handwriting text-3xl lg:text-[38px] text-[#1b536b] -rotate-6 font-semibold leading-tight select-none">
              <div>A Healthier</div>
              <div className="relative inline-block">
                Happier You
                <svg className="w-28 h-4 text-[#1b536b] absolute -bottom-1 left-0" viewBox="0 0 120 20" fill="none">
                  <path d="M4 10 Q 60 19, 116 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom Right Floating Badge: "Creating Beautiful Smiles Every Day" */}
          <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-12 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-lg border border-slate-100 hidden sm:flex items-center space-x-3.5 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="w-10 h-10 rounded-xl bg-teal-50/80 text-[#155e75] flex items-center justify-center shrink-0 border border-teal-100/70">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
              </svg>
            </div>
            <div className="leading-snug">
              <div className="text-xs sm:text-sm font-extrabold text-[#0f2e46]">Creating Beautiful</div>
              <div className="text-xs sm:text-sm font-semibold text-[#155e75]">Smiles Every Day</div>
            </div>
          </div>

          {/* Left Content Area constrained within max-w-7xl */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 relative z-10">
            <div className="max-w-xl lg:max-w-xl space-y-6">
              
              {/* Eyebrow Tagline */}
              <div className="flex items-center space-x-2 text-xs sm:text-[13px] font-bold tracking-[0.18em] text-[#335570] uppercase">
                <span>HEALTHY SMILES</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1b536b]"></span>
                <span>BRIGHTER TOMORROWS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[66px] font-black text-[#0f2e46] tracking-tight leading-[1.08]">
                Your Smile, <br />
                <span>Our Priority</span>
              </h1>

              {/* Paragraph Description */}
              <p className="text-sm sm:text-base lg:text-[17px] text-[#335570] leading-relaxed max-w-lg">
                At Drizzle Dental Clinic, we provide gentle, modern, and personalized dental care for the whole family. Because every smile tells a story.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-2">
                <button
                  id="btn-hero-book"
                  onClick={() => onOpenBooking()}
                  className="bg-[#155e75] hover:bg-[#0e4b60] text-white px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center space-x-2.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-teal-200" />
                  <span>Book an Appointment</span>
                </button>
                <a
                  href="#services-section"
                  className="px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-[#0f2e46] bg-transparent hover:bg-white/70 border border-[#0f2e46]/30 hover:border-[#0f2e46] transition-all shadow-2xs"
                >
                  Explore Our Services
                </a>
              </div>

              {/* Trust Indicators (3 Horizontal Badges) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-8 border-t border-[#0f2e46]/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50/80 text-[#155e75] flex items-center justify-center shrink-0 border border-teal-200/50">
                    <ShieldCheck className="w-5 h-5 text-[#155e75]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0f2e46]">Trusted Care</div>
                    <div className="text-[11px] text-[#557086]">Safe & Professional</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50/80 text-[#155e75] flex items-center justify-center shrink-0 border border-teal-200/50">
                    <Users className="w-5 h-5 text-[#155e75]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0f2e46]">Modern Facility</div>
                    <div className="text-[11px] text-[#557086]">Comfortable & Clean</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50/80 text-[#155e75] flex items-center justify-center shrink-0 border border-teal-200/50">
                    <Heart className="w-5 h-5 text-[#155e75] fill-[#155e75]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#0f2e46]">Patient First</div>
                    <div className="text-[11px] text-[#557086]">Your Smile Matters</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Our Dental Services matching Inspiration */}
      <section id="services-section" className="py-20 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Dental Services
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Comprehensive dental care using modern technology and a gentle touch.
          </p>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onClick={() => onOpenBooking(service.id)}
                className="group bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    {getServiceIcon(service.name)}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {service.name}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400">
                    Est. {service.duration} • <span className="text-teal-600 font-bold">{service.priceEstimate}</span>
                  </div>
                  <div className="text-xs font-bold text-teal-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Book Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Meet Our Dentists matching Inspiration */}
      <section id="dentists-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Dentists
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
            Experienced. Compassionate. Dedicated to Your Smile.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            {dentists.slice(0, 3).map((dentist) => (
              <div
                key={dentist.id}
                id={`dentist-card-${dentist.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:shadow-xl transition-all duration-300 text-left flex flex-col group"
              >
                {/* Dentist photo */}
                <div className="relative h-72 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={dentist.avatar}
                    alt={dentist.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-xs flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{dentist.rating} ({dentist.reviewsCount})</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{dentist.name}</h3>
                    <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mt-1">
                      {dentist.specialization}
                    </div>
                    <blockquote className="mt-4 text-sm text-slate-600 italic border-l-2 border-teal-500 pl-3">
                      "{dentist.quote}"
                    </blockquote>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                      {dentist.bio}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Available: {dentist.availableDays.slice(0, 3).join(', ')}
                    </div>
                    <button
                      id={`btn-book-dentist-${dentist.id}`}
                      onClick={() => onOpenBooking(undefined, dentist.id)}
                      className="text-xs font-bold text-white bg-[#0e7490] hover:bg-[#08637c] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Book With Doctor
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Book Your Appointment Section with Interactive Calendar View & Available Dates */}
      <div id="booking-banner-section">
        <AppointmentBookingSection
          services={services}
          dentists={dentists}
          onBookAppointment={onBookAppointment}
          onNavigateToStaff={onNavigateToStaff}
          onNavigateToPatient={onNavigateToPatient}
        />
      </div>

      {/* 6. What Our Patients Say matching Inspiration */}
      <section id="testimonials-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                What Our Patients Say
              </h2>
              <p className="mt-2 text-slate-600 text-base sm:text-lg">
                Real stories from real smiles.
              </p>
            </div>
            <button
              id="btn-leave-review"
              onClick={() => setShowReviewModal(true)}
              className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              + Leave a Patient Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                id={`testimonial-card-${t.id}`}
                className="bg-[#f8fafc] rounded-3xl p-7 border border-slate-200/80 text-left flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center space-x-3">
                  <img
                    src={t.avatar}
                    alt={t.patientName}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.patientName}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer matching Inspiration */}
      <footer id="footer-section" className="bg-[#eef8f8] border-t border-teal-100/60 pt-16 pb-12 text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            
            {/* Brand column */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C8 2 5 5 5 9c0 3.5 1.5 6.5 2.5 10 .5 1.5 1.5 3 2.5 3s1.5-2 2-4c.5 2 1 4 2 4s2-1.5 2.5-3c1-3.5 2.5-6.5 2.5-10 0-4-3-7-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-slate-900">Drizzle</div>
                  <div className="text-[10px] tracking-widest font-bold text-slate-500 uppercase">Dental Clinic</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-sm">
                Healthy Smiles. Brighter Tomorrows. Providing gentle, ethical, and world-class dental healthcare.
              </p>
              <div className="flex items-center space-x-3 text-slate-600 pt-2">
                <a href="#footer-section" className="w-8 h-8 rounded-full bg-white border border-teal-200/80 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors">
                  <span className="font-bold text-xs">f</span>
                </a>
                <a href="#footer-section" className="w-8 h-8 rounded-full bg-white border border-teal-200/80 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors">
                  <span className="font-bold text-xs">ig</span>
                </a>
                <a href="#footer-section" className="w-8 h-8 rounded-full bg-white border border-teal-200/80 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors">
                  <span className="font-bold text-xs">yt</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#hero-section" className="hover:text-teal-700">Home</a></li>
                <li><a href="#services-section" className="hover:text-teal-700">About</a></li>
                <li><a href="#services-section" className="hover:text-teal-700">Services</a></li>
                <li><a href="#dentists-section" className="hover:text-teal-700">Our Dentists</a></li>
                <li><a href="#testimonials-section" className="hover:text-teal-700">Testimonials</a></li>
                <li><a href="#footer-section" className="hover:text-teal-700">Contact</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Contact Us</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-medium text-slate-800">+63 912 345 6789</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>hello@drizzledental.com</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>123 Smile Street, Quezon City, Philippines</span>
                </div>
              </div>
            </div>

            {/* Clinic Hours */}
            <div className="md:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Clinic Hours</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2.5">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Monday – Friday</div>
                    <div className="text-slate-500">9:00 AM – 6:00 PM</div>
                  </div>
                </div>
                <div className="pl-6.5">
                  <div className="font-semibold text-slate-900">Saturday</div>
                  <div className="text-slate-500">9:00 AM – 2:00 PM</div>
                </div>
                <div className="pl-6.5">
                  <div className="font-semibold text-slate-900">Sunday</div>
                  <div className="text-slate-400">Closed</div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Copyright bar matching inspiration */}
          <div className="mt-12 pt-6 border-t border-teal-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © 2025 Drizzle Dental Clinic. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onNavigateToStaff} className="text-teal-700 hover:underline">
                Staff Dashboard Portal
              </button>
              <span>•</span>
              <span className="font-handwriting text-base text-teal-800">A Healthier, Happier You ♡</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">Share Your Experience</h3>
            <p className="text-xs text-slate-500 mt-1">Help others discover gentle dental care at Drizzle Dental Clinic.</p>

            {submittedReviewSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-500">Your review has been posted to our patient stories.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="e.g. Maria L."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your visit, dental treatment, or staff service..."
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm cursor-pointer"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
