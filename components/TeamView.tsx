
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Organization Team</h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Directory & Performance Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRequestAdd}
            className="px-6 py-3 bg-slate-100 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5 hover:bg-white transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Icons.Plus /> Register Staff
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center"><Icons.Users /></div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Headcount</p>
            <h4 className="text-2xl font-bold text-slate-100">{teamMetrics.total}</h4>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center"><Icons.CheckCircle /></div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Status</p>
            <h4 className="text-2xl font-bold text-slate-100">{teamMetrics.active}</h4>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center"><Icons.Clock /></div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Authorization Pending</p>
            <h4 className="text-2xl font-bold text-slate-100">{teamMetrics.pending}</h4>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"><Icons.Search /></span>
             <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 rounded-xl text-sm border border-slate-800 text-slate-300 focus:ring-2 focus:ring-indigo-500/10 focus:border-slate-700 transition-all outline-none"
             />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 bg-slate-950 rounded-xl text-xs border border-slate-800 font-bold uppercase tracking-widest text-slate-500 outline-none"
          >
            <option value="ALL">All Units</option>
            <option value="ACTIVE">Authorized</option>
            <option value="PENDING">Restricted</option>
          </select>
        </div>
        
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setDisplayMode('grid')} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'grid' ? 'bg-slate-800 text-indigo-400' : 'text-slate-600'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setDisplayMode('list')} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'list' ? 'bg-slate-800 text-indigo-400' : 'text-slate-600'}`}
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
              <div key={user.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-sm hover:border-slate-700 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => onUpdateStaff(user.id, {})} className="p-2 text-slate-600 hover:text-indigo-400"><Icons.Edit /></button>
                  {user.role !== UserRole.ADMIN && <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-600 hover:text-rose-400"><Icons.Trash /></button>}
                </div>

                <div className="flex flex-col items-center mb-8">
                  <div className="relative mb-4">
                    <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-800 group-hover:scale-105 transition-transform opacity-90" />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-900 ${user.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg mb-1">{user.name}</h3>
                  <span className={`text-[10px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest border ${user.role === UserRole.ADMIN ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>{user.role}</span>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-800">
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Throughput</span>
                      <span className="text-xs font-bold text-slate-300">{Math.round(stats.progress)}%</span>
                    </div>
                    <ProgressBar progress={stats.progress} size="sm" className="bg-slate-950" />
                  </div>
                  
                  <div className="flex justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
                    <div className="text-center flex-1 border-r border-slate-800">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Queue</p>
                      <p className="text-sm font-bold text-slate-200">{stats.total}</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Finalized</p>
                      <p className="text-sm font-bold text-emerald-400">{stats.completed}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => onToggleUserStatus(user.id)}
                    className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isActive ? 'text-slate-500 border border-slate-800 hover:bg-slate-800' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}
                  >
                    {user.isActive ? 'Revoke Access' : 'Authorize Login'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Personnel</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Velocity Index</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.map(user => {
                const stats = getUserStats(user.id);
                return (
                  <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-slate-800" />
                        <div>
                          <p className="text-sm font-bold text-slate-200">{user.name}</p>
                          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                        {user.isActive ? 'Authorized' : 'Restricted'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3 w-40">
                        <ProgressBar progress={stats.progress} size="sm" className="bg-slate-950" />
                        <span className="text-[10px] font-bold text-slate-500">{Math.round(stats.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onUpdateStaff(user.id, {})} className="p-2 text-slate-500 hover:text-indigo-400"><Icons.Edit /></button>
                         <button onClick={() => onToggleUserStatus(user.id)} className={`p-2 ${user.isActive ? 'text-slate-500 hover:text-amber-400' : 'text-indigo-400 hover:text-indigo-300'}`}><Icons.CheckCircle /></button>
                         {user.role !== UserRole.ADMIN && <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-500 hover:text-rose-400"><Icons.Trash /></button>}
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
        <div className="py-24 text-center bg-slate-900 rounded-[2rem] border border-slate-800 border-dashed">
          <div className="w-16 h-16 bg-slate-950 text-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
             <Icons.Users className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">Zero Results Found</p>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }} className="mt-4 text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-300">Clear Search Parameters</button>
        </div>
      )}
    </div>
  );
};

export default TeamView;
