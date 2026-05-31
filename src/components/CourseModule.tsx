/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Task, CalendarEvent, Note } from '../types';
import { 
  BookOpen, Plus, User, MapPin, Award, CheckCircle, Clock, FileText, Compass, AlertCircle
} from 'lucide-react';

interface CourseModuleProps {
  courses: Course[];
  tasks: Task[];
  events: CalendarEvent[];
  notes: Note[];
  onAddCourse: (course: Course) => void;
}

export default function CourseModule({
  courses,
  tasks,
  events,
  notes,
  onAddCourse
}: CourseModuleProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [showAddCourse, setShowAddCourse] = useState(false);

  // Form states 
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLecturer, setNewLecturer] = useState('');
  const [newSemester, setNewSemester] = useState('Semester 1');
  const [newCredits, setNewCredits] = useState('3');
  const [newLoc, setNewLoc] = useState('');
  const [newTheme, setNewTheme] = useState('emerald');

  // Load contextual statistics
  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  const courseTasks = tasks.filter(t => t.courseId === selectedCourseId);
  const courseEvents = events.filter(e => e.courseId === selectedCourseId);
  const courseNotes = notes.filter(n => n.courseId === selectedCourseId);

  // Completed metrics
  const doneTasks = courseTasks.filter(t => t.status === 'completed').length;
  const courseProgress = courseTasks.length > 0 ? Math.round((doneTasks / courseTasks.length) * 100) : 0;

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const enrolled: Course = {
      id: `course-${Date.now()}`,
      code: newCode.toUpperCase(),
      name: newName,
      lecturer: newLecturer || 'Professor Staff',
      semester: newSemester,
      credits: Number(newCredits) || 3,
      location: newLoc || 'Room 301',
      color: newTheme
    };

    onAddCourse(enrolled);
    setSelectedCourseId(enrolled.id);
    resetForm();
  };

  const resetForm = () => {
    setNewCode('');
    setNewName('');
    setNewLecturer('');
    setNewLoc('');
    setNewSemester('Semester 1');
    setNewCredits('3');
    setNewTheme('emerald');
    setShowAddCourse(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-full flex flex-col font-sans text-slate-800">
      
      {/* 1. Header with Enroll controller */}
      <div className="flex justify-between items-center gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600 animate-pulse" />
            Active Course Catalog &amp; Syllabus Manager
          </h2>
          <p className="text-[10px] text-slate-500 font-medium">Coordinate semesters, lecturers, hours, and class boundaries.</p>
        </div>

        <button 
          onClick={() => setShowAddCourse(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
        >
          + Enroll Course
        </button>
      </div>

      {/* 2. Horizontal course catalog tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 shrink-0">
        {courses.map(c => {
          const isActive = c.id === selectedCourseId;
          const classColor = 
            c.color === 'emerald' ? 'border-emerald-500 text-emerald-800' 
            : c.color === 'indigo' ? 'border-indigo-500 text-indigo-800'
            : c.color === 'rose' ? 'border-rose-500 text-rose-800'
            : 'border-slate-400 text-slate-800';

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                isActive 
                  ? `${classColor} border-2 bg-slate-50 font-bold shadow-sm` 
                  : 'border-slate-150 bg-white text-slate-650 hover:bg-slate-50'
              }`}
            >
              <div className="text-[10px] font-black tracking-wide uppercase opacity-75">{c.code}</div>
              <h4 className="text-[11px] font-bold mt-1 line-clamp-1">{c.name}</h4>
              <span className="text-[9.5px] font-mono text-slate-455 block mt-1.5">Prof. {c.lecturer.split(' ').pop()}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Course Contextual Dashboard representation */}
      {activeCourse ? (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          
          {/* Col 1: Lecturer & Basic metadata */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 space-y-3.5 h-full">
            <div>
              <span className="text-[8.5px] font-mono uppercase bg-slate-200 font-bold text-slate-600 px-1.5 py-0.5 rounded">COURSE PROFILE</span>
              <h3 className="text-sm font-extrabold text-slate-800 mt-1">{activeCourse.code}</h3>
              <h4 className="text-xs font-bold text-slate-501 mt-0.5">{activeCourse.name}</h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-650 pb-3.5 border-b border-slate-200/60 font-medium">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Instructor: <strong>{activeCourse.lecturer}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Venue: {activeCourse.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Semester Weight: {activeCourse.credits} Credits</span>
              </div>
            </div>

            {/* Progress metric bar */}
            <div>
              <div className="flex justify-between items-center text-[10px] mb-1 font-semibold">
                <span className="text-slate-500 uppercase font-bold">Academic Progress</span>
                <span className="text-indigo-700 font-mono font-bold">{courseProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-650 h-full transition-all" style={{ width: `${courseProgress}%` }} />
              </div>
              <span className="text-[8.5px] text-slate-500 mt-1 block">Based on completed homework/assignments.</span>
            </div>
          </div>

          {/* Col 2: Contextual assignments checks */}
          <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col h-full">
            <h4 className="text-xs font-bold tracking-tight text-slate-800 mb-2 border-b border-slate-50 pb-1 shrink-0">
              Assignments &amp; Deadlines ({courseTasks.length})
            </h4>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-[190px] pr-1">
              {courseTasks.map(tk => (
                <div key={tk.id} className="p-2 border border-slate-100 rounded bg-slate-50/50 flex flex-col gap-0.5 text-left shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-805 truncate">{tk.title}</span>
                    <span className={`text-[8px] font-black uppercase px-1 rounded ${
                      tk.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tk.status === 'completed' ? 'Done' : 'Todo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-slate-401 mt-1 font-mono">
                    <span>Deadline: {tk.deadline}</span>
                    <span>{tk.estimatedHours}h est</span>
                  </div>
                </div>
              ))}

              {courseTasks.length === 0 && (
                <div className="text-center py-8 text-[10px] text-slate-400 leading-relaxed">No tasks mapped under {activeCourse.code}.</div>
              )}
            </div>
          </div>

          {/* Col 3: Calendar schedules upcoming */}
          <div className="bg-white border border-slate-150 p-3 rounded-lg flex flex-col h-full">
            <h4 className="text-xs font-bold tracking-tight text-slate-800 mb-2 border-b border-slate-50 pb-1 shrink-0">
              Classes &amp; Exams ({courseEvents.length})
            </h4>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-[190px] pr-1">
              {courseEvents.map(evt => (
                <div key={evt.id} className="p-2 border border-slate-100 rounded bg-slate-50/50 flex flex-col gap-1 text-left shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-800 truncate">{evt.title}</span>
                    <span className="text-[8px] p-0.5 bg-indigo-50 text-indigo-700 font-bold rounded uppercase">
                      {evt.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>{evt.date}</span>
                    <span>{evt.startTime}-{evt.endTime}</span>
                  </div>
                </div>
              ))}

              {courseEvents.length === 0 && (
                <div className="text-center py-8 text-[10px] text-slate-400 leading-relaxed">No calendar sessions set currently.</div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">Configure enrollment data first.</div>
      )}

      {/* Enrollment overlay dialog panel */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="bg-indigo-900 text-white px-4 py-3 flex items-center justify-between flex-none">
              <div>
                <h4 className="font-bold text-xs">Enroll new Academic Course module</h4>
                <p className="text-[10px] opacity-75">Connect classes, calendars, task list estimators, and folders.</p>
              </div>
              <button onClick={() => setShowAddCourse(false)} className="text-white hover:opacity-80">×</button>
            </div>

            <form onSubmit={handleEnroll} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Course Code</label>
                    <input 
                      type="text" 
                      value={newCode} 
                      onChange={(e) => setNewCode(e.target.value)} 
                      placeholder="WIX1003"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject Name</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      placeholder="Computer Systems"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Lecturer Instructor</label>
                  <input 
                    type="text" 
                    value={newLecturer} 
                    onChange={(e) => setNewLecturer(e.target.value)} 
                    placeholder="e.g. Dr Professor Alice"
                    className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Credits weight</label>
                    <input 
                      type="number" 
                      value={newCredits} 
                      onChange={(e) => setNewCredits(e.target.value)} 
                      placeholder="3"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Venue Venue Location</label>
                    <input 
                      type="text" 
                      value={newLoc} 
                      onChange={(e) => setNewLoc(e.target.value)} 
                      placeholder="DK-B Auditorium"
                      className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Theme color option */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visual Theme Color</label>
                  <div className="flex gap-4 mt-2">
                    {['emerald', 'indigo', 'rose'].map(themeKey => (
                      <label key={themeKey} className="flex items-center gap-1.5 text-xs font-semibold text-slate-705 cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          value={themeKey} 
                          checked={newTheme === themeKey}
                          onChange={() => setNewTheme(themeKey)} 
                          className="text-indigo-650"
                        />
                        <span className="capitalize">{themeKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 p-4 border-t border-slate-100 bg-slate-50 flex-none rounded-b-xl">
                <button 
                  type="button" 
                  onClick={() => setShowAddCourse(false)}
                  className="text-xs font-semibold text-slate-500 px-3 py-1.5 hover:bg-slate-100 rounded-lg"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  Enroll Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
