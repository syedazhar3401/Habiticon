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
  onDeleteCourse: (id: string) => void;
}

export default function CourseModule({
  courses,
  tasks,
  events,
  notes,
  onAddCourse,
  onDeleteCourse
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
    <div className="bg-[#F9F9F9] border-2 border-black rounded-none p-4 shadow-[4px_4px_0px_#000000] h-full flex flex-col font-sans text-black">
      
      {/* 1. Header with Enroll controller */}
      <div className="flex justify-between items-center gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-black text-black flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-[#E85002]" />
            Active Course Catalog &amp; Syllabus Manager
          </h2>
          <p className="text-[10px] text-[#333] font-mono font-bold">Coordinate semesters, lecturers, hours, and class boundaries.</p>
        </div>

        <button 
          onClick={() => setShowAddCourse(true)}
          className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black font-black text-[10.5px] px-3.5 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] transition cursor-pointer"
        >
          + Enroll Course
        </button>
      </div>

      {/* 2. Horizontal course catalog tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 shrink-0">
        {courses.map(c => {
          const isActive = c.id === selectedCourseId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`p-2.5 rounded-none border-2 border-black text-left cursor-pointer transition ${
                isActive 
                  ? 'bg-white shadow-[2px_2px_0px_#E85002] font-black' 
                  : 'bg-[#333333] text-[#A7A7A7] hover:bg-white hover:text-black hover:shadow-[2px_2px_0px_#000000]'
              }`}
            >
              <div className="text-[10px] font-black tracking-wide uppercase text-[#E85002] font-mono">{c.code}</div>
              <h4 className="text-[11px] font-black mt-1 line-clamp-1 uppercase">{c.name}</h4>
              <span className="text-[9.5px] font-mono text-[#A7A7A7] block mt-1">Prof. {c.lecturer.split(' ').pop()}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Course Contextual Dashboard representation */}
      {activeCourse ? (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          
          {/* Col 1: Lecturer & Basic metadata - Style A */}
          <div className="neo-card-a p-4 space-y-3.5 h-full rounded-none">
            <div>
              <span className="text-[8.5px] font-mono uppercase bg-black text-white font-black px-2 py-0.5 border border-black">COURSE PROFILE</span>
              <h3 className="text-base font-black text-black mt-2 font-mono">{activeCourse.code}</h3>
              <h4 className="text-xs font-black text-black mt-0.5 uppercase tracking-wide">{activeCourse.name}</h4>
            </div>

            <div className="space-y-2.5 text-xs text-black pb-3.5 border-b-2 border-black/20 font-bold">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-black" />
                <span>Instructor: <strong>{activeCourse.lecturer}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-black" />
                <span>Venue: {activeCourse.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-black" />
                <span>Semester Weight: {activeCourse.credits} Credits</span>
              </div>
            </div>

            {/* Progress metric bar */}
            <div>
              <div className="flex justify-between items-center text-[10.5px] mb-1 font-bold">
                <span className="text-black uppercase font-black font-mono">Academic Progress</span>
                <span className="text-[#E85002] font-mono font-black">{courseProgress}%</span>
              </div>
              <div className="w-full bg-[#A7A7A7] h-2.5 border border-black rounded-none mt-1.5 overflow-hidden">
                <div className="bg-[#E85002] h-full transition-all" style={{ width: `${courseProgress}%` }} />
              </div>
              <span className="text-[9px] text-[#646464] mt-1.5 block font-mono font-bold">Based on completed homework/assignments.</span>
            </div>

            <button
              onClick={() => {
                if (confirm(`Are you sure you want to drop course ${activeCourse.code}?`)) {
                  onDeleteCourse(activeCourse.id);
                  const remaining = courses.filter(c => c.id !== activeCourse.id);
                  setSelectedCourseId(remaining[0]?.id || '');
                }
              }}
              className="w-full text-center py-2 bg-black text-[#F9F9F9] hover:bg-[#E85002] hover:text-black border-2 border-black text-[10px] font-black uppercase tracking-wide transition mt-4 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Drop Course Module
            </button>
          </div>

          {/* Col 2: Contextual assignments checks - Style D */}
          <div className="clay-card border border-[#e2e8f0]/60 p-4 flex flex-col h-full bg-white">
            <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3 border-b-2 border-black/10 pb-1.5 shrink-0">
              Assignments &amp; Deadlines ({courseTasks.length})
            </h4>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-[190px] pr-1">
              {courseTasks.map(tk => (
                <div key={tk.id} className="p-2.5 border-2 border-black rounded-none bg-[#F9F9F9] flex flex-col gap-1 text-left shrink-0 shadow-[2px_2px_0px_#000000]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-black uppercase tracking-tight truncate">{tk.title}</span>
                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 border border-black ${
                      tk.status === 'completed' ? 'bg-[#333] text-white' : 'bg-[#E85002] text-black'
                    }`}>
                      {tk.status === 'completed' ? 'Done' : 'Todo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[9.5px] text-[#646464] mt-1 font-mono font-bold">
                    <span>Deadline: {tk.deadline}</span>
                    <span>{tk.estimatedHours}h est</span>
                  </div>
                </div>
              ))}

              {courseTasks.length === 0 && (
                <div className="text-center py-8 text-[10px] text-[#A7A7A7] font-mono font-bold uppercase">No tasks mapped under {activeCourse.code}.</div>
              )}
            </div>
          </div>

          {/* Col 3: Calendar schedules upcoming - Style C */}
          <div className="neo-card-c p-4 flex flex-col h-full bg-black text-white">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#E85002] mb-3 border-b-2 border-[#333] pb-1 shrink-0">
              Classes &amp; Exams ({courseEvents.length})
            </h4>

            <div className="flex-grow space-y-2 overflow-y-auto max-h-[190px] pr-1">
              {courseEvents.map(evt => (
                <div key={evt.id} className="p-2.5 border border-black bg-[#333] flex flex-col gap-1 text-left shrink-0 shadow-[2px_2px_0px_#E85002]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">{evt.title}</span>
                    <span className="text-[8.5px] px-2 py-0.5 bg-[#E85002] text-black font-black border border-black uppercase font-mono">
                      {evt.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9.5px] text-[#A7A7A7] font-mono font-bold mt-1">
                    <span>{evt.date}</span>
                    <span>{evt.startTime}-{evt.endTime}</span>
                  </div>
                </div>
              ))}

              {courseEvents.length === 0 && (
                <div className="text-center py-8 text-[10px] text-[#A7A7A7] font-mono font-bold uppercase">No calendar sessions set currently.</div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-[#A7A7A7] font-mono font-bold uppercase">Configure enrollment data first.</div>
      )}

      {/* Enrollment overlay dialog panel */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_#E85002] max-w-sm w-full max-h-[90vh] flex flex-col overflow-hidden text-black animate-in fade-in zoom-in duration-150">
            <div className="bg-black text-white px-4 py-4 flex items-center justify-between border-b-4 border-black flex-none">
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider">Enroll new Academic Course module</h4>
                <p className="text-[9.5px] opacity-75 mt-0.5 font-mono">Connect classes, calendars, task list estimators, and folders.</p>
              </div>
              <button onClick={() => setShowAddCourse(false)} className="text-white hover:text-[#E85002] font-black text-lg">×</button>
            </div>

            <form onSubmit={handleEnroll} className="flex flex-col flex-1 overflow-hidden bg-[#F9F9F9]">
              <div className="p-4 space-y-3.5 flex-1 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Course Code</label>
                    <input 
                      type="text" 
                      value={newCode} 
                      onChange={(e) => setNewCode(e.target.value)} 
                      placeholder="WIX1003"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Subject Name</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      placeholder="Computer Systems"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#E85002] shadow-[2px_2px_0px_#000000] font-mono font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Lecturer Instructor</label>
                  <input 
                    type="text" 
                    value={newLecturer} 
                    onChange={(e) => setNewLecturer(e.target.value)} 
                    placeholder="e.g. Dr Professor Alice"
                    className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black focus:outline-none shadow-[2px_2px_0px_#000000] font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Credits weight</label>
                    <input 
                      type="number" 
                      value={newCredits} 
                      onChange={(e) => setNewCredits(e.target.value)} 
                      placeholder="3"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Venue Venue Location</label>
                    <input 
                      type="text" 
                      value={newLoc} 
                      onChange={(e) => setNewLoc(e.target.value)} 
                      placeholder="DK-B Auditorium"
                      className="w-full bg-white border-2 border-black rounded-none px-2.5 py-1.5 text-xs text-black shadow-[2px_2px_0px_#000000] font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Theme color option */}
                <div>
                  <label className="block text-[10px] font-black text-black uppercase mb-1 font-mono">Visual Theme Color</label>
                  <div className="flex gap-4 mt-2">
                    {['emerald', 'indigo', 'rose'].map(themeKey => (
                      <label key={themeKey} className="flex items-center gap-1.5 text-xs font-black text-black cursor-pointer font-mono uppercase">
                        <input 
                          type="radio" 
                          name="theme" 
                          value={themeKey} 
                          checked={newTheme === themeKey}
                          onChange={() => setNewTheme(themeKey)} 
                          className="text-[#E85002] border-2 border-black focus:ring-black cursor-pointer animate-none"
                        />
                        <span>{themeKey}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 p-4 border-t-4 border-black bg-white flex-none rounded-none">
                <button 
                  type="button" 
                  onClick={() => setShowAddCourse(false)}
                  className="text-xs font-black text-black border-2 border-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition shadow-[2px_2px_0px_#000000]"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-[#E85002] hover:bg-black hover:text-[#E85002] text-black font-black text-xs px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000000] transition"
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
