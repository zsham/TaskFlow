
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, User, UserRole } from './types';
import { Icons, COLORS } from './constants';
import TaskCard from './components/TaskCard';
import Dashboard from './components/Dashboard';
import TaskModal from './components/TaskModal';
import ProfileModal from './components/ProfileModal';
import TeamView from './components/TeamView';
import StaffRegistrationModal from './components/StaffRegistrationModal';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'board' | 'dashboard' | 'team'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow_tasks');
    const savedUsers = localStorage.getItem('taskflow_users');
    const savedSession = localStorage.getItem('taskflow_user_id');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      if (savedSession) {
        const found = parsedUsers.find((u: User) => u.id === savedSession);
        if (found) setCurrentUser(found);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_users', JSON.stringify(users));
  }, [users]);

  // Google Auth
  useEffect(() => {
    if ((window as any).google && !currentUser) {
      (window as any).google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        callback: handleGoogleResponse,
      });
      const btn = document.getElementById('google-signin-btn');
      if (btn) (window as any).google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: '300' });
    }
  }, [currentUser]);

  const handleGoogleResponse = (response: any) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const profile = JSON.parse(jsonPayload);
      let existingUser = users.find(u => u.email === profile.email);
      if (!existingUser) {
        const isFirst = users.length === 0;
        const newUser: User = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          role: isFirst ? UserRole.ADMIN : UserRole.STAFF,
          isActive: isFirst,
          joinedAt: Date.now()
        };
        setUsers(prev => [...prev, newUser]);
        existingUser = newUser;
      }
      setCurrentUser(existingUser);
      localStorage.setItem('taskflow_user_id', existingUser.id);
    } catch (e) { console.error("Auth error:", e); }
  };

  const logout = () => { 
    localStorage.removeItem('taskflow_user_id');
    setCurrentUser(null);
    setView('board');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Remove this staff member?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTasks(prev => prev.map(t => t.assignedTo === userId ? { ...t, assignedTo: undefined } : t));
    }
  };

  const handleAddStaff = (name: string, email: string) => {
    const newStaff: User = {
      id: Math.random().toString(36).substr(2, 9),
      name, email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=cbd5e1`,
      role: UserRole.STAFF,
      isActive: true,
      joinedAt: Date.now()
    };
    setUsers(prev => [...prev, newStaff]);
  };

  const handleUpdateStaff = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, searchQuery]);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'Untitled',
      description: taskData.description || '',
      status: TaskStatus.TODO,
      priority: taskData.priority || TaskPriority.MEDIUM,
      subtasks: taskData.subtasks || [],
      createdAt: Date.now(),
      tags: [],
      createdBy: currentUser?.id,
      assignedTo: taskData.assignedTo,
      image: taskData.image
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    if (currentUser?.role !== UserRole.ADMIN) {
      alert("Only Admins can delete tasks.");
      return;
    }
    if (confirm('Delete this task?')) setTasks(tasks.filter(t => t.id !== id));
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const navItems = [
    { id: 'board', label: 'Board', icon: <Icons.Board /> },
    { id: 'dashboard', label: 'Insights', icon: <Icons.Activity /> },
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'team', label: 'Team', icon: <Icons.Users /> }] : [])
  ];

  if (!currentUser) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950 p-6 text-center">
      <div className="max-w-sm w-full bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-10 border border-slate-800 animate-slide-up">
        <div className="inline-flex p-5 bg-indigo-600 rounded-[1.5rem] text-white mb-8 shadow-xl shadow-indigo-500/20">
          <Icons.CheckCircle />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">TaskFlow</h1>
        <p className="text-slate-500 mb-10 text-sm leading-relaxed">Precision task management for high-output teams.</p>
        <div id="google-signin-btn" className="flex justify-center mb-8" />
        <div className="pt-6 border-t border-slate-800">
           <button onClick={() => handleGoogleResponse({ credential: "mock.eyJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwibmFtZSI6IkFkbWluIFVzZXIiLCJwaWN0dXJlIjoiaHR0cHM6Ly91aS1hdmF0YXJzLmNvbS9hdmF0YXIvQWRtaW4rVXNlcj9iYWNrZ3JvdW5kPTFlMjkzYiZjb2xvcj1mZmYiLCJzdWIiOiJhZG1pbi0xIn0=" })} className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Demo Admin Access</button>
        </div>
      </div>
    </div>
  );

  if (!currentUser.isActive) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-950 p-6 text-center">
       <div className="max-w-md bg-slate-900 p-12 rounded-[2.5rem] shadow-xl border border-slate-800 animate-slide-up">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6"><Icons.Clock /></div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Pending Activation</h2>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed">Your workspace account is registered. Please contact your administrator to authorize your access.</p>
          <button onClick={logout} className="w-full py-3 bg-slate-800 text-slate-200 font-semibold rounded-2xl hover:bg-slate-700 transition-all">Sign Out</button>
       </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] bg-slate-950 overflow-hidden flex-col lg:flex-row">
      {/* Desktop Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex-col p-6 hidden lg:flex relative z-40">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Icons.CheckCircle />
          </div>
          <span className="font-bold text-slate-100 tracking-tight">TaskFlow</span>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)} 
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${view === item.id ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 space-y-4">
           <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={currentUser.picture} className="w-9 h-9 rounded-xl object-cover border border-slate-800" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-widest">{currentUser.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsProfileModalOpen(true)} className="flex-1 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-900 rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors uppercase">Settings</button>
                <button 
                  onClick={(e) => { e.preventDefault(); logout(); }} 
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer" 
                  title="Logout"
                >
                  <Icons.LogOut />
                </button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pb-20 lg:pb-0">
        <header className="h-20 glass border-b border-slate-800 px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-bold text-slate-100 capitalize hidden sm:block">{view === 'board' ? 'Workspace Board' : view}</h2>
            <div className="h-4 w-px bg-slate-800 hidden sm:block" />
            <div className="relative w-full sm:w-72">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Search /></span>
               <input 
                type="text" placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 rounded-xl text-sm border border-slate-800 text-slate-200 focus:border-indigo-500 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
               />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-4">
             {view === 'team' ? (
                <button onClick={() => setIsStaffModalOpen(true)} className="px-4 py-2.5 lg:px-5 bg-slate-100 text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-white/5 hover:bg-white hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Icons.Plus /> <span className="hidden sm:inline">Register Staff</span>
                </button>
             ) : (
                <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="px-4 py-2.5 lg:px-5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  <Icons.Plus /> <span className="hidden sm:inline">New Task</span>
                </button>
             )}
             <div className="lg:hidden">
               <img src={currentUser.picture} onClick={() => setIsProfileModalOpen(true)} className="w-9 h-9 rounded-xl object-cover cursor-pointer border border-slate-800" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-8 min-h-full">
            {view === 'board' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-full lg:h-full lg:overflow-hidden">
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(status => {
                  const cols: Record<string, any> = {
                    TODO: { title: 'Backlog', icon: '○' },
                    IN_PROGRESS: { title: 'In Progress', icon: '◔' },
                    REVIEW: { title: 'Review', icon: '◉' },
                    DONE: { title: 'Completed', icon: '●' }
                  };
                  return (
                    <div key={status} className="flex flex-col gap-4 min-w-[280px] lg:h-full">
                      <div className="flex items-center justify-between px-2 mb-2 flex-shrink-0">
                        <div className="flex items-center gap-3">
                           <span className="text-slate-600 font-mono text-lg leading-none">{cols[status].icon}</span>
                           <h3 className="text-sm font-bold text-slate-300">{cols[status].title}</h3>
                           <span className="text-[10px] font-black bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">{filteredTasks.filter(t => t.status === status).length}</span>
                        </div>
                      </div>
                      <div className="lg:flex-1 space-y-4 lg:overflow-y-auto custom-scrollbar pb-4">
                        {filteredTasks.filter(t => t.status === status).map(task => (
                          <TaskCard key={task.id} task={task} onClick={handleTaskClick} onDelete={deleteTask} onUpdateStatus={(id, s) => updateTask(id, { status: s })} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : view === 'dashboard' ? (
              <div className="animate-slide-up"><Dashboard tasks={tasks} /></div>
            ) : (
              <div className="animate-slide-up">
                <TeamView 
                  users={users} 
                  tasks={tasks} 
                  onToggleUserStatus={handleToggleUserStatus} 
                  onDeleteUser={handleDeleteUser} 
                  onAddStaff={handleAddStaff} 
                  onUpdateStaff={handleUpdateStaff}
                  onRequestAdd={() => setIsStaffModalOpen(true)}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 h-20 px-6 flex items-center justify-around z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id as any)} 
            className={`flex flex-col items-center gap-1.5 transition-all ${view === item.id ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            <div className={`p-1 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-500/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <TaskModal 
        isOpen={isModalOpen} task={editingTask} onClose={() => setIsModalOpen(false)} users={users}
        onSave={(data) => { editingTask ? updateTask(editingTask.id, data) : addTask(data); }}
      />
      <StaffRegistrationModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
        onSave={(name, email) => { handleAddStaff(name, email); setIsStaffModalOpen(false); }} 
      />
      <ProfileModal 
        user={currentUser} isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}
        onSave={(updated) => { setUsers(users.map(u => u.id === updated.id ? updated : u)); setCurrentUser(updated); }}
        onLogout={logout}
      />
    </div>
  );
};

export default App;
