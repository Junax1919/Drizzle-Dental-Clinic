import React from 'react';
import { Dentist, Appointment } from '../../types';
import { Stethoscope, Calendar, Clock, Star, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

interface AdminDentistsViewProps {
  dentists: Dentist[];
  appointments: Appointment[];
  onSelectDentist: () => void;
}

export const AdminDentistsView: React.FC<AdminDentistsViewProps> = ({
  dentists,
  appointments,
  onSelectDentist,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Clinical Faculty & Specialists</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Dentists & Specialists</h2>
          <p className="text-xs text-slate-500">
            Manage dental practitioners, chair allocations, working schedules, and specialties.
          </p>
        </div>

        <button
          onClick={onSelectDentist}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Switch to Doctor Station</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dentists.map((doc) => {
          const docAppts = appointments.filter((a) => a.dentistId === doc.id || a.dentistName === doc.name);
          return (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-teal-400 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                    <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {doc.room}
                    </span>
                  </div>
                  <div className="text-teal-700 text-xs font-semibold">{doc.title}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{doc.specialization}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                {doc.bio}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Available Days:</span>
                  <span className="font-semibold text-slate-800">{doc.availableDays.join(', ')}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold block">Queued Visits:</span>
                  <span className="font-bold text-teal-700">{docAppts.length} appointments</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-900">{doc.rating}</span>
                  <span className="text-slate-400 text-[10px]">({doc.reviewsCount} reviews)</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>On Duty Today</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
