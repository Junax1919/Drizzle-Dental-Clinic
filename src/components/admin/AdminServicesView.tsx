import React, { useState } from 'react';
import { DentalService } from '../../types';
import { Layers, Clock, DollarSign, Search, Check, Sparkles } from 'lucide-react';

interface AdminServicesViewProps {
  services: DentalService[];
  onOpenBooking: () => void;
}

export const AdminServicesView: React.FC<AdminServicesViewProps> = ({
  services,
  onOpenBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = ['All', 'General', 'Cosmetic', 'Orthodontics', 'Surgery', 'Restorative'];

  const filtered = services.filter((s) => {
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Clinical Treatments & Pricing Fee Schedule</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Dental Services Catalogue</h2>
          <p className="text-xs text-slate-500">
            Standard pricing schedule, chair time estimates, and procedure inclusions.
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <span>Book Procedure</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service name, procedure details..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                categoryFilter === c ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded-md">
                  {srv.category}
                </span>
                <div className="flex items-center space-x-1 text-slate-500 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{srv.duration}</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{srv.name}</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">{srv.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">Fee Schedule:</span>
                <span className="font-bold text-slate-900 text-sm">{srv.priceEstimate}</span>
              </div>

              <button
                onClick={onOpenBooking}
                className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
