
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole } from '../types';
import { Icons } from '../constants';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  onLogout: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onSave, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [picture, setPicture] = useState(user.picture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setEmail(user.email);
      setPicture(user.picture);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...user,
      name,
      email,
      picture
    });
    onClose();
  };

  const handleSignOut = () => {
    onLogout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-tight">System Identity</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <Icons.Plus className="rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <img src={picture} alt={name} className="w-24 h-24 rounded-3xl border-4 border-slate-800 shadow-xl object-cover" />
                <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-black uppercase tracking-widest">Update</span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
              <div className="text-center">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${user.role === UserRole.ADMIN ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                   {user.role} Authorization
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Personnel Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 ml-1">Network Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 uppercase text-xs tracking-widest"
              >
                Commit Changes
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-colors uppercase text-[10px] tracking-widest"
                >
                  Return
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex-1 px-6 py-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold rounded-xl hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
                >
                  <Icons.LogOut className="w-4 h-4" /> Terminate
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
