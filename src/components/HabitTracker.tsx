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
    <div className="bg-[#F9F9F9] border-2 border-black rounded-none p-5 relative overflow-hidden font-sans text-black">
      
      {/* 1. Header with custom tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 mb-4 gap-3">
        <div>
          <h3 className="text-base font-black text-black tracking-wider flex items-center gap-2 font-mono uppercase">
            <ClipboardList className="w-5 h-5 text-[#E85002]" />
            Daily Habits & Routines Ledger
          </h3>
          <p className="text-[10px] text-[#333333] font-bold tracking-wide uppercase mt-0.5 font-mono">
            Optimize your daily routines • Notch up tracking indexes
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-black p-1 rounded-none text-xs self-stretch sm:self-auto border-2 border-black shadow-[2px_2px_0px_#000000]">
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-none font-black transition flex items-center justify-center gap-1.5 font-mono uppercase cursor-pointer ${
              activeTab === 'ledger' 
                ? 'bg-[#E85002] text-black border border-black shadow-[1px_1px_0px_#000000]' 
                : 'text-white hover:text-[#E85002]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Ledger View
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-none font-black transition flex items-center justify-center gap-1.5 font-mono uppercase cursor-pointer ${
              activeTab === 'config' 
                ? 'bg-[#E85002] text-black border border-black shadow-[1px_1px_0px_#000000]' 
                : 'text-white hover:text-[#E85002]'
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
            {/* Stat 1: Current Streak (Style B - Kinetic Orange Solid Block Inversion) */}
            <div className="bg-[#E85002] border-2 border-black p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 text-black font-mono">
              <div>
                <span className="text-[10px] font-black text-black uppercase tracking-widest block">Current Streak</span>
                <div className="text-xl font-black text-black mt-1 flex items-baseline gap-1 uppercase">
                  <Flame className="w-5.5 h-5.5 text-black fill-black animate-pulse" />
                  <span>{streaks.current} Days</span>
                </div>
                <span className="text-[9.5px] text-black/75 font-bold mt-0.5 block">50%+ daily keeps it burning</span>
              </div>
              <div className="w-10 h-10 rounded-none bg-black border border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Flame className="w-5.5 h-5.5 text-[#E85002] fill-[#E85002]" />
              </div>
            </div>

            {/* Stat 2: Longest Streak (Style C - Noir Mode Black Block, Orange Shadow) */}
            <div className="bg-black border-2 border-[#333333] p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0px_#E85002] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 text-white font-mono">
              <div>
                <span className="text-[10px] font-black text-[#A7A7A7] uppercase tracking-widest block">Longest Streak</span>
                <div className="text-xl font-black text-[#E85002] mt-1 flex items-baseline gap-1 uppercase">
                  <Trophy className="w-5.5 h-5.5 text-[#E85002]" />
                  <span>{streaks.longest} Days</span>
                </div>
                <span className="text-[9.5px] text-[#A7A7A7] font-bold mt-0.5 block">Your personal best!</span>
              </div>
              <div className="w-10 h-10 rounded-none bg-[#E85002] border border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Trophy className="w-5.5 h-5.5 text-black" />
              </div>
            </div>

            {/* Stat 3: Perfect Days (Style A - High Contrast White, Crisp Black Shadow) */}
            <div className="bg-white border-2 border-black p-4 rounded-none flex items-center justify-between shadow-[4px_4px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 text-black font-mono">
              <div>
                <span className="text-[10px] font-black text-[#333333] uppercase tracking-widest block">Perfect Days</span>
                <div className="text-xl font-black text-black mt-1 flex items-baseline gap-1 uppercase">
                  <Award className="w-5.5 h-5.5 text-black animate-pulse" />
                  <span>{perfectDaysCount} Days</span>
                </div>
                <span className="text-[9.5px] text-[#333333] font-bold mt-0.5 block">100% completion logged</span>
              </div>
              <div className="w-10 h-10 rounded-none bg-[#E85002] border border-black flex items-center justify-center shadow-[2px_2px_0px_#000000]">
                <Award className="w-5.5 h-5.5 text-black" />
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex justify-between items-center bg-[#F9F9F9] border-2 border-black p-3 rounded-none shadow-[2px_2px_0px_#000000] font-mono">
            <span className="text-[10.5px] font-black text-black uppercase">
              Showing {logs.length} tracked days
            </span>
            
            <div className="relative">
              {!showAddRowInput ? (
                <button
                  onClick={() => setShowAddRowInput(true)}
                  className="px-3.5 py-1.5 bg-[#E85002] hover:bg-[#E85002]/95 text-black border-2 border-black text-[11.5px] font-black rounded-none shadow-[2px_2px_0px_#000000] transition flex items-center gap-1 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer uppercase"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Row
                </button>
              ) : (
                <form onSubmit={handleAddRow} className="flex items-center gap-2 bg-white border-2 border-black p-1.5 rounded-none shadow-[4px_4px_0px_#000000] animate-in fade-in zoom-in-95 duration-150 font-mono">
                  <input
                    type="date"
                    value={selectedNewDate}
                    onChange={(e) => setSelectedNewDate(e.target.value)}
                    className="text-xs bg-[#F9F9F9] border-2 border-black rounded-none px-2.5 py-1 text-black focus:outline-none focus:border-[#E85002]"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-[#E85002] hover:bg-[#E85002]/90 border-2 border-black text-black text-[10px] font-black px-3 py-1 rounded-none transition uppercase cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddRowInput(false)}
                    className="text-black hover:text-[#E85002] text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Database Table View */}
          <div className="overflow-x-auto border-2 border-black rounded-none shadow-[4px_4px_0px_#000000] bg-white">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black text-[#F9F9F9] border-b-2 border-black text-[11px] font-black uppercase tracking-wider select-none font-mono">
                  <th className="py-3 px-4">Date Entry</th>
                  {categories.map(cat => (
                    <th key={cat.id} className="py-3 px-4">{cat.name}</th>
                  ))}
                  <th className="py-3 px-4 text-center">Overall Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black text-xs">
                {logs.map(log => {
                  const overall = calculateOverallProgress(log);
                  
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLogId(log.id)}
                      className={`hover:bg-[#A7A7A7]/10 cursor-pointer border-b-2 border-black transition-colors group ${
                        selectedLogId === log.id ? 'bg-[#E85002]/15 font-bold text-black border-l-4 border-l-[#E85002]' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-black text-black flex items-center gap-1.5 uppercase">
                          <span className="w-2 h-2 rounded-none bg-[#E85002]"></span>
                          {formatDateDisplay(log.date)}
                        </span>
                      </td>

                      {/* Category progress bars */}
                      {categories.map(cat => {
                        const progress = calculateCategoryProgress(log, cat);
                        const barColor = progress === 100 ? 'bg-black border-black' : progress >= 50 ? 'bg-[#E85002]' : 'bg-[#A7A7A7]';
                        
                        return (
                          <td key={cat.id} className="py-3.5 px-4 min-w-[130px] font-mono">
                            <div className="flex items-center gap-2">
                              <div className="flex-grow bg-white border border-black h-3.5 rounded-none overflow-hidden">
                                <div 
                                  className={`h-full rounded-none transition-all duration-500 ${barColor}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-black w-8 text-right">
                                {cat.habits.length > 0 ? `${progress}%` : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}

                      {/* Overall Progress Bubble */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[10px] font-black font-mono shadow-[2px_2px_0px_#000000] border-2 border-black ${
                          overall === 100 
                            ? 'bg-[#E85002] text-black' 
                            : overall >= 50 
                            ? 'bg-black text-[#F9F9F9]' 
                            : 'bg-white text-black'
                        }`}>
                          {overall === 100 && <Award className="w-3 h-3 text-black" />}
                          {overall}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => handleDeleteRow(log.id, e)}
                          className="p-1 hover:bg-red-50 text-black hover:text-red-600 rounded transition opacity-0 group-hover:opacity-100"
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
                    <td colSpan={categories.length + 3} className="py-12 text-center text-black font-mono uppercase bg-white">
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
          <div className="bg-white border-2 border-black text-black p-3.5 rounded-none flex gap-2.5 items-start shadow-[3px_3px_0px_#E85002] font-mono">
            <Sun className="w-4.5 h-4.5 text-[#E85002] shrink-0 mt-0.5 animate-pulse" />
            <div className="text-[11px] leading-relaxed uppercase">
              <span className="font-black text-[#E85002]">Routine Architecture Customizer</span>: Define your custom time blocks (Morning, Free Time, Deep Work) and list your desired habits. Changing things here instantly reflects dynamically on all dashboard tables and detail checklists.
            </div>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 bg-[#F9F9F9] border-2 border-black p-3.5 rounded-none shadow-[3px_3px_0px_#000000] font-mono">
            <input
              type="text"
              placeholder="Create new time block category (e.g., Free Time)..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 text-xs bg-white border-2 border-black rounded-none px-3 py-2 text-black focus:outline-none focus:border-[#E85002] font-semibold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#E85002] hover:bg-[#E85002]/95 text-black border-2 border-black text-[11px] font-black rounded-none transition shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer uppercase flex items-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </button>
          </form>

          {/* List of Categories & Habits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, idx) => {
              // Alternating asymmetrical styles for config cards
              let cardStyle = "";
              let titleStyle = "";
              let borderStyle = "border-2 border-black";
              
              const cycle = idx % 3;
              if (cycle === 0) {
                cardStyle = "bg-white text-black shadow-[4px_4px_0px_#000000] rounded-none";
                titleStyle = "text-black";
              } else if (cycle === 1) {
                cardStyle = "bg-black text-white shadow-[4px_4px_0px_#E85002] rounded-none";
                titleStyle = "text-[#E85002]";
                borderStyle = "border-2 border-[#333333]";
              } else {
                cardStyle = "bg-[#F9F9F9] text-black shadow-[4px_4px_0px_#000000] rounded-none";
                titleStyle = "text-black";
              }

              return (
                <div key={cat.id} className={`${cardStyle} ${borderStyle} p-4 flex flex-col justify-between transition`}>
                  <div>
                    {/* Category Header */}
                    <div className={`flex justify-between items-center border-b pb-2 mb-3 ${cycle === 1 ? 'border-white/10' : 'border-black/10'}`}>
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 flex-1 mr-2 font-mono">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="bg-white border-2 border-black text-black rounded-none px-2 py-0.5 text-xs w-full focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameCategory(cat.id)}
                            className="p-1 hover:bg-[#E85002]/20 rounded text-[#E85002]"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className={`p-1 hover:bg-slate-200 rounded ${cycle === 1 ? 'text-white' : 'text-black'}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 font-mono ${titleStyle}`}>
                            {cat.name === 'Morning Routine' || cat.name === 'Morning' ? (
                              <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin" />
                            ) : cat.name === 'Evening Calm' || cat.name === 'Evening' ? (
                              <Moon className="w-4.5 h-4.5 text-indigo-500" />
                            ) : (
                              <Coffee className="w-4.5 h-4.5 text-[#E85002]" />
                            )}
                            {cat.name}
                          </h4>
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className={`p-0.5 hover:bg-slate-200 rounded ${cycle === 1 ? 'text-[#A7A7A7] hover:text-white' : 'text-black/60 hover:text-black'}`}
                            title="Rename Category"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className={`p-1 rounded transition ${cycle === 1 ? 'text-white hover:bg-rose-950 hover:text-red-500' : 'text-black/60 hover:bg-rose-50 hover:text-red-600'}`}
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* List of Habits inside category */}
                    <div className="space-y-2 mb-4 max-h-[160px] overflow-y-auto pr-1">
                      {cat.habits && cat.habits.map(habit => (
                        <div 
                          key={habit.id} 
                          className={`flex justify-between items-center px-3 py-1.5 border-2 rounded-none group text-xs font-mono uppercase ${
                            cycle === 1 
                              ? 'bg-black border-[#333333] text-white hover:border-[#E85002]' 
                              : 'bg-white border-black text-black hover:border-[#E85002]'
                          }`}
                        >
                          {editingHabitId === habit.id ? (
                            <div className="flex items-center gap-1.5 flex-1 mr-2">
                              <input
                                type="text"
                                value={editingHabitName}
                                onChange={(e) => setEditingHabitName(e.target.value)}
                                className="bg-white border-2 border-black rounded-none px-1.5 py-0.2 text-[11px] text-black w-full focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRenameHabit(cat.id, habit.id)}
                                className="p-0.5 hover:bg-indigo-100 rounded text-indigo-750"
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
                              <span className="w-1.5 h-1.5 rounded-none bg-[#E85002] shrink-0"></span>
                              <span className="font-bold">{habit.name}</span>
                              <button
                                onClick={() => {
                                  setEditingHabitId(habit.id);
                                  setEditingHabitName(habit.name);
                                }}
                                className="p-0.5 hover:bg-slate-100 rounded text-[#E85002] opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Rename Habit"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleDeleteHabit(cat.id, habit.id)}
                            className="p-0.5 hover:bg-red-50 text-red-600 rounded transition opacity-0 group-hover:opacity-100"
                            title="Delete Habit"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {(!cat.habits || cat.habits.length === 0) && (
                        <div className={`text-center py-4 text-[10.5px] border-2 border-dashed rounded-none font-mono uppercase ${cycle === 1 ? 'border-white/20 text-[#A7A7A7]' : 'border-black/25 text-[#333333]'}`}>
                          No habits in this routine block. Add one below!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Habit Form within Category */}
                  <form 
                    onSubmit={(e) => handleAddHabit(cat.id, e)}
                    className={`flex gap-1.5 mt-auto pt-2 border-t font-mono ${cycle === 1 ? 'border-white/10' : 'border-black/10'}`}
                  >
                    <input
                      type="text"
                      placeholder="Add habit..."
                      value={newHabitNames[cat.id] || ''}
                      onChange={(e) => setNewHabitNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      className="flex-grow text-[11px] bg-white border-2 border-black rounded-none px-2.5 py-1 text-black focus:outline-none focus:border-[#E85002]"
                    />
                    <button
                      type="submit"
                      className="bg-[#E85002] hover:bg-[#E85002]/95 border-2 border-black text-black px-3 py-1 rounded-none text-[11px] font-black flex items-center justify-center shrink-0 uppercase shadow-[2px_2px_0px_#000000]"
                    >
                      + Add
                    </button>
                  </form>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="col-span-2 text-center py-12 text-black bg-[#F9F9F9] border-2 border-black rounded-none font-mono uppercase shadow-[3px_3px_0px_#000000]">
                No routines or time blocks created yet. Use the add form above to define your day segments.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Detailed Checklist Overlay Panel (Tactile Volumetric Slide-out) */}
      <div 
        className={`fixed top-0 left-0 h-full w-[360px] sm:w-[400px] bg-[#F9F9F9] border-r-2 border-black shadow-2xl z-50 flex flex-col p-6 overflow-y-auto transition-transform duration-300 ease-in-out transform border-y-2 ${
          activeLog ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {activeLog && (
          <div className="flex flex-col h-full">
            {/* Header Area */}
            <div className="flex justify-between items-start border-b-2 border-black pb-3 mb-4 font-mono uppercase">
              <div>
                <span className="text-[9px] bg-black text-[#E85002] font-black px-2.5 py-1 rounded-none border border-black shadow-[1px_1px_0px_#000000] uppercase tracking-wider block w-max flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 text-[#E85002]" />
                  Daily Checklist
                </span>
                <h4 className="text-lg font-black text-black mt-2 leading-none">
                  {formatDateDisplay(activeLog.date)}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedLogId(null)}
                className="p-1 hover:bg-[#A7A7A7]/20 border border-black rounded-none bg-white transition cursor-pointer shadow-[1px_1px_0px_#000000]"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Streaks Badge + Overall Progress Card inside detailed panel */}
            <div className="bg-black border-2 border-[#333333] text-white p-4 rounded-none shadow-[3px_3px_0px_#E85002] mb-5 flex flex-col gap-3 font-mono">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-[#A7A7A7] uppercase tracking-widest">Overall Completion</span>
                  <div className="text-2xl font-black font-mono mt-0.5 text-[#E85002]">{calculateOverallProgress(activeLog)}%</div>
                </div>
                
                {/* Fire Streak Badge */}
                {streaks.current > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none bg-[#E85002]/20 text-[#E85002] border border-[#E85002]/50 text-[10px] font-black tracking-wide animate-pulse">
                    🔥 {streaks.current}-Day Streak!
                  </span>
                )}
              </div>

              {/* Linear overall progress bar inside side drawer */}
              <div className="w-full bg-[#333333] border border-black h-3.5 rounded-none overflow-hidden">
                <div 
                  className="bg-[#E85002] h-full rounded-none transition-all duration-500" 
                  style={{ width: `${calculateOverallProgress(activeLog)}%` }}
                />
              </div>
            </div>

            {/* Categories & Habits Checklist Area */}
            <div className="flex-grow space-y-6 overflow-y-auto pr-1">
              {categories.map(cat => {
                const catProgress = calculateCategoryProgress(activeLog, cat);
                
                return (
                  <div key={cat.id} className="space-y-3 bg-white border-2 border-black p-3.5 rounded-none shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150">
                    
                    {/* Visual Category Header */}
                    <div className="flex justify-between items-center pb-1 font-mono">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                        {cat.name === 'Morning Routine' || cat.name === 'Morning' ? (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        ) : cat.name === 'Evening Calm' || cat.name === 'Evening' ? (
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Coffee className="w-3.5 h-3.5 text-[#E85002]" />
                        )}
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-black text-black">{catProgress}%</span>
                    </div>

                    {/* Category Progress meter */}
                    <div className="w-full bg-[#333333] border border-black h-2 rounded-none overflow-hidden">
                      <div 
                        className="bg-[#E85002] h-full rounded-none transition-all duration-300" 
                        style={{ width: `${catProgress}%` }}
                      />
                    </div>

                    {/* Habits Checklist List */}
                    <div className="space-y-2 mt-2">
                      {cat.habits && cat.habits.map(habit => {
                        const isCompleted = !!activeLog.completedHabits[habit.id];
                        
                        return (
                          <div 
                            key={habit.id}
                            className="flex items-center justify-between group"
                          >
                            {/* Tap to Toggle Completed (Style B when active) */}
                            <div 
                              onClick={() => handleToggleHabit(activeLog.id, habit.id)}
                              className={`flex items-center gap-3 px-3 py-2.5 border-2 border-black rounded-none cursor-pointer select-none transition-all duration-150 flex-grow shadow-[2px_2px_0px_#000000] font-mono uppercase ${
                                isCompleted 
                                  ? 'bg-[#E85002] text-black font-black' 
                                  : 'bg-white text-black hover:bg-[#A7A7A7]/10 font-bold'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-none flex items-center justify-center border-2 border-black transition-all ${
                                isCompleted 
                                  ? 'bg-black text-[#E85002]' 
                                  : 'bg-white text-transparent'
                              }`}>
                                <Check className="w-3 h-3 stroke-[4]" />
                              </div>

                              <span className="text-[11.5px]">{habit.name}</span>
                            </div>

                            {/* Sidebar Habits Deleting Option */}
                            <button
                              onClick={() => handleDeleteHabit(cat.id, habit.id)}
                              className="p-2 text-black hover:text-red-600 border-2 border-transparent hover:border-black rounded-none ml-1.5 transition shrink-0 bg-transparent"
                              title="Delete Daily Activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}

                      {(!cat.habits || cat.habits.length === 0) && (
                        <div className="text-center py-4 text-[10px] text-black border-2 border-dashed border-black/25 rounded-none font-mono uppercase bg-[#F9F9F9]">
                          No routine habits listed. Add one below!
                        </div>
                      )}

                      {/* Permanent Inline add habit form */}
                      <form 
                        onSubmit={(e) => handleAddSideHabit(cat.id, e)} 
                        className="flex gap-1.5 mt-3 pt-2.5 border-t border-black/10 font-mono"
                      >
                        <input 
                          type="text" 
                          placeholder="Add routine activity..." 
                          value={newSideHabitNames[cat.id] || ''} 
                          onChange={(e) => setNewSideHabitNames(prev => ({ ...prev, [cat.id]: e.target.value }))}
                          className="flex-grow text-[11px] bg-white border-2 border-black rounded-none px-2.5 py-1 text-black focus:outline-none focus:border-[#E85002] placeholder-black/40"
                          required
                        />
                        <button 
                          type="submit" 
                          className="bg-[#E85002] hover:bg-[#E85002]/95 text-black text-[10.5px] font-black px-3 py-1 rounded-none transition shadow-[2px_2px_0px_#000000] shrink-0 flex items-center gap-0.5 active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none cursor-pointer uppercase"
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
                <div className="text-center py-12 text-black border-2 border-dashed border-black rounded-none font-mono uppercase bg-[#F9F9F9]">
                  No routines configured. Go to "Configure Routines" tab to build your habits ecosystem!
                </div>
              )}
            </div>
            
            {/* Bottom Actions inside detail panel */}
            <div className="border-t-2 border-black pt-4 mt-auto font-mono">
              <button
                onClick={() => setSelectedLogId(null)}
                className="w-full text-center py-2.5 bg-black hover:bg-[#333333] border-2 border-black rounded-none text-xs font-black text-white transition uppercase shadow-[3px_3px_0px_#E85002] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
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
          className="fixed inset-0 bg-[#333333]/40 z-40 animate-fade-in backdrop-blur-xs"
        />
      )}

    </div>
  );
}
