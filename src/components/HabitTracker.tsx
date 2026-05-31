/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HabitCategory, HabitLog, Habit 
} from '../types';
import { 
  Plus, Trash2, Edit3, X, Sliders, ClipboardList, Check, Calendar, ArrowRight, BarChart2, Coffee, Moon, Sun, Award, Flame, Trophy, Sparkles, Settings
} from 'lucide-react';

interface HabitTrackerProps {
  categories: HabitCategory[];
  logs: HabitLog[];
  onUpdateCategories: (newCategories: HabitCategory[]) => void;
  onUpdateLogs: (newLogs: HabitLog[]) => void;
}

export default function HabitTracker({
  categories,
  logs,
  onUpdateCategories,
  onUpdateLogs
}: HabitTrackerProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'config'>('ledger');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
  // Customization inputs state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newHabitNames, setNewHabitNames] = useState<Record<string, string>>({}); // catId -> habitName
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState('');

  // Sidebar Inline Routine Editor state
  const [newSideHabitNames, setNewSideHabitNames] = useState<Record<string, string>>({}); // catId -> habitName

  // Row creation inputs state
  const [selectedNewDate, setSelectedNewDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [showAddRowInput, setShowAddRowInput] = useState(false);

  // --- Helper: Format YYYY-MM-DD -> @Month DD, YYYY ---
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `@${date.toLocaleDateString('en-US', options)}`;
  };

  // --- Calculations ---
  // Calculates completion rate of a specific category in a log
  const calculateCategoryProgress = (log: HabitLog, category: HabitCategory) => {
    if (!category.habits || category.habits.length === 0) return 0;
    const completedCount = category.habits.filter(h => log.completedHabits[h.id]).length;
    return Math.round((completedCount / category.habits.length) * 100);
  };

  // Calculates overall completion rate across all categories in a log
  const calculateOverallProgress = (log: HabitLog) => {
    const totalHabits = categories.reduce((acc, cat) => acc + (cat.habits?.length || 0), 0);
    if (totalHabits === 0) return 0;
    
    let completedCount = 0;
    categories.forEach(cat => {
      cat.habits?.forEach(h => {
        if (log.completedHabits[h.id]) {
          completedCount++;
        }
      });
    });
    return Math.round((completedCount / totalHabits) * 100);
  };

  // Calculates streaks based on history logs (>= 50% progress counts as followed through)
  const calculateStreaks = () => {
    if (!logs || logs.length === 0) return { current: 0, longest: 0 };

    // Filter dates that have at least 50% completion
    const activeDates = logs
      .filter(l => calculateOverallProgress(l) >= 50)
      .map(l => l.date)
      .sort(); // sort ascending e.g. ["2026-05-28", "2026-05-29", "2026-05-30"]

    if (activeDates.length === 0) return { current: 0, longest: 0 };

    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (let i = 0; i < activeDates.length; i++) {
      const currentDate = new Date(activeDates[i]);
      
      if (lastDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longest) longest = tempStreak;
          tempStreak = 1;
        }
      }
      lastDate = currentDate;
    }
    
    if (tempStreak > longest) longest = tempStreak;

    // Calculate current streak (active logs must include today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let includesRecent = false;
    if (lastDate !== null) {
      lastDate.setHours(0, 0, 0, 0);
      if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
        includesRecent = true;
      }
    }

    const current = includesRecent ? tempStreak : 0;

    return { current, longest };
  };

  const streaks = calculateStreaks();

  // --- Actions: Log Entries ---
  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewDate) return;

    // Check if entry already exists
    const exists = logs.some(l => l.date === selectedNewDate);
    if (exists) {
      alert(`An entry for ${formatDateDisplay(selectedNewDate)} already exists!`);
      return;
    }

    const newLog: HabitLog = {
      id: `log-${Date.now()}`,
      date: selectedNewDate,
      completedHabits: {}
    };

    const updatedLogs = [newLog, ...logs].sort((a, b) => b.date.localeCompare(a.date));
    onUpdateLogs(updatedLogs);
    setShowAddRowInput(false);
    setSelectedLogId(newLog.id); // Open details panel immediately for the new day
  };

  const handleDeleteRow = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail panel when deleting
    if (confirm('Are you sure you want to delete this habit log page?')) {
      const updatedLogs = logs.filter(l => l.id !== logId);
      onUpdateLogs(updatedLogs);
      if (selectedLogId === logId) {
        setSelectedLogId(null);
      }
    }
  };

  const handleToggleHabit = (logId: string, habitId: string) => {
    const updatedLogs = logs.map(l => {
      if (l.id === logId) {
        return {
          ...l,
          completedHabits: {
            ...l.completedHabits,
            [habitId]: !l.completedHabits[habitId]
          }
        };
      }
      return l;
    });
    onUpdateLogs(updatedLogs);
  };

  // --- Actions: Customization ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat: HabitCategory = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      habits: []
    };

    onUpdateCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  const handleRenameCategory = (catId: string) => {
    if (!editingCatName.trim()) return;
    onUpdateCategories(categories.map(c => c.id === catId ? { ...c, name: editingCatName.trim() } : c));
    setEditingCatId(null);
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('Are you sure you want to delete this category? All its habits will be removed.')) {
      onUpdateCategories(categories.filter(c => c.id !== catId));
    }
  };

  const handleAddHabit = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    const habitName = newHabitNames[catId];
    if (!habitName || !habitName.trim()) return;

    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name: habitName.trim()
    };

    onUpdateCategories(categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          habits: [...(c.habits || []), newHabit]
        };
      }
      return c;
    }));

    setNewHabitNames(prev => ({ ...prev, [catId]: '' }));
  };

  // Sidebar quick habit adding trigger
  const handleAddSideHabit = (catId: string, e: React.FormEvent) => {
    e.preventDefault();
    const habitName = newSideHabitNames[catId];
    if (!habitName || !habitName.trim()) return;

    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name: habitName.trim()
    };

    onUpdateCategories(categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          habits: [...(c.habits || []), newHabit]
        };
      }
      return c;
    }));

    setNewSideHabitNames(prev => ({ ...prev, [catId]: '' }));
  };

  const handleRenameHabit = (catId: string, habitId: string) => {
    if (!editingHabitName.trim()) return;
    onUpdateCategories(categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          habits: c.habits.map(h => h.id === habitId ? { ...h, name: editingHabitName.trim() } : h)
        };
      }
      return c;
    }));
    setEditingHabitId(null);
  };

  const handleDeleteHabit = (catId: string, habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      onUpdateCategories(categories.map(c => {
        if (c.id === catId) {
          return {
            ...c,
            habits: c.habits.filter(h => h.id !== habitId)
          };
        }
        return c;
      }));

      // Clean up completions from logs
      const updatedLogs = logs.map(l => {
        const completions = { ...l.completedHabits };
        delete completions[habitId];
        return { ...l, completedHabits: completions };
      });
      onUpdateLogs(updatedLogs);
    }
  };

  // Find currently active log for side panel
  const activeLog = logs.find(l => l.id === selectedLogId);

  // Count perfect logs (overall progress === 100%)
  const perfectDaysCount = logs.filter(l => calculateOverallProgress(l) === 100).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 relative overflow-hidden font-sans">
      
      {/* 1. Header with custom tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-4 gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-650" />
            Daily Habits & Routines Ledger
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
            Optimize your daily routines • Notch up tracking indexes
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-0.5 rounded-lg text-xs self-stretch sm:self-auto">
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'ledger' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Ledger View
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'config' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Configure Routines
          </button>
        </div>
      </div>

      {/* 2. Content Sections based on Active Tab */}
      {activeTab === 'ledger' ? (
        <div className="space-y-4">
          
          {/* Consistency Stats Panel (Streaks History & Celebration Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stat 1: Current Streak */}
            <div className="bg-gradient-to-tr from-amber-50 to-orange-100/40 border border-orange-150 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest block">Current Streak</span>
                <div className="text-xl font-black text-orange-950 mt-1 flex items-baseline gap-1">
                  <Flame className="w-5.5 h-5.5 text-orange-500 fill-orange-500 animate-bounce" />
                  <span>{streaks.current} Days</span>
                </div>
                <span className="text-[9.5px] text-slate-500 font-semibold mt-0.5 block">50%+ daily keeps it burning</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-lg font-bold">
                🔥
              </div>
            </div>

            {/* Stat 2: Longest Streak */}
            <div className="bg-gradient-to-tr from-indigo-50 to-indigo-100/40 border border-indigo-150 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest block">Longest Streak</span>
                <div className="text-xl font-black text-indigo-950 mt-1 flex items-baseline gap-1">
                  <Trophy className="w-5.5 h-5.5 text-indigo-600" />
                  <span>{streaks.longest} Days</span>
                </div>
                <span className="text-[9.5px] text-slate-500 font-semibold mt-0.5 block">Your personal best!</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-550/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 text-lg font-bold">
                🏆
              </div>
            </div>

            {/* Stat 3: Perfect Days */}
            <div className="bg-gradient-to-tr from-emerald-50 to-emerald-100/40 border border-emerald-150 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-650 uppercase tracking-widest block">Perfect Days</span>
                <div className="text-xl font-black text-emerald-950 mt-1 flex items-baseline gap-1">
                  <Award className="w-5.5 h-5.5 text-emerald-600 animate-pulse" />
                  <span>{perfectDaysCount} Days</span>
                </div>
                <span className="text-[9.5px] text-slate-500 font-semibold mt-0.5 block">100% completion logged</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 text-lg font-bold">
                ✨
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <span className="text-[10.5px] font-bold text-slate-500">
              Showing {logs.length} tracked days
            </span>
            
            <div className="relative">
              {!showAddRowInput ? (
                <button
                  onClick={() => setShowAddRowInput(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Row
                </button>
              ) : (
                <form onSubmit={handleAddRow} className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  <input
                    type="date"
                    value={selectedNewDate}
                    onChange={(e) => setSelectedNewDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1 rounded transition"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRowInput(false)}
                    className="text-slate-400 hover:text-slate-650 text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Database Table View */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[10.5px] font-bold text-slate-400 uppercase tracking-widest select-none">
                  <th className="py-3 px-4">Date Entry</th>
                  {categories.map(cat => (
                    <th key={cat.id} className="py-3 px-4">{cat.name}</th>
                  ))}
                  <th className="py-3 px-4 text-center">Overall Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map(log => {
                  const overall = calculateOverallProgress(log);
                  
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className={`hover:bg-slate-50/70 cursor-pointer transition-colors group ${
                        selectedLogId === log.id ? 'bg-indigo-50/45 hover:bg-indigo-50/60 font-semibold' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                          {formatDateDisplay(log.date)}
                        </span>
                      </td>

                      {/* Category progress bars */}
                      {categories.map(cat => {
                        const progress = calculateCategoryProgress(log, cat);
                        // Dynamic styling based on progress value
                        const barColor = progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500';
                        
                        return (
                          <td key={cat.id} className="py-3.5 px-4 min-w-[130px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold font-mono text-slate-500 w-8 text-right">
                                {cat.habits.length > 0 ? `${progress}%` : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      {/* Overall Progress Bubble */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono shadow-sm ${
                          overall === 100 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-250' 
                            : overall >= 50 
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-255' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {overall === 100 && <Award className="w-3 h-3 text-emerald-600" />}
                          {overall}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDeleteRow(log.id, e)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition opacity-0 group-hover:opacity-100"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={categories.length + 3} className="py-12 text-center text-slate-450 bg-slate-50/20 font-medium">
                      No habit tracker rows registered yet. Click "+ Add Row" above to initialize logging!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Configuration Tab */
        <div className="space-y-6">
          
          {/* Quick instructions alert */}
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-850 p-3 rounded-xl flex gap-2.5 items-start">
            <Sun className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">Routine Architecture Customizer</span>: Define your custom time blocks (Morning, Free Time, Deep Work) and list your desired habits. Changing things here instantly reflects dynamically on all dashboard tables and detail checklists.
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
            <input
              type="text"
              placeholder="Create new time block category (e.g., Free Time)..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 shadow hover:scale-[1.01]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </form>

          {/* List of Categories & Habits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition">
                <div>
                  {/* Category Header */}
                  <div className="flex justify-between items-center border-b border-slate-200/50 pb-2 mb-3">
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCategory(cat.id)}
                          className="p-1 hover:bg-indigo-100 rounded text-indigo-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          {cat.name === 'Morning Routine' || cat.name === 'Morning' ? (
                            <Sun className="w-4.5 h-4.5 text-amber-500" />
                          ) : cat.name === 'Evening Calm' || cat.name === 'Evening' ? (
                            <Moon className="w-4.5 h-4.5 text-indigo-500" />
                          ) : (
                            <Coffee className="w-4.5 h-4.5 text-indigo-650" />
                          )}
                          {cat.name}
                        </h4>
                        <button
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setEditingCatName(cat.name);
                          }}
                          className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-650"
                          title="Rename Category"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* List of Habits inside category */}
                  <div className="space-y-1.5 mb-4 max-h-[160px] overflow-y-auto pr-1">
                    {cat.habits && cat.habits.map(habit => (
                      <div key={habit.id} className="flex justify-between items-center bg-white border border-slate-100 px-3 py-1.5 rounded-lg group text-xs text-slate-850">
                        {editingHabitId === habit.id ? (
                          <div className="flex items-center gap-1.5 flex-1 mr-2">
                            <input
                              type="text"
                              value={editingHabitName}
                              onChange={(e) => setEditingHabitName(e.target.value)}
                              className="bg-white border border-slate-300 rounded px-1.5 py-0.2 text-[11px] text-slate-800 w-full focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameHabit(cat.id, habit.id)}
                              className="p-0.5 hover:bg-indigo-100 rounded text-indigo-700"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingHabitId(null)}
                              className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded bg-slate-300 shrink-0"></span>
                            <span className="font-semibold">{habit.name}</span>
                            <button
                              onClick={() => {
                                setEditingHabitId(habit.id);
                                setEditingHabitName(habit.name);
                              }}
                              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-650 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Rename Habit"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteHabit(cat.id, habit.id)}
                          className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition opacity-0 group-hover:opacity-100"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {(!cat.habits || cat.habits.length === 0) && (
                      <div className="text-center py-4 text-[10.5px] text-slate-400 bg-white/40 border border-dashed border-slate-250 rounded-lg">
                        No habits in this routine block. Add one below!
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Habit Form within Category */}
                <form 
                  onSubmit={(e) => handleAddHabit(cat.id, e)}
                  className="flex gap-1.5 mt-auto pt-2 border-t border-slate-200/50"
                >
                  <input
                    type="text"
                    placeholder="Add habit..."
                    value={newHabitNames[cat.id] || ''}
                    onChange={(e) => setNewHabitNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                    className="flex-grow text-[11px] bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-650 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[11px] font-bold flex items-center justify-center shrink-0"
                  >
                    + Add
                  </button>
                </form>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="col-span-2 text-center py-12 text-slate-450 bg-slate-50 border border-dashed border-slate-250 rounded-xl">
                No routines or time blocks created yet. Use the add form above to define your day segments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Sleek Left Slide-out Detail Checklist Overlay Panel (with integrated side customizer) */}
      <div 
        className={`fixed top-0 left-0 h-full w-[360px] sm:w-[400px] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform ${
          activeLog ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {activeLog && (
          <div className="flex flex-col h-full">
            {/* Header Area */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider block w-max flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-indigo-600 animate-pulse" />
                  Daily Checklist
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">
                  {formatDateDisplay(activeLog.date)}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedLogId(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Streaks Badge + Overall Progress Card inside detailed panel */}
            <div className="bg-slate-900 border border-slate-850 text-white p-4 rounded-2xl shadow mb-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Overall Completion</span>
                  <div className="text-2xl font-black font-mono mt-0.5 text-indigo-400">{calculateOverallProgress(activeLog)}%</div>
                </div>
                
                {/* Fire Streak Badge */}
                {streaks.current > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-650/20 text-orange-400 border border-orange-500/25 text-[10px] font-black tracking-wide animate-pulse">
                    🔥 {streaks.current}-Day Streak!
                  </span>
                )}
              </div>

              {/* Linear overall progress bar inside side drawer */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${calculateOverallProgress(activeLog)}%` }}
                />
              </div>
                   {/* Categories & Habits Checklist Area */}
            <div className="flex-grow space-y-6 overflow-y-auto pr-1">
              {categories.map(cat => {
                const catProgress = calculateCategoryProgress(activeLog, cat);
                
                return (
                  <div key={cat.id} className="space-y-3 bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl hover:border-slate-200 transition">
                    
                    {/* Visual Category Header */}
                    <div className="flex justify-between items-center pb-1">
                      <span className="text-[10px] font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
                        {cat.name === 'Morning Routine' || cat.name === 'Morning' ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : cat.name === 'Evening Calm' || cat.name === 'Evening' ? (
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Coffee className="w-3.5 h-3.5 text-indigo-650" />
                        )}
                        {cat.name}
                      </span>
                    </div>

                    {/* Category Progress meter */}
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${catProgress}%` }}
                      />
                    </div>

                    {/* Habits Checklist List */}
                    <div className="space-y-1.5 mt-2">
                      {cat.habits && cat.habits.map(habit => {
                        const isCompleted = !!activeLog.completedHabits[habit.id];
                        
                        return (
                          <div 
                            key={habit.id}
                            className="flex items-center justify-between group"
                          >
                            {/* Tap to Toggle Completed */}
                            <div 
                              onClick={() => handleToggleHabit(activeLog.id, habit.id)}
                              className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl cursor-pointer select-none transition-all duration-150 flex-grow ${
                                isCompleted 
                                  ? 'bg-indigo-50/40 border-indigo-200 text-indigo-950 font-bold' 
                                  : 'bg-white border-slate-100 hover:bg-white text-slate-700 hover:border-slate-350 shadow-sm'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                isCompleted 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'bg-white border-slate-300 text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                              </div>

                              <span className="text-[11.5px]">{habit.name}</span>
                            </div>

                            {/* Sidebar Habits Deleting Option (Permanently visible) */}
                            <button
                              onClick={() => handleDeleteHabit(cat.id, habit.id)}
                              className="p-1 text-slate-450 hover:text-red-500 rounded ml-1 transition hover:bg-red-550 shrink-0"
                              title="Delete Daily Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {(!cat.habits || cat.habits.length === 0) && (
                        <div className="text-center py-4 text-[10px] text-slate-400 bg-white/40 border border-dashed border-slate-200 rounded-lg">
                          No daily activities mapped to this block yet. Add one below!
                        </div>
                      )}

                      {/* Permanent Inline add habit form */}
                      <form 
                        onSubmit={(e) => handleAddSideHabit(cat.id, e)} 
                        className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-100"
                      >
                        <input 
                          type="text" 
                          placeholder="Add routine activity..." 
                          value={newSideHabitNames[cat.id] || ''} 
                          onChange={(e) => setNewSideHabitNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                          className="flex-grow text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
                          required
                        />
                        <button 
                          type="submit" 
                          className="bg-indigo-600 hover:bg-indigo-750 text-white text-[10.5px] font-bold px-3 py-1 rounded-lg transition-all shrink-0 flex items-center gap-0.5 shadow-sm active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}

              {categories.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No routines or categories configured. Go to "Configure Routines" tab to build your habits ecosystem first!
                </div>
              )}
            </div>       </div>

            {/* Bottom Actions inside detail panel */}
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <button
                onClick={() => setSelectedLogId(null)}
                className="w-full text-center py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-750 transition"
              >
                Close Checklist
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop overlay for detailed panel */}
      {activeLog && (
        <div 
          onClick={() => setSelectedLogId(null)}
          className="fixed inset-0 bg-slate-900/25 z-40 animate-fade-in"
        />
      )}

    </div>
  );
}
