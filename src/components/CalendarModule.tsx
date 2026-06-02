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
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const todayDateString = (() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();
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
      days.push(<div key={`empty-${i}`} className="h-20 bg-[#333]/5 border-2 border-black p-1"></div>);
    }

    // Days grid
    for (let day = 1; day <= daysInMonth; day++) {
      const padDay = day.toString().padStart(2, '0');
      const padMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const dateString = `${currentDate.getFullYear()}-${padMonth}-${padDay}`;
      
      const dayEvents = filteredEvents.filter(e => e.date === dateString);

      // Bento styling: Alternate backgrounds or render active highlighted days!
      const isWeekend = (day + startOffset - 1) % 7 === 0 || (day + startOffset - 1) % 7 === 6;
      const isToday = dateString === todayDateString;
      const dayBg = isToday 
        ? 'bg-[#E85002]/20' 
        : dayEvents.length > 0 
        ? 'bg-white' 
        : isWeekend 
        ? 'bg-[#A7A7A7]/10' 
        : 'bg-[#F9F9F9]';

      days.push(
        <div key={`day-${day}`} className={`h-20 p-1 flex flex-col justify-between overflow-hidden relative group hover:bg-[#E85002]/10 transition-colors ${
          isToday ? 'border-4 border-[#E85002]' : 'border-2 border-black'
        } ${dayBg}`}>
          <div className="flex justify-between items-start w-full select-none">
            <span className="text-[10px] font-black text-black font-mono">{day}</span>
            {isToday && (
              <span className="text-[7.5px] font-black bg-black text-[#E85002] px-1 border border-black uppercase font-mono leading-none">
                Today
              </span>
            )}
          </div>
          <div className="flex-1 mt-1 overflow-y-auto space-y-1 scrollbar-thin">
            {dayEvents.map(evt => {
              const crs = getCourseForEvent(evt.courseId);
              
              // Neo-Brutalist flat high contrast badge
              const badgeStyle = evt.category === 'exam' 
                ? 'bg-[#E85002] text-black border border-black' 
                : evt.category === 'study_session'
                ? 'bg-black text-white border border-black'
                : 'bg-white text-black border border-black font-mono';

              return (
                <div 
                  key={evt.id} 
                  className={`text-[9px] px-1 py-0.5 rounded-none truncate font-black flex items-center justify-between uppercase tracking-tighter ${badgeStyle}`}
                  title={`${evt.title} (${evt.startTime}-${evt.endTime})`}
                >
                  <span className="truncate">{evt.title}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteEvent(evt.id); }}
                    className="opacity-0 group-hover:opacity-100 text-black hover:text-[#E85002] ml-1 transition cursor-pointer font-bold"
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
      <div className="grid grid-cols-7 border-t-2 border-l-2 border-black">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <div key={index} id={`weekday-${index}`} className="py-1.5 text-center text-[10px] uppercase font-black bg-black text-[#F9F9F9] border-r-2 border-b-2 border-black">
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
        <div className="text-center py-12 text-black text-xs flex flex-col items-center gap-2 font-mono font-bold">
          <AlertCircle className="w-8 h-8 text-[#E85002]" />
          <span className="uppercase">No upcoming schedules matches active filters.</span>
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
              className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-none hover:shadow-[3px_3px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-10 border border-black shrink-0 ${
                  evt.category === 'exam' ? 'bg-[#E85002]' 
                  : evt.category === 'study_session' ? 'bg-black'
                  : 'bg-[#A7A7A7]'
                }`} />
                <div>
                  <h4 className="text-xs font-black text-black flex items-center gap-2 uppercase tracking-tight">
                    {evt.title}
                    <span className="text-[9px] bg-black text-white px-2 py-0.5 border border-black font-black font-mono">
                      {evt.category.replace('_', ' ')}
                    </span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#333333] mt-1 font-mono font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-black" />
                      {evt.date} • {evt.startTime} - {evt.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-black" />
                      {evt.location}
                    </span>
                    {crs && (
                      <span className="text-[#E85002] font-black">
                        ({crs.code} - {crs.name})
                      </span>
                    )}
                    {evt.reminderMinutes > 0 && (
                      <span className="flex items-center gap-1 text-black font-black">
                        <Bell className="w-3 h-3 text-[#E85002] fill-[#E85002]" />
                        Remind {evt.reminderMinutes}m before
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onDeleteEvent(evt.id)}
                  className="p-1 hover:bg-[#E85002] rounded border border-black text-black transition cursor-pointer"
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
    <div className="bg-[#F9F9F9] border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_#000000] flex flex-col h-full font-sans text-black">
      {/* Header bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
              <CalIcon className="w-4 h-4 text-[#E85002]" />
              Academic Calendar Planner
            </h2>
            <p className="text-[10px] text-[#333] font-mono font-bold">Manage events, exams, reviews, and custom alerts.</p>
          </div>
          <div className="bg-[#E85002] text-black border-2 border-black px-2.5 py-1 text-[10px] font-black uppercase font-mono shadow-[2px_2px_0px_#000000]">
            📅 Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-none text-[11px] font-bold shadow-[2px_2px_0px_#000000]">
            <Filter className="w-3 h-3 text-black" />
            <select 
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="bg-transparent font-black border-none outline-none cursor-pointer text-black"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-none text-[11px] font-bold shadow-[2px_2px_0px_#000000]">
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-black border-none outline-none cursor-pointer text-black"
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
            className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black text-[11px] font-black px-3.5 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 flex-none shrink-0 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule
          </button>
        </div>
      </div>

      {/* Calendar Navigation and View Switcher */}
      <div className="flex justify-between items-center bg-white border-2 border-black rounded-none p-2.5 mb-3 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center gap-1 pb-0">
          <button onClick={prevMonth} className="p-1 hover:bg-[#E85002] border border-black rounded-none text-black cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-black px-3 font-mono uppercase tracking-wide">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-[#E85002] border border-black rounded-none text-black cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-2 border-black bg-black p-0.5 rounded-none">
          <button 
            onClick={() => setView('month')}
            className={`px-3 py-1 text-[10px] font-black rounded-none transition ${view === 'month' ? 'bg-[#E85002] text-black' : 'text-white hover:text-[#E85002]'}`}
          >
            Calendar Grid
          </button>
          <button 
            onClick={() => setView('agenda')}
            className={`px-3 py-1 text-[10px] font-black rounded-none transition ${view === 'agenda' ? 'bg-[#E85002] text-black' : 'text-white hover:text-[#E85002]'}`}
          >
            Agenda List
          </button>
        </div>
      </div>

      {/* Main Grid display element */}
      <div className="flex-1 bg-white border-2 border-black rounded-none overflow-hidden shadow-[2px_2px_0px_#000000]">
        {view === 'month' ? renderMonthGrid() : renderAgendaList()}
      </div>

      <div className="mt-3 text-[10px] text-black bg-white border-2 border-black rounded-none p-2 flex items-center justify-between font-mono font-bold shadow-[2px_2px_0px_#000000]">
        <span>Quick Suggestion: Tell Aura chat on left: <em>"Study Session on Thursday at 4pm"</em> to auto fill.</span>
        <span>Total: <strong>{filteredEvents.length}</strong> schedules</span>
      </div>

      {/* Scheduling Interactive Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_#E85002] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Title Banner */}
            <div className="bg-black text-white px-5 py-4 flex items-center justify-between flex-none border-b-4 border-black">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider">Aesthetic Class &amp; Event Planner</h3>
                <p className="text-[9.5px] opacity-75 mt-0.5 font-mono">Link assignments, exams, and lecture sessions to courses.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-[#E85002] font-black text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden text-black bg-[#F9F9F9]">
              <div className="p-5 space-y-3.5 flex-1 overflow-y-auto scrollbar-thin">
                {/* Event Title */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Title / Subject Name</label>
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    placeholder="e.g. Lab submission review"
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    required
                  />
                </div>

                {/* Course linking & Category selection split row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Subject Course</label>
                    <select 
                      value={newCourseId} 
                      onChange={(e) => setNewCourseId(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-black"
                    >
                      <option value="">No Course Associated</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Category Type</label>
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-black"
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
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Target Date</label>
                    <input 
                      type="date" 
                      value={newDate} 
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-white border-2 border-black rounded-none p-1.5 text-[11px] text-black focus:outline-none shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Start Time</label>
                    <input 
                      type="text" 
                      value={newStartTime} 
                      onChange={(e) => setNewStartTime(e.target.value)}
                      placeholder="09:00"
                      className="w-full bg-white border-2 border-black rounded-none p-1.5 text-[11px] text-black focus:outline-none shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">End Time</label>
                    <input 
                      type="text" 
                      value={newEndTime} 
                      onChange={(e) => setNewEndTime(e.target.value)}
                      placeholder="11:00"
                      className="w-full bg-white border-2 border-black rounded-none p-1.5 text-[11px] text-black focus:outline-none shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Location & Reminder split */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Location Venue</label>
                    <input 
                      type="text" 
                      value={newLocation} 
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. DK-B Auditorium"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Custom Reminder Alerts</label>
                    <select 
                      value={newReminder} 
                      onChange={(e) => setNewReminder(Number(e.target.value))}
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-black"
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
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Agenda / Description Notes</label>
                  <textarea 
                    rows={2}
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Insert exam codes, guidelines, pre-read references..."
                    className="w-full bg-white border-2 border-black rounded-none px-3 py-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                  />
                </div>

                {/* Recurring schedule selection */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Recurring interval</label>
                  <div className="flex gap-3.5 mt-1.5">
                    {['none', 'daily', 'weekly', 'monthly'].map((recVal) => (
                      <label key={recVal} className="flex items-center gap-1.5 text-[11px] font-bold text-black cursor-pointer font-mono uppercase">
                        <input 
                          type="radio" 
                          name="recurring" 
                          value={recVal} 
                          checked={newRecurring === recVal}
                          onChange={() => setNewRecurring(recVal as any)}
                          className="text-[#E85002] border-2 border-black focus:ring-black cursor-pointer"
                        />
                        <span>{recVal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2.5 p-4 border-t-4 border-black bg-white flex-none rounded-none">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="text-xs font-black text-black border-2 border-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000000]"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black font-black text-xs px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] transition"
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
