import React, { useState } from 'react';
import { ClinicUser, UserRole } from '../../types';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Edit2,
  Trash2,
  KeyRound,
  ShieldAlert,
  Stethoscope,
  Briefcase,
  CalendarCheck,
  UserCog,
  Check,
  X,
  Sparkles,
  Info,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface AdminUserManagementProps {
  users: ClinicUser[];
  onAddUser: (user: ClinicUser) => void;
  onUpdateUser: (user: ClinicUser) => void;
  onDeleteUser: (userId: string) => void;
  onToast: (msg: string) => void;
}

const AVAILABLE_ROLES: { role: UserRole; label: string; desc: string; color: string; badgeClass: string; icon: any }[] = [
  {
    role: 'System Admin',
    label: 'System Admin',
    desc: 'Full administrative control, system integrations, security settings, and user role provisioning.',
    color: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
    icon: ShieldCheck,
  },
  {
    role: 'Clinic Admin',
    label: 'Clinic Admin',
    desc: 'Clinic operational oversight, staff schedule control, patient records, and financial analytics.',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    icon: Briefcase,
  },
  {
    role: 'Dentist',
    label: 'Dentist',
    desc: 'Clinical charts, diagnoses, procedure records, treatment plans, prescriptions, and patient vaults.',
    color: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20',
    icon: Stethoscope,
  },
  {
    role: 'Front Desk',
    label: 'Front Desk',
    desc: 'Patient appointment scheduling, registration intake, queue management, and SMS/WhatsApp notifications.',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    icon: CalendarCheck,
  },
];

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [userForRoleEdit, setUserForRoleEdit] = useState<ClinicUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('Front Desk');
  const [showRoleInfoModal, setShowRoleInfoModal] = useState(false);
  const [showSheetsGuideModal, setShowSheetsGuideModal] = useState(false);
  const [copiedSheetHeaders, setCopiedSheetHeaders] = useState(false);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Front Desk');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFileName, setAvatarFileName] = useState<string>('');

  // Role badge helper
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'System Admin':
        return {
          label: 'System Admin',
          badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
          dotClass: 'bg-purple-500',
        };
      case 'Clinic Admin':
        return {
          label: 'Clinic Admin',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
          dotClass: 'bg-blue-500',
        };
      case 'Dentist':
        return {
          label: 'Dentist',
          badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 font-bold',
          dotClass: 'bg-teal-600',
        };
      case 'Front Desk':
        return {
          label: 'Front Desk',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
          dotClass: 'bg-amber-500',
        };
      default:
        return {
          label: role,
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-bold',
          dotClass: 'bg-slate-400',
        };
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'All' || u.role === selectedRoleFilter;

    const matchesStatus =
      selectedStatusFilter === 'All' || u.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role counters
  const totalCount = users.length;
  const sysAdminCount = users.filter((u) => u.role === 'System Admin').length;
  const clinicAdminCount = users.filter((u) => u.role === 'Clinic Admin').length;
  const dentistCount = users.filter((u) => u.role === 'Dentist').length;
  const frontDeskCount = users.filter((u) => u.role === 'Front Desk').length;

  // Handle direct inline role change
  const handleQuickRoleChange = (user: ClinicUser, targetRole: UserRole) => {
    if (user.role === targetRole) return;
    const updated: ClinicUser = {
      ...user,
      role: targetRole,
      assignedBy: 'System Admin',
    };
    onUpdateUser(updated);
    onToast(`Assigned ${user.name} to role: ${targetRole}`);
  };

  // Handle role modal save
  const handleSaveRoleModal = () => {
    if (!userForRoleEdit) return;
    const updated: ClinicUser = {
      ...userForRoleEdit,
      role: selectedNewRole,
      assignedBy: 'System Admin',
    };
    onUpdateUser(updated);
    onToast(`Successfully updated role for ${userForRoleEdit.name} to ${selectedNewRole}`);
    setUserForRoleEdit(null);
  };

  // Toggle user status
  const handleToggleStatus = (user: ClinicUser) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const updated: ClinicUser = { ...user, status: nextStatus };
    onUpdateUser(updated);
    onToast(`User ${user.name} marked as ${nextStatus}`);
  };

  // Handle photo file selection
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onToast('Photo file size should be less than 5MB');
      return;
    }

    setAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Create an image to resize down to lightweight thumbnail (160x160)
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 160;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarPreview(compressed);
        } else {
          setAvatarPreview(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Add new user submit
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      onToast('Please enter both name and email');
      return;
    }

    // Default professional avatar if none uploaded
    const fallbackAvatar = `https://images.unsplash.com/photo-${1534528741775 + (users.length % 10)}?w=200&auto=format&fit=crop&q=80`;

    const newUser: ClinicUser = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || '+63 900 000 0000',
      role: newRole,
      department: newDepartment.trim() || 'General Operations',
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      assignedBy: 'System Admin',
      password: newPassword.trim() || undefined,
      avatar: avatarPreview || fallbackAvatar,
    };

    onAddUser(newUser);
    onToast(`New user ${newUser.name} created with role "${newRole}"`);

    // Reset & close
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewDepartment('');
    setNewRole('Front Desk');
    setNewPassword('');
    setShowPassword(false);
    setAvatarPreview('');
    setAvatarFileName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <UserCog className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              User Management & Role Assignment
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision user accounts, configure department access, and assign specific operational roles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSheetsGuideModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
            title="Configure Google Sheet tab for Users"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet Schema</span>
          </button>
          <button
            onClick={() => setShowRoleInfoModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Role Permissions</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-2xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Role Breakdown Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedRoleFilter('All')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">Total Users</div>
          <div className="text-2xl font-extrabold mt-1">{totalCount}</div>
          <div className="text-[10px] opacity-70 mt-0.5">All team members</div>
        </div>

        <div
          onClick={() => setSelectedRoleFilter('System Admin')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'System Admin'
              ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
              : 'bg-white text-slate-700 border-purple-200/80 hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-purple-700 uppercase tracking-wider">
            <span>System Admin</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-purple-950 mt-1">{sysAdminCount}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Full System Access</div>
        </div>

        <div
          onClick={() => setSelectedRoleFilter('Clinic Admin')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'Clinic Admin'
              ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
              : 'bg-white text-slate-700 border-blue-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase tracking-wider">
            <span>Clinic Admin</span>
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-blue-950 mt-1">{clinicAdminCount}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Operations & Reports</div>
        </div>

        <div
          onClick={() => setSelectedRoleFilter('Dentist')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'Dentist'
              ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
              : 'bg-white text-slate-700 border-teal-200/80 hover:border-teal-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-teal-700 uppercase tracking-wider">
            <span>Dentist</span>
            <Stethoscope className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-teal-950 mt-1">{dentistCount}</div>
          <div className="text-[10px] text-teal-600 mt-0.5">Clinical Charts & Plans</div>
        </div>

        <div
          onClick={() => setSelectedRoleFilter('Front Desk')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            selectedRoleFilter === 'Front Desk'
              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
              : 'bg-white text-slate-700 border-amber-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            <span>Front Desk</span>
            <CalendarCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">{frontDeskCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Schedule & Intake</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or dept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Role:</span>
          </div>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="System Admin">System Admin</option>
            <option value="Clinic Admin">Clinic Admin</option>
            <option value="Dentist">Dentist</option>
            <option value="Front Desk">Front Desk</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(searchQuery || selectedRoleFilter !== 'All' || selectedStatusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('All');
                setSelectedStatusFilter('All');
              }}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Current Assigned Role</th>
                <th className="py-3.5 px-4">Quick Role Reassignment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No clinic users found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              {user.password && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200" title="Password configured">
                                  <Lock className="w-2.5 h-2.5 mr-0.5 text-slate-500" />
                                  PW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                            {user.phone && <div className="text-[10px] text-slate-400">{user.phone}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Department & Join Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{user.department || 'Clinic Staff'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Joined: {user.joinedDate || '2024'} • Last: {user.lastLogin || 'Recent'}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${roleBadge.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${roleBadge.dotClass}`} />
                            {roleBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Inline Quick Role Assignment Switcher */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleQuickRoleChange(user, e.target.value as UserRole)}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer transition-all shadow-2xs"
                          >
                            <option value="System Admin">System Admin</option>
                            <option value="Clinic Admin">Clinic Admin</option>
                            <option value="Dentist">Dentist</option>
                            <option value="Front Desk">Front Desk</option>
                          </select>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{user.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setUserForRoleEdit(user);
                              setSelectedNewRole(user.role);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                            title="Manage Role Assignment"
                          >
                            Assign Role
                          </button>
                          {user.email !== 'maria.santos@drizzledental.com' && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove user ${user.name}?`)) {
                                  onDeleteUser(user.id);
                                  onToast(`User ${user.name} removed.`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {userForRoleEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Assign User Role</h3>
                  <p className="text-xs text-slate-500">Configure role privileges for this user</p>
                </div>
              </div>
              <button
                onClick={() => setUserForRoleEdit(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target user info card */}
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <img
                src={userForRoleEdit.avatar}
                alt={userForRoleEdit.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">{userForRoleEdit.name}</div>
                <div className="text-xs text-slate-500">{userForRoleEdit.email}</div>
                <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                  Current Role: <span className="font-bold underline">{userForRoleEdit.role}</span>
                </div>
              </div>
            </div>

            {/* Role Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Specific Role to Assign:</label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedNewRole === r.role;
                  return (
                    <div
                      key={r.role}
                      onClick={() => setSelectedNewRole(r.role)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{r.label}</span>
                          {isSelected && (
                            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserForRoleEdit(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoleModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Role Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Add New Clinic User</h3>
                  <p className="text-xs text-slate-500">Create an account and assign their starting role</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dra. Camille Flores"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@drizzledental.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+63 9XX XXX XXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Branch</label>
                <input
                  type="text"
                  placeholder="e.g. Front Desk & Reception, Surgery, IT"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Account Password *</label>
                  <span className="text-[10px] text-slate-400">Default or initial credentials</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter secure initial password (e.g. Drizzle@2025)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* User Profile Photo Attachment */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">User Profile Photo</label>
                <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                  {/* Photo Preview Thumbnail */}
                  <div className="relative shrink-0">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarPreview('');
                            setAvatarFileName('');
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-700 cursor-pointer shadow-xs"
                          title="Remove photo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Camera className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload button and instructions */}
                  <div className="flex-1 min-w-0">
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{avatarPreview ? 'Change Photo' : 'Attach Photo'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {avatarFileName ? `Attached: ${avatarFileName}` : 'PNG, JPG, or WEBP up to 5MB'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign User Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                >
                  <option value="System Admin">System Admin (Full system control & user roles)</option>
                  <option value="Clinic Admin">Clinic Admin (Operations, staff, and reports)</option>
                  <option value="Dentist">Dentist (Clinical records & patient treatment)</option>
                  <option value="Front Desk">Front Desk (Appointments, triage, and intake)</option>
                </select>
              </div>

              {/* Real-time Google Sheet sync indicator */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Google Sheets Sync:</strong> This new user and assigned role will be dispatched directly to your Google Spreadsheet’s <strong>Users</strong> tab.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-2xs cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create User & Assign Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Information Modal */}
      {showRoleInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Clinic Role & Privilege Reference
                </h3>
              </div>
              <button
                onClick={() => setShowRoleInfoModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-purple-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>System Admin</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Full root administrative rights. Can configure integrations (Google Sheets, Webhooks), modify global clinic parameters, audit logs, and assign or revoke any user role.
                </p>
                <div className="text-[10px] text-purple-700 font-semibold">
                  Permissions: System Config, User Provisioning, Integrations, Audit Logs
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-blue-900 font-bold">
                  <Briefcase className="w-4 h-4 text-blue-700" />
                  <span>Clinic Admin</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Manages day-to-day clinic operations, oversees dentist schedules, generates financial & KPI reports, reviews all patient records, and resolves appointment disputes.
                </p>
                <div className="text-[10px] text-blue-700 font-semibold">
                  Permissions: Operational Analytics, Patient Database, Schedules, Staff Triage
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-teal-900 font-bold">
                  <Stethoscope className="w-4 h-4 text-teal-700" />
                  <span>Dentist</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Clinical access to diagnose, create treatment plans, log dental chart records, upload radiographs, write prescriptions, and review consultation history.
                </p>
                <div className="text-[10px] text-teal-700 font-semibold">
                  Permissions: Clinical Charting, Treatment Tracking, Radiographs, Prescriptions
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <CalendarCheck className="w-4 h-4 text-amber-700" />
                  <span>Front Desk</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Reception triage, patient intake registration, booking appointment slots, schedule timeline management, patient check-in/out, and dispatching SMS/WhatsApp reminders.
                </p>
                <div className="text-[10px] text-amber-700 font-semibold">
                  Permissions: Scheduling, Patient Intake, Queue Triage, Automated Reminders
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRoleInfoModal(false)}
                className="px-4 py-1.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheet "Users" Tab Setup Guide Modal */}
      {showSheetsGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/80 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Google Sheets: "Users" Sheet Setup Guide
                  </h3>
                  <p className="text-xs text-slate-500">
                    Connect User Management & Role Assignment directly to your Google Sheet database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetsGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center space-x-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-700" />
                <span>Why did newly added users not appear in Google Sheets?</span>
              </div>
              <p className="leading-relaxed text-amber-900/90 text-[11px]">
                Google Sheets integration requires two things:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-950 font-medium">
                <li>
                  <strong>A "Users" tab:</strong> If the spreadsheet doesn't have a tab named <code className="bg-white px-1 py-0.5 rounded font-bold border border-amber-300">Users</code>, rows cannot be stored.
                </li>
                <li>
                  <strong>Updated Apps Script Code:</strong> Your Google Apps Script webhook (<code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] border border-amber-300">Code.gs</code>) must have the <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px] border border-amber-300">create_user</code> action handler (available to copy below).
                </li>
              </ol>
            </div>

            {/* Quick Copy Headers Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Step 1: Add a new sheet named <span className="text-emerald-700">Users</span> and paste these 12 Column Headers:
                </label>
                <button
                  onClick={() => {
                    const headers = "UserID\tFullName\tEmail\tPhone\tRole\tStatus\tDepartment\tJoinedDate\tLastLogin\tAssignedBy\tPassword\tProfilePhoto";
                    navigator.clipboard.writeText(headers);
                    setCopiedSheetHeaders(true);
                    setTimeout(() => setCopiedSheetHeaders(false), 2500);
                  }}
                  className="flex items-center space-x-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer transition-colors"
                >
                  {copiedSheetHeaders ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSheetHeaders ? 'Copied to Clipboard!' : 'Copy Row 1 Headers'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-nowrap border border-slate-800">
                UserID | FullName | Email | Phone | Role | Status | Department | JoinedDate | LastLogin | AssignedBy | Password | ProfilePhoto
              </div>
            </div>

            {/* Columns breakdown table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800">Column Definitions & Data Types:</div>
              <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Col</th>
                      <th className="px-3 py-2">Header</th>
                      <th className="px-3 py-2">Example Value</th>
                      <th className="px-3 py-2">Allowed Roles / Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">A</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">UserID</td>
                      <td className="px-3 py-1.5 text-slate-600">usr-1</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Unique ID identifier</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">B</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">FullName</td>
                      <td className="px-3 py-1.5 text-slate-600">Althea Ramos</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Staff or Doctor name</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">C</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">Email</td>
                      <td className="px-3 py-1.5 text-slate-600">it.admin@drizzledental.com</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Login / Notification email</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">D</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">Phone</td>
                      <td className="px-3 py-1.5 text-slate-600">+63 922 678 9012</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Mobile phone number</td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 bg-purple-50/20">
                      <td className="px-3 py-1.5 font-bold text-purple-700">E</td>
                      <td className="px-3 py-1.5 font-bold text-purple-900">Role</td>
                      <td className="px-3 py-1.5 font-bold text-purple-700">System Admin</td>
                      <td className="px-3 py-1.5 text-purple-700 font-sans text-[10px] font-bold">
                        System Admin | Clinic Admin | Dentist | Front Desk
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">F</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">Status</td>
                      <td className="px-3 py-1.5 text-slate-600">Active</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Active | Inactive</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">G</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">Department</td>
                      <td className="px-3 py-1.5 text-slate-600">IT & Administration</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Operating department</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">H</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">JoinedDate</td>
                      <td className="px-3 py-1.5 text-slate-600">2024-01-15</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Date of employment (YYYY-MM-DD)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">I</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">LastLogin</td>
                      <td className="px-3 py-1.5 text-slate-600">Today, 08:30 AM</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Timestamp of last session</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">J</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">AssignedBy</td>
                      <td className="px-3 py-1.5 text-slate-600">System Admin</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Authorizing administrator</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">K</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">Password</td>
                      <td className="px-3 py-1.5 text-slate-600">[Set / Encrypted]</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Initial credential security flag</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-bold text-slate-400">L</td>
                      <td className="px-3 py-1.5 font-bold text-slate-800">ProfilePhoto</td>
                      <td className="px-3 py-1.5 text-slate-600">https://...</td>
                      <td className="px-3 py-1.5 text-slate-500 font-sans text-[10px]">Photo image URL or data URI</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick setup tip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800">Automated Setup in Apps Script:</div>
              <p className="text-[11px] leading-relaxed">
                You can also run the <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">setupSpreadsheet()</code> function in your Google Apps Script editor. It will automatically create the <strong>Users</strong> sheet, apply header colors, and seed all 7 staff accounts with their assigned roles.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                User roles created in the UI are also stored in local storage for instantaneous access.
              </span>
              <button
                onClick={() => setShowSheetsGuideModal(false)}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
