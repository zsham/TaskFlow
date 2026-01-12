
import React, { useMemo, useState, useEffect } from 'react';
import { Task, TaskStatus, ProjectInsight } from '../types';
import { Icons } from '../constants';
import ProgressBar from './ProgressBar';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getProjectInsights } from '../services/geminiService';

interface DashboardProps {
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const [insights, setInsights] = useState<ProjectInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const todo = tasks.filter(t => t.status === TaskStatus.TODO).length;
    const review = tasks.filter(t => t.status === TaskStatus.REVIEW).length;

    const data = [
      { name: 'To Do', value: todo, color: '#94a3b8' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Review', value: review, color: '#f59e0b' },
      { name: 'Done', value: completed, color: '#10b981' },
    ];

    const priorityData = [
      { name: 'Low', count: tasks.filter(t => t.priority === 'LOW').length },
      { name: 'Medium', count: tasks.filter(t => t.priority === 'MEDIUM').length },
      { name: 'High', count: tasks.filter(t => t.priority === 'HIGH').length },
      { name: 'Critical', count: tasks.filter(t => t.priority === 'CRITICAL').length },
    ];

    return { total, completed, inProgress, data, priorityData };
  }, [tasks]);

  const handleFetchInsights = async () => {
    setLoadingInsights(true);
    const data = await getProjectInsights(tasks);
    setInsights(data);
    setLoadingInsights(false);
  };

  useEffect(() => {
    if (tasks.length > 0 && !insights) {
      handleFetchInsights();
    }
  }, [tasks.length]);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
          <h2 className="text-3xl font-bold text-slate-800">{stats.total}</h2>
          <div className="mt-4">
             <ProgressBar progress={100} size="sm" className="opacity-20" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">Completion Rate</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </h2>
          <div className="mt-4">
             <ProgressBar progress={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} size="sm" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-1">In Progress</p>
          <h2 className="text-3xl font-bold text-slate-800">{stats.inProgress}</h2>
          <div className="mt-4">
             <ProgressBar progress={stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0} size="sm" className="bg-blue-100" />
          </div>
        </div>
      </div>

      {/* Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Task Distribution</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
          <h3 className="font-semibold text-slate-800 mb-4">Tasks by Priority</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.priorityData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Icons.Sparkles />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Project Insights</h3>
              <p className="text-xs text-slate-500">Intelligent analysis of your current workflow</p>
            </div>
          </div>
          <button 
            onClick={handleFetchInsights}
            disabled={loadingInsights || tasks.length === 0}
            className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
          >
            {loadingInsights ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>

        {insights ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-4">
              <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-white">
                <p className="text-slate-700 text-sm leading-relaxed">
                  {insights.summary}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actionable Recommendations</h4>
                <div className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 bg-white/40 p-3 rounded-lg border border-white/50 text-sm text-slate-600">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-slate-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-blue-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * insights.productivityScore) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">{insights.productivityScore}</span>
                  <span className="text-[10px] font-medium text-slate-500">Efficiency</span>
                </div>
              </div>
              <p className="text-center text-xs font-medium text-slate-500">Productivity Score</p>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
            {tasks.length === 0 ? "Add tasks to see insights" : "Click 'Refresh Insights' to generate an analysis"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
