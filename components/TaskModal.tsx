
import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskPriority, TaskStatus, SubTask, User } from '../types';
import { Icons } from '../constants';
import { generateSubtasks } from '../services/geminiService';

interface TaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  users: User[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, users }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setSubtasks(task.subtasks);
      setImage(task.image);
      setAssignedTo(task.assignedTo);
    } else {
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setSubtasks([]);
      setImage(undefined);
      setAssignedTo(undefined);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: newSubtask, isCompleted: false }]);
    setNewSubtask('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st));
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleAiGenerate = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    const suggested = await generateSubtasks(title, description, image);
    const newSubs = suggested.map(s => ({
      id: Math.random().toString(36).substr(2, 9),
      title: s,
      isCompleted: false
    }));
    setSubtasks(prev => [...prev, ...newSubs]);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      priority,
      subtasks,
      image,
      assignedTo,
      status: task?.status || TaskStatus.TODO
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 w-full max-w-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 md:p-8 flex flex-col h-full max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">{task ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <Icons.Plus className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Task Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Focus of this operation..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Brief Context</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Execution details..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all placeholder:text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.CRITICAL}>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Ownership</label>
                    <select
                      value={assignedTo || ''}
                      onChange={(e) => setAssignedTo(e.target.value || undefined)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {users.filter(u => u.isActive).map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest">Media Documentation</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-full min-h-[160px] border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 overflow-hidden group transition-all"
                >
                  {image ? (
                    <img src={image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="text-center p-4">
                      <Icons.Plus className="text-slate-700 mx-auto" />
                      <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-widest">Attach Visuals</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-xs font-black text-slate-600 uppercase tracking-widest">Procedural Subtasks</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !title.trim()}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-30 transition-all"
                >
                  <Icons.Sparkles className="w-4 h-4" /> {isGenerating ? 'Synthesizing...' : 'AI Breakdown'}
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800 group">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-offset-slate-950"
                    />
                    <span className={`flex-1 text-sm ${st.isCompleted ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                      {st.title}
                    </span>
                    <button type="button" onClick={() => handleRemoveSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity">
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Insert custom step..."
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-sm outline-none focus:border-slate-600 transition-all placeholder:text-slate-800"
                />
                <button type="button" onClick={() => handleAddSubtask()} className="p-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">
                  <Icons.Plus />
                </button>
              </div>
            </div>

            <div className="pt-6 flex gap-3 sticky bottom-0 bg-slate-900">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-4 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-all text-sm uppercase tracking-widest">
                Discard
              </button>
              <button type="submit" className="flex-[2] px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all text-sm uppercase tracking-widest">
                {task ? 'Update Record' : 'Commit Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
