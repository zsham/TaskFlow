
import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '', size = 'md' }) => {
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${heights[size]} ${className}`}>
      <div 
        className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

export default ProgressBar;
