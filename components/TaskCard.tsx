
import React from 'react';
import { Task, TaskStatus } from '../types';
import { Icons, COLORS } from '../constants';
import ProgressBar from './ProgressBar';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateStatus, onDelete, onClick }) => {
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : (task.status === TaskStatus.DONE ? 100 : 0);

  return (
    <div 
      className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden"
      onClick={() => onClick(task)}
    >
      {task.image && (
        <div className="w-full h-36 overflow-hidden border-b border-slate-800">
          <img src={task.image} alt={task.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${COLORS[task.priority]}`}>
            {task.priority}
          </span>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash /></button>
          </div>
        </div>

        <h3 className="font-bold text-slate-100 mb-2 leading-snug group-hover:text-indigo-400 transition-colors">{task.title}</h3>
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5">
              <Icons.CheckCircle className="text-slate-600" /> {completedSubtasks}/{totalSubtasks}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar progress={progress} size="sm" className="bg-slate-950" />
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
            <Icons.Clock className="text-slate-600" />
            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </div>
          
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-lg bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-500">?</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
