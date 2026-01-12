
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Personnel Registration</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Icons.Plus className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
              <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g. Alex Rivera" 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
              <input 
                required 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="alex@company.com" 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-indigo-100 focus:bg-white transition-all outline-none" 
              />
            </div>

            <div className="pt-6 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Register Record
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffRegistrationModal;
