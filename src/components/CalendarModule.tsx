/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalendarEvent, Course } from '../types';
import { 
  Plus, Calendar as CalIcon, MapPin, Clock, Trash2, ChevronLeft, ChevronRight, Filter, AlertCircle, Bell
} from 'lucide-react';

interface CalendarModuleProps {
  events: CalendarEvent[];
  courses: Course[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onQuickAdd: (title: string, category: string, date: string) => void;
}

export default function CalendarModule({
  events,
  courses,
  onAddEvent,
  onDeleteEvent,
  onQuickAdd
}: CalendarModuleProps) {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-05-30')); // Static start as requested in metadata
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for new event
  const [newTitle, setNewTitle] = useState('');
  const [newCourseId, setNewCourseId] = useState('');
  const [newDate, setNewDate] = useState('2026-06-02');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'class' | 'exam' | 'meeting' | 'study_session' | 'other'>('class');
  const [newRecurring, setNewRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [newReminder, setNewReminder] = useState<number>(30); // minutes before

  // Filter logic
  const filteredEvents = events.filter(e => {
    const courseMatch = filterCourse === 'all' || e.courseId === filterCourse;
    const catMatch = filterCategory === 'all' || e.category === filterCategory;
    return courseMatch && catMatch;
  });

  const getCourseForEvent = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  // Month navigation helpers
  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };
  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const getDaysInMonth = (date: Date) => {
    const yr = date.getFullYear();
    const m = date.getMonth();
    return new Date(yr, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const yr = date.getFullYear();
    const m = date.getMonth();
    return new Date(yr, m, 1).getDay();
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const eventToAdd: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newTitle,
      courseId: newCourseId || undefined,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation || 'Not Specified',
      description: newDescription || '',
      category: newCategory,
      recurring: newRecurring,
      reminderMinutes: Number(newReminder)
    };

    onAddEvent(eventToAdd);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCourseId('');
    setNewDate('2026-06-02');
    setNewStartTime('09:00');
    setNewEndTime('11:00');
    setNewLocation('');
    setNewDescription('');
    setNewCategory('class');
    setNewRecurring('none');
    setNewReminder(30);
    setShowAddModal(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Render Month grid
  const renderMonthGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startOffset = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty buffer pads for start-offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-slate-50/40 border border-slate-100 p-1"></div>);
    }

    // Days grid
    for (let day = 1; day <= daysInMonth; day++) {
      const padDay = day.toString().padStart(2, '0');
      const padMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const dateString = `${currentDate.getFullYear()}-${padMonth}-${padDay}`;
      
      const dayEvents = filteredEvents.filter(e => e.date === dateString);

      days.push(
        <div key={`day-${day}`} className="h-20 bg-white border border-slate-100 p-1 flex flex-col justify-between overflow-hidden hover:bg-slate-50 relative group">
          <span className="text-[10px] font-bold text-slate-400 absolute top-1 left-1.5">{day}</span>
          <div className="flex-1 mt-4 overflow-y-auto space-y-0.5 scrollbar-thin">
            {dayEvents.map(evt => {
              const crs = getCourseForEvent(evt.courseId);
              return (
                <div 
                  key={evt.id} 
                  className={`text-[9px] px-1 py-0.5 rounded truncate font-medium flex items-center justify-between border ${
                    evt.category === 'exam' 
                      ? 'bg-rose-50 text-rose-700 border-rose-150' 
                      : evt.category === 'study_session'
                      ? 'bg-amber-50 text-amber-700 border-amber-150'
                      : crs?.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                      : crs?.color === 'indigo' ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                      : crs?.color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-150'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={`${evt.title} (${evt.startTime}-${evt.endTime})`}
                >
                  <span className="truncate">{evt.title}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:scale-105 ml-1 transition"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <div key={index} id={`weekday-${index}`} className="py-1 text-center text-[10px] uppercase font-bold bg-slate-50 border-r border-b border-slate-100 text-slate-500">
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  // Render Schedule Agenda
  const renderAgendaList = () => {
    if (filteredEvents.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center gap-2">
          <AlertCircle className="w-8 h-8 text-slate-300" />
          <span>No upcoming schedules matches active filters.</span>
        </div>
      );
    }

    // Sort by Date then StartTime
    const sorted = [...filteredEvents].sort((a, b) => {
      const cmpDate = a.date.localeCompare(b.date);
      if (cmpDate !== 0) return cmpDate;
      return a.startTime.localeCompare(b.startTime);
    });

    return (
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {sorted.map(evt => {
          const crs = getCourseForEvent(evt.courseId);
          return (
            <div 
              key={evt.id} 
              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-10 rounded-full shrink-0 ${
                  evt.category === 'exam' ? 'bg-red-500' 
                  : evt.category === 'study_session' ? 'bg-amber-500'
                  : crs?.color === 'emerald' ? 'bg-emerald-500'
                  : crs?.color === 'indigo' ? 'bg-indigo-500'
                  : crs?.color === 'rose' ? 'bg-rose-500'
                  : 'bg-slate-400'
                }`} />
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    {evt.title}
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">
                      {evt.category.replace('_', ' ')}
                    </span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {evt.date} • {evt.startTime} - {evt.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {evt.location}
                    </span>
                    {crs && (
                      <span className="font-semibold text-slate-700">
                        ({crs.code} - {crs.name})
                      </span>
                    )}
                    {evt.reminderMinutes > 0 && (
                      <span className="flex items-center gap-1 text-indigo-600/90 font-medium">
                        <Bell className="w-3 h-3 text-indigo-500" />
                        Remind {evt.reminderMinutes}m before
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition"
                  title="Remove Schedule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-full font-sans text-slate-800">
      {/* Header bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <CalIcon className="w-4 h-4 text-indigo-600 animate-pulse" />
            Academic Calendar Planner
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Manage events, exams, reviews, and custom alerts.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-600">
            <Filter className="w-3 h-3" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent font-medium border-none outline-none cursor-pointer"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[11px] text-slate-600">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-medium border-none outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="class">Classes</option>
              <option value="exam">Exams</option>
              <option value="meeting">Meetings</option>
              <option value="study_session">Study Sessions</option>
              <option value="other">Others</option>
            </select>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 flex-none shrink-0 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Calendar Navigation and View Switcher */}
      <div className="flex justify-between items-center bg-slate-50/80 border border-slate-100 rounded-lg p-2.5 mb-3">
        <div className="flex items-center gap-1 pb-0">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-705 px-2">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-200 rounded text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border border-slate-200 bg-white p-0.5 rounded-md">
          <button 
            onClick={() => setView('month')}
            className={`px-2 py-1 text-[10px] font-semibold rounded ${view === 'month' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Calendar Grid
          </button>
          <button 
            onClick={() => setView('agenda')}
            className={`px-2 py-1 text-[10px] font-semibold rounded ${view === 'agenda' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Agenda List
          </button>
        </div>
      </div>

      {/* Main Grid display element */}
      <div className="flex-1 bg-slate-50/30 rounded-lg border border-slate-100 overflow-hidden">
        {view === 'month' ? renderMonthGrid() : renderAgendaList()}
      </div>

      <div className="mt-3 text-[10px] text-slate-400 bg-slate-950/5 border border-slate-100 rounded-md p-2 flex items-center justify-between">
        <span>Quick Suggestion: Tell Aura chat on left: <em>"Study Session on Thursday at 4pm"</em> to auto fill.</span>
        <span>Total: <strong>{filteredEvents.length}</strong> schedules</span>
      </div>

      {/* Scheduling Interactive Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Title Banner */}
            <div className="bg-indigo-900 text-white px-5 py-3.5 flex items-center justify-between flex-none">
              <div>
                <h3 className="font-bold text-xs">Aesthetic Class &amp; Event Planner</h3>
                <p className="text-[10px] opacity-75">Link assignments, exams, and lecture sessions to courses.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:opacity-80 text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden text-slate-700">
              <div className="p-5 space-y-3.5 flex-1 overflow-y-auto scrollbar-thin">
                {/* Event Title */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Title / Subject Name</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. Lab submission review"
                    className="w-full bg-slate-150 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                {/* Course linking & Category selection split row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Course</label>
                    <select 
                      value={newCourseId} 
                      onChange={(e) => setNewCourseId(e.target.value)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">No Course Associated</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Category Type</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="class">Regular Classroom Lecture</option>
                      <option value="exam">Midterm / High-Stakes Exam</option>
                      <option value="meeting">Study Group meeting</option>
                      <option value="study_session">Homework Review session</option>
                      <option value="other">Other Campus activities</option>
                    </select>
                  </div>
                </div>

                {/* Date & times split row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Date</label>
                    <input 
                      type="date" 
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time</label>
                    <input 
                      type="text" 
                      value={newStartTime} 
                      onChange={(e) => setNewStartTime(e.target.value)}
                      placeholder="09:00"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Time</label>
                    <input 
                      type="text" 
                      value={newEndTime} 
                      onChange={(e) => setNewEndTime(e.target.value)}
                      placeholder="11:00"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Location & Reminder split */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Location Venue</label>
                    <input 
                      type="text" 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. DK-B Auditorium"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom Reminder Alerts</label>
                    <select 
                      value={newReminder} 
                      onChange={(e) => setNewReminder(Number(e.target.value))}
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value={5}>5 minutes before</option>
                      <option value={15}>15 minutes before</option>
                      <option value={30}>30 minutes before</option>
                      <option value={60}>1 hour before</option>
                      <option value={1440}>1 day before</option>
                      <option value={0}>No Notification Prompt</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Agenda / Description Notes</label>
                  <textarea 
                    rows={2}
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Insert exam codes, guidelines, pre-read references..."
                    className="w-full bg-slate-150 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-850"
                  />
                </div>

                {/* Recurring schedule selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Recurring interval</label>
                  <div className="flex gap-2.5 mt-1">
                    {['none', 'daily', 'weekly', 'monthly'].map((recVal) => (
                      <label key={recVal} className="flex items-center gap-1 text-[11px] font-medium text-slate-650 cursor-pointer">
                        <input 
                          type="radio" 
                          name="recurring" 
                          value={recVal} 
                          checked={newRecurring === recVal}
                          onChange={() => setNewRecurring(recVal as any)}
                          className="text-indigo-650"
                        />
                        <span className="capitalize">{recVal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50 flex-none rounded-b-xl">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 hover:bg-slate-100 rounded-lg"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  Create Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
