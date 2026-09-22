import React from 'react';
import { ClinicNotification, ActivityItem } from '../../types';
import { Bell, Activity, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface AdminNotificationsViewProps {
  notifications: ClinicNotification[];
  activity: ActivityItem[];
  onMarkAllRead?: () => void;
}

export const AdminNotificationsView: React.FC<AdminNotificationsViewProps> = ({
  notifications,
  activity,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Bell className="w-4 h-4 text-teal-600" />
          <span>Automated Notifications & Audit Feed</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">Notifications & Activity Feed</h2>
        <p className="text-xs text-slate-500">
          History of automated patient SMS/WhatsApp alerts, approval triggers, and staff actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Automated Notifications */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span>Automated Patient Reminders & System Alerts</span>
          </h3>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3 text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">{n.title}</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{n.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity Stream */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Clinic Staff Activity Stream</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activity.map((act) => (
              <div
                key={act.id}
                className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3 text-xs"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900">{act.title}</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{act.subtitle}</p>
                  <div className="text-[10px] text-teal-700 font-semibold mt-1">Staff: {act.actor}</div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
