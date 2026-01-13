
import React, { useState } from 'react';
import { Icons } from '../constants';

interface StaffRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, email: string) => void;
}

const StaffRegistrationModal: React.FC<StaffRegistrationModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSave(name, email);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-tight">Access Provisioning</h2>
            <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
              <Icons.Plus className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Full Legal Name</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Ex: Alexander Pierce" 
                className="w-full px-6 py-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 focus:border-indigo-500 focus:bg-slate-950 transition-all outline-none placeholder:text-slate-800" 
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Corporate Directory Email</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="corp@identity.io" 
                className="w-full px-6 py-5 bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 focus:border-indigo-500 focus:bg-slate-950 transition-all outline-none placeholder:text-slate-800" 
              />
            </div>

            <div className="pt-6 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl hover:bg-slate-700 transition-colors uppercase text-xs tracking-widest">
                Cancel
              </button>
              <button type="submit" className="flex-[2] py-4 bg-slate-100 text-slate-950 font-black rounded-2xl shadow-xl shadow-white/5 hover:bg-white transition-all uppercase text-xs tracking-widest">
                Initialize Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistrationModal;
