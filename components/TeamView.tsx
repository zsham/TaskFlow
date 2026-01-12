
import React, { useState, useMemo } from 'react';
import { User, UserRole, Task, TaskStatus } from '../types';
import { Icons } from '../constants';
import ProgressBar from './ProgressBar';

interface TeamViewProps {
  users: User[];
  tasks: Task[];
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddStaff: (name: string, email: string) => void;
  onUpdateStaff: (userId: string, updates: Partial<User>) => void;
  onRequestAdd: () => void;
}

const TeamView: React.FC<TeamViewProps> = ({ users, tasks, onToggleUserStatus, onDeleteUser, onAddStaff, onUpdateStaff, onRequestAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

  const getUserStats = (userId: string) => {
    const userTasks = tasks.filter(t => t.assignedTo === userId);
    const completed = userTasks.filter(t => t.status === TaskStatus.DONE).length;
    const progress = userTasks.length > 0 ? (completed / userTasks.length) * 100 : 0;
    return { total: userTasks.length, completed, progress };
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && user.isActive) || 
                           (statusFilter === 'PENDING' && !user.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const teamMetrics = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    pending: users.filter(u => !u.isActive).length,
  }), [users]);

  return (
    <div className="space-y-8 pb-12 relative z-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Team</h2>
          <p className="text-slate-500 text-sm mt-1">Directory and performance oversight for all {users.length} registered personnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRequestAdd}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Icons.Plus /> Register Staff
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Icons.Users /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
            <h4 className="text-2xl font-bold text-slate-900">{teamMetrics.total}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Icons.CheckCircle /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Members</p>
            <h4 className="text-2xl font-bold text-slate-900">{teamMetrics.active}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Icons.Clock /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Approval</p>
            <h4 className="text-2xl font-bold text-slate-900">{teamMetrics.pending}</h4>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Search /></span>
             <input 
              type="text" 
              placeholder="Filter by name or email..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm border-transparent focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
             />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-50 rounded-xl text-sm border-transparent font-semibold text-slate-600 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PENDING">Pending Only</option>
          </select>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setDisplayMode('grid')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${displayMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setDisplayMode('list')} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${displayMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Main Staff Display */}
      {displayMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredUsers.map(user => {
            const stats = getUserStats(user.id);
            return (
              <div key={user.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => onUpdateStaff(user.id, {})} className="p-2 text-slate-400 hover:text-indigo-600"><Icons.Edit /></button>
                  {user.role !== UserRole.ADMIN && <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600"><Icons.Trash /></button>}
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-3xl object-cover shadow-lg group-hover:scale-105 transition-transform" />
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{user.name}</h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${user.role === UserRole.ADMIN ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>{user.role}</span>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Velocity</span>
                      <span className="text-xs font-bold text-slate-900">{Math.round(stats.progress)}%</span>
                    </div>
                    <ProgressBar progress={stats.progress} size="sm" />
                  </div>
                  
                  <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="text-center flex-1 border-r border-slate-200">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Assigned</p>
                      <p className="text-sm font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Closed</p>
                      <p className="text-sm font-bold text-emerald-600">{stats.completed}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onToggleUserStatus(user.id)}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isActive ? 'text-slate-400 hover:bg-slate-100' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}
                  >
                    {user.isActive ? 'Suspend Access' : 'Activate Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {user.isActive ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3 w-40">
                        <ProgressBar progress={stats.progress} size="sm" />
                        <span className="text-[10px] font-bold text-slate-600">{Math.round(stats.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onUpdateStaff(user.id, {})} className="p-2 text-slate-400 hover:text-indigo-600" title="Edit Staff"><Icons.Edit /></button>
                         <button onClick={() => onToggleUserStatus(user.id)} className={`p-2 ${user.isActive ? 'text-slate-400 hover:text-amber-600' : 'text-indigo-600 hover:text-indigo-700'}`} title={user.isActive ? 'Suspend' : 'Activate'}><Icons.CheckCircle /></button>
                         {user.role !== UserRole.ADMIN && <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-rose-600" title="Delete"><Icons.Trash /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-200 border-dashed">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
             <Icons.Users />
          </div>
          <p className="text-slate-500 font-medium">No team members match your criteria.</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} className="mt-2 text-indigo-600 font-bold text-sm hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
};

export default TeamView;
