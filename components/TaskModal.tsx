
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 md:p-8 flex flex-col h-full max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{task ? 'Edit Task' : 'New Task'}</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icons.Plus className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Add context or details..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.CRITICAL}>Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To</label>
                    <select
                      value={assignedTo || ''}
                      onChange={(e) => setAssignedTo(e.target.value || undefined)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                <label className="block text-sm font-semibold text-slate-700">Media</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-full min-h-[160px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden"
                >
                  {image ? (
                    <img src={image} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Icons.Plus />
                      <p className="text-xs font-medium text-slate-500 mt-2">Add Image</p>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">Subtasks</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !title.trim()}
                  className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <Icons.Sparkles /> {isGenerating ? 'AI Working...' : 'AI Suggestions'}
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600"
                    />
                    <span className={`flex-1 text-sm ${st.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {st.title}
                    </span>
                    <button type="button" onClick={() => handleRemoveSubtask(st.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500">
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
                  placeholder="Add custom subtask..."
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                />
                <button type="button" onClick={() => handleAddSubtask()} className="p-2 bg-slate-200 rounded-lg">
                  <Icons.Plus />
                </button>
              </div>
            </div>

            <div className="pt-6 flex gap-3 sticky bottom-0 bg-white">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-semibold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="flex-[2] px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200">
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
