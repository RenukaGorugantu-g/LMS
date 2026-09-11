import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Shield, CheckCircle2, XCircle, Mail, Building2, Plus, 
  ArrowRight, Network, Layers, BookOpen, Award, Flame, Trophy, Clock, 
  Calendar, Check, X, AlertCircle, RefreshCw, ChevronRight, UserPlus, 
  Filter, Bell, ExternalLink, Sparkles, UserCheck, Send, MoreVertical, Edit3, Trash2
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function UsersManagementAppView() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('DIRECTORY'); // 'DIRECTORY' | 'COHORTS' | 'DEPARTMENTS'

  // Users Directory State
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Cohorts State
  const [cohorts, setCohorts] = useState([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [cohortSearch, setCohortSearch] = useState('');

  // Modals State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedCohortDetail, setSelectedCohortDetail] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'LEARNER',
    department: 'Engineering',
    title: 'Software Engineer',
    password: 'password123',
    cohortIds: []
  });
  const [submittingUser, setSubmittingUser] = useState(false);

  // New Cohort Form State
  const [newCohortForm, setNewCohortForm] = useState({
    name: '',
    description: '',
    department: 'Security & Cloud',
    leadManagerId: '',
    targetCompletionDate: '',
    memberIds: [],
    courseIds: []
  });
  const [submittingCohort, setSubmittingCohort] = useState(false);

  // Quick Action Notification
  const [actionAlert, setActionAlert] = useState(null);

  useEffect(() => {
    loadUsers();
    loadCohorts();
    loadCourses();
  }, [search, roleFilter, deptFilter, statusFilter, cohortFilter]);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      let endpoint = `/users?search=${encodeURIComponent(search)}`;
      if (roleFilter) endpoint += `&role=${encodeURIComponent(roleFilter)}`;
      if (deptFilter) endpoint += `&department=${encodeURIComponent(deptFilter)}`;
      if (statusFilter) endpoint += `&status=${encodeURIComponent(statusFilter)}`;
      if (cohortFilter) endpoint += `&cohortId=${encodeURIComponent(cohortFilter)}`;
      const data = await apiRequest(endpoint);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadCohorts() {
    setLoadingCohorts(true);
    try {
      const data = await apiRequest('/cohorts');
      setCohorts(data);
    } catch (err) {
      console.error('Failed to load cohorts:', err);
    } finally {
      setLoadingCohorts(false);
    }
  }

  async function loadCourses() {
    try {
      const data = await apiRequest('/courses');
      setAvailableCourses(data);
    } catch (err) {}
  }

  async function viewUserDetail(userId) {
    try {
      const detail = await apiRequest(`/users/${userId}`);
      setSelectedUserDetail(detail);
    } catch (err) {
      alert('Failed to load user details: ' + err.message);
    }
  }

  async function viewCohortDetail(cohortId) {
    try {
      const detail = await apiRequest(`/cohorts/${cohortId}`);
      setSelectedCohortDetail(detail);
    } catch (err) {
      alert('Failed to load cohort details: ' + err.message);
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      await apiRequest(`/users/${userId}/status`, { method: 'POST' });
      await loadUsers();
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        await viewUserDetail(userId);
      }
      triggerAlert('User status updated successfully.');
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiRequest(`/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role: newRole })
      });
      await loadUsers();
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        await viewUserDetail(userId);
      }
      triggerAlert(`User role changed to ${newRole}.`);
    } catch (err) {
      alert('Role update failed: ' + err.message);
    }
  };

  const handleSendReminder = async (userId) => {
    try {
      const res = await apiRequest(`/users/${userId}/remind`, { method: 'POST' });
      triggerAlert(res.message || 'Reminder successfully sent.');
    } catch (err) {
      alert('Failed to send reminder: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(newUserForm)
      });
      setShowAddUserModal(false);
      setNewUserForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'LEARNER',
        department: 'Engineering',
        title: 'Software Engineer',
        password: 'password123',
        cohortIds: []
      });
      await loadUsers();
      await loadCohorts();
      triggerAlert('New user successfully provisioned and enrolled.');
    } catch (err) {
      alert('Failed to create user: ' + err.message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    setSubmittingCohort(true);
    try {
      await apiRequest('/cohorts', {
        method: 'POST',
        body: JSON.stringify(newCohortForm)
      });
      setShowCreateCohortModal(false);
      setNewCohortForm({
        name: '',
        description: '',
        department: 'Security & Cloud',
        leadManagerId: '',
        targetCompletionDate: '',
        memberIds: [],
        courseIds: []
      });
      await loadCohorts();
      await loadUsers();
      triggerAlert('Cohort created and assigned members automatically enrolled!');
    } catch (err) {
      alert('Failed to create cohort: ' + err.message);
    } finally {
      setSubmittingCohort(false);
    }
  };

  const handleNudgeCohort = async (cohortId) => {
    try {
      const res = await apiRequest(`/cohorts/${cohortId}/nudge`, { method: 'POST' });
      triggerAlert(res.message || 'Cohort members nudged!');
    } catch (err) {
      alert('Failed to nudge cohort: ' + err.message);
    }
  };

  const handleDeleteCohort = async (cohortId) => {
    if (!window.confirm('Are you sure you want to delete this cohort? Members will not lose existing course progress.')) return;
    try {
      await apiRequest(`/cohorts/${cohortId}`, { method: 'DELETE' });
      await loadCohorts();
      if (selectedCohortDetail?.id === cohortId) setSelectedCohortDetail(null);
      triggerAlert('Cohort removed successfully.');
    } catch (err) {
      alert('Failed to delete cohort: ' + err.message);
    }
  };

  const handleAddMemberToCohort = async (cohortId, userId) => {
    try {
      await apiRequest(`/cohorts/${cohortId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userIds: [userId] })
      });
      await viewCohortDetail(cohortId);
      await loadCohorts();
      triggerAlert('Member added and auto-enrolled in cohort curriculum.');
    } catch (err) {
      alert('Failed to add member: ' + err.message);
    }
  };

  const handleRemoveMemberFromCohort = async (cohortId, userId) => {
    try {
      await apiRequest(`/cohorts/${cohortId}/members/${userId}`, { method: 'DELETE' });
      await viewCohortDetail(cohortId);
      await loadCohorts();
      triggerAlert('Member removed from cohort.');
    } catch (err) {
      alert('Failed to remove member: ' + err.message);
    }
  };

  const handleAssignCourseToCohort = async (cohortId, courseId) => {
    try {
      await apiRequest(`/cohorts/${cohortId}/courses`, {
        method: 'POST',
        body: JSON.stringify({ courseIds: [courseId] })
      });
      await viewCohortDetail(cohortId);
      await loadCohorts();
      triggerAlert('Course assigned and all cohort members enrolled!');
    } catch (err) {
      alert('Failed to assign course: ' + err.message);
    }
  };

  const handleRemoveCourseFromCohort = async (cohortId, courseId) => {
    try {
      await apiRequest(`/cohorts/${cohortId}/courses/${courseId}`, { method: 'DELETE' });
      await viewCohortDetail(cohortId);
      await loadCohorts();
      triggerAlert('Course unassigned from cohort.');
    } catch (err) {
      alert('Failed to remove course: ' + err.message);
    }
  };

  const handleEnrollUserInCourse = async (userId, courseId) => {
    try {
      await apiRequest(`/users/${userId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ courseIds: [courseId] })
      });
      await viewUserDetail(userId);
      await loadUsers();
      triggerAlert('User successfully enrolled in course.');
    } catch (err) {
      alert('Failed to enroll: ' + err.message);
    }
  };

  function triggerAlert(msg) {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 4000);
  }

  // Calculate Metrics
  const totalUsersCount = users.length;
  const activeLearnersCount = users.filter(u => u.role === 'LEARNER' && u.status === 'ACTIVE').length;
  const creatorsCount = users.filter(u => u.role === 'COURSE_CREATOR').length;
  const adminsCount = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;

  const filteredCohorts = cohorts.filter(c => 
    c.name.toLowerCase().includes(cohortSearch.toLowerCase()) ||
    (c.department && c.department.toLowerCase().includes(cohortSearch.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      {/* Alert Banner */}
      {actionAlert && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-2xl bg-red-50 text-red-600 border border-red-200/80">
              🍁
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Learners, Teams &amp; Cohorts Hub
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
                  Enterprise RBAC
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage organization members, structured learning cohorts, and automated curriculum assignments
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowCreateCohortModal(true)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
          >
            <Network className="w-4 h-4 text-brand-600" />
            <span>+ New Cohort</span>
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add / Invite Learner</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Directory</span>
            <div className="text-xl font-black text-slate-900">{totalUsersCount} Users</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Active Learners</span>
            <div className="text-xl font-black text-slate-900">{activeLearnersCount} Enrolled</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Course Creators</span>
            <div className="text-xl font-black text-slate-900">{creatorsCount} Authors</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Active Cohorts</span>
            <div className="text-xl font-black text-slate-900">{cohorts.length} Groups</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200/80">
        <button
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'DIRECTORY'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Learners &amp; Users Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COHORTS')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'COHORTS'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Cohorts &amp; Learner Groups ({cohorts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`px-5 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'DEPARTMENTS'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Metrics</span>
        </button>
      </div>

      {/* TAB 1: LEARNERS & USERS DIRECTORY */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, corporate email, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
              >
                <option value="">All Roles</option>
                <option value="LEARNER">Learner</option>
                <option value="COURSE_CREATOR">Course Creator</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Security & Cloud">Security &amp; Cloud</option>
                <option value="Architecture">Architecture</option>
                <option value="DevOps & SRE">DevOps &amp; SRE</option>
                <option value="Product & Operations">Product &amp; Operations</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
              >
                <option value="">All Cohorts</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 font-medium"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Learner Profile</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department &amp; Title</th>
                    <th className="py-3 px-4">Cohort Memberships</th>
                    <th className="py-3 px-4">Courses &amp; Certs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      {/* Learner Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {u.first_name} {u.last_name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          u.role === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : u.role === 'COURSE_CREATOR'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {u.role === 'COURSE_CREATOR' ? 'Course Creator' : u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Dept & Title */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{u.department || 'General'}</span>
                        <span className="text-[11px] text-slate-400">{u.title || 'Specialist'}</span>
                      </td>

                      {/* Cohort Memberships */}
                      <td className="py-3.5 px-4">
                        {u.cohorts && u.cohorts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.cohorts.map((ch) => (
                              <span
                                key={ch.id}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200/80"
                              >
                                {ch.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No assigned cohorts</span>
                        )}
                      </td>

                      {/* Courses & Certs */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-extrabold text-slate-700">
                            {u.completed_courses_count || 0}/{u.enrolled_courses_count || 0} Courses Completed
                          </span>
                          {u.certificates_count > 0 && (
                            <span className="text-amber-600 font-bold block flex items-center gap-1">
                              <Award className="w-3 h-3 text-amber-500" />
                              <span>{u.certificates_count} Verified Certs</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{u.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => viewUserDetail(u.id)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleSendReminder(u.id)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded-lg"
                            title="Send Compliance / Course Nudge"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`p-1 rounded-lg ${u.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-600' : 'text-slate-400 hover:text-emerald-600'}`}
                            title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          >
                            {u.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COHORTS & LEARNER GROUPS */}
      {activeTab === 'COHORTS' && (
        <div className="space-y-6">
          {/* Cohorts Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search cohorts by name or department..."
                value={cohortSearch}
                onChange={(e) => setCohortSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-900"
              />
            </div>

            <button
              onClick={() => setShowCreateCohortModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Cohort</span>
            </button>
          </div>

          {/* Cohorts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCohorts.map((ch) => (
              <div
                key={ch.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-subtle hover:shadow-card transition flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                      {ch.department}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ch.target_completion_date ? `Due ${ch.target_completion_date}` : 'Self-Paced'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{ch.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {ch.description || 'Structured learning cohort with automated curriculum assignment.'}
                    </p>
                  </div>

                  {/* Lead Manager info */}
                  {ch.lead_name && (
                    <div className="flex items-center space-x-2 pt-1 text-xs text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Lead:</span>
                      <span className="font-bold text-slate-800">{ch.lead_name}</span>
                    </div>
                  )}

                  {/* Aggregate Progress Bar */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Cohort Completion Rate</span>
                      <span className="font-black font-mono text-red-600">{ch.avg_progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${ch.avg_progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Member & Course count metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Enrolled Learners</span>
                      <span className="text-base font-black text-slate-900">{ch.member_count || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-center">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Assigned Courses</span>
                      <span className="text-base font-black text-slate-900">{ch.course_count || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleNudgeCohort(ch.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center space-x-1"
                    title="Send reminder to incomplete members"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nudge</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => viewCohortDetail(ch.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleDeleteCohort(ch.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition"
                      title="Delete cohort"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS & METRICS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Engineering', 'Security & Cloud', 'DevOps & SRE'].map((dept) => {
              const deptUsers = users.filter(u => u.department === dept);
              const deptCompleted = deptUsers.reduce((sum, u) => sum + (u.completed_courses_count || 0), 0);
              const deptEnrolled = deptUsers.reduce((sum, u) => sum + (u.enrolled_courses_count || 0), 0);
              const rate = deptEnrolled > 0 ? Math.round((deptCompleted / deptEnrolled) * 100) : 0;

              return (
                <div key={dept} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-base">{dept}</h3>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                      {rate}% Completion
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Members:</span>
                      <span className="font-bold text-slate-800">{deptUsers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Completed Courses:</span>
                      <span className="font-bold text-emerald-600">{deptCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">In-Progress Enrollments:</span>
                      <span className="font-bold text-blue-600">{deptEnrolled - deptCompleted}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / INVITE LEARNER */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Provision New Learner / User</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.firstName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="e.g. David"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.lastName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="e.g. Miller"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="name@acmeglobal.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="LEARNER">Learner</option>
                    <option value="COURSE_CREATOR">Course Creator / Manager</option>
                    <option value="ADMIN">Operational Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={newUserForm.department}
                    onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Security & Cloud">Security &amp; Cloud</option>
                    <option value="Architecture">Architecture</option>
                    <option value="DevOps & SRE">DevOps &amp; SRE</option>
                    <option value="Product & Operations">Product &amp; Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  value={newUserForm.title}
                  onChange={(e) => setNewUserForm({ ...newUserForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  placeholder="e.g. Cloud Security Analyst"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign to Cohorts (Optional)</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {cohorts.map((ch) => {
                    const isChecked = newUserForm.cohortIds.includes(ch.id);
                    return (
                      <label key={ch.id} className="flex items-center space-x-2 text-xs cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? newUserForm.cohortIds.filter(id => id !== ch.id)
                              : [...newUserForm.cohortIds, ch.id];
                            setNewUserForm({ ...newUserForm, cohortIds: updated });
                          }}
                          className="rounded text-red-600 focus:ring-0"
                        />
                        <span className="font-bold text-slate-800">{ch.name}</span>
                        <span className="text-[10px] text-slate-400">({ch.department})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {submittingUser ? 'Provisioning...' : 'Confirm & Add Learner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE COHORT */}
      {showCreateCohortModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Create Learning Cohort</h3>
              </div>
              <button
                onClick={() => setShowCreateCohortModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cohort Name</label>
                <input
                  type="text"
                  required
                  value={newCohortForm.name}
                  onChange={(e) => setNewCohortForm({ ...newCohortForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  placeholder="e.g. 2026 Q4 Cloud Architecture Residency"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCohortForm.description}
                  onChange={(e) => setNewCohortForm({ ...newCohortForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  placeholder="Curricular objective and target milestones..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department</label>
                  <select
                    value={newCohortForm.department}
                    onChange={(e) => setNewCohortForm({ ...newCohortForm, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                  >
                    <option value="Security & Cloud">Security &amp; Cloud</option>
                    <option value="Engineering">Engineering</option>
                    <option value="DevOps & SRE">DevOps &amp; SRE</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Product & Operations">Product &amp; Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newCohortForm.targetCompletionDate}
                    onChange={(e) => setNewCohortForm({ ...newCohortForm, targetCompletionDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>
              </div>

              {/* Assign Initial Courses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assign Curriculum (Auto-enrolls members)</label>
                <div className="space-y-1.5 max-h-28 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {availableCourses.map((c) => {
                    const isChecked = newCohortForm.courseIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center space-x-2 text-xs cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? newCohortForm.courseIds.filter(id => id !== c.id)
                              : [...newCohortForm.courseIds, c.id];
                            setNewCohortForm({ ...newCohortForm, courseIds: updated });
                          }}
                          className="rounded text-red-600 focus:ring-0"
                        />
                        <span className="font-bold text-slate-800 truncate">{c.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Assign Initial Members */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Initial Members</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                  {users.filter(u => u.role === 'LEARNER').map((u) => {
                    const isChecked = newCohortForm.memberIds.includes(u.id);
                    return (
                      <label key={u.id} className="flex items-center space-x-2 text-xs cursor-pointer p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? newCohortForm.memberIds.filter(id => id !== u.id)
                              : [...newCohortForm.memberIds, u.id];
                            setNewCohortForm({ ...newCohortForm, memberIds: updated });
                          }}
                          className="rounded text-red-600 focus:ring-0"
                        />
                        <span className="font-bold text-slate-800">{u.first_name} {u.last_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({u.email})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCohortModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCohort}
                  className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {submittingCohort ? 'Creating...' : 'Create Cohort & Auto-Enroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: USER PROFILE & ENROLLMENTS DETAIL */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUserDetail.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {selectedUserDetail.first_name} {selectedUserDetail.last_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <span>{selectedUserDetail.email}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-700">{selectedUserDetail.department}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">XP Score</span>
                  <span className="text-base font-black text-red-600">{selectedUserDetail.points || 0} pts</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Daily Streak</span>
                  <span className="text-base font-black text-amber-600">{selectedUserDetail.streak_days || 0} Days 🔥</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Certifications</span>
                  <span className="text-base font-black text-emerald-600">{selectedUserDetail.certificates?.length || 0} Verified</span>
                </div>
              </div>

              {/* Cohorts Membership */}
              <div>
                <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider mb-2">
                  Assigned Cohorts
                </h4>
                {selectedUserDetail.cohorts?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedUserDetail.cohorts.map((ch) => (
                      <span
                        key={ch.id}
                        className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200 text-xs"
                      >
                        {ch.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Not currently enrolled in any learning cohorts.</p>
                )}
              </div>

              {/* Enrolled Courses Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">
                    Enrolled Courses ({selectedUserDetail.enrollments?.length || 0})
                  </h4>
                  {/* Direct Enroll Quick Action */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleEnrollUserInCourse(selectedUserDetail.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 cursor-pointer"
                  >
                    <option value="">+ Direct Enroll in Course...</option>
                    {availableCourses
                      .filter(c => !selectedUserDetail.enrollments?.some(e => e.course_id === c.id))
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="p-2.5">Course Title</th>
                        <th className="p-2.5">Progress</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedUserDetail.enrollments?.map((enr) => (
                        <tr key={enr.id}>
                          <td className="p-2.5 font-bold text-slate-800">{enr.course_title}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${enr.progress_percent || 0}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-slate-500">{enr.progress_percent}%</span>
                            </div>
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              enr.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {enr.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: COHORT DETAIL & MANAGEMENT */}
      {selectedCohortDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedCohortDetail.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCohortDetail.department} • Lead: {selectedCohortDetail.lead_name || 'Unassigned'}</p>
              </div>
              <button
                onClick={() => setSelectedCohortDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Assigned Curriculum */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">
                    Assigned Cohort Courses ({selectedCohortDetail.courses?.length || 0})
                  </h4>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignCourseToCohort(selectedCohortDetail.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                  >
                    <option value="">+ Assign Course to Cohort...</option>
                    {availableCourses
                      .filter(c => !selectedCohortDetail.courses?.some(cc => cc.id === c.id))
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCohortDetail.courses?.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="font-extrabold text-slate-900 block truncate">{c.title}</span>
                        <span className="text-[10px] text-slate-400">{c.category} • {c.duration_minutes}m</span>
                      </div>
                      <button
                        onClick={() => handleRemoveCourseFromCohort(selectedCohortDetail.id, c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Course"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Members & Progress Roster */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider">
                    Cohort Learners ({selectedCohortDetail.members?.length || 0})
                  </h4>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddMemberToCohort(selectedCohortDetail.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
                  >
                    <option value="">+ Add Learner to Cohort...</option>
                    {users
                      .filter(u => u.role === 'LEARNER' && !selectedCohortDetail.members?.some(m => m.id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                      ))}
                  </select>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="p-2.5">Learner</th>
                        <th className="p-2.5">Overall Progress</th>
                        <th className="p-2.5">Courses Completed</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCohortDetail.members?.map((m) => (
                        <tr key={m.id}>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900 block">{m.first_name} {m.last_name}</span>
                            <span className="text-[10px] text-slate-400">{m.email}</span>
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${m.overall_cohort_progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-slate-600 font-bold">{m.overall_cohort_progress || 0}%</span>
                            </div>
                          </td>
                          <td className="p-2.5 font-bold text-slate-700">
                            {m.completed_count || 0} / {selectedCohortDetail.courses?.length || 0} Completed
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleRemoveMemberFromCohort(selectedCohortDetail.id, m.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove from Cohort"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
