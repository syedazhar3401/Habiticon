/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, Note, Course 
} from '../types';
import { 
  Plus, FolderPlus, FileText, Search, Tag, Star, StarOff, Trash2, Edit3, Paintbrush, BookOpen, Clock, Download, Eraser, CheckSquare, List
} from 'lucide-react';

interface NoteModuleProps {
  folders: Folder[];
  notes: Note[];
  courses: Course[];
  selectedNoteId: string | null;
  onSelectNote: (id: string | null) => void;
  onAddFolder: (name: string, courseId?: string) => void;
  onAddNote: (note: Partial<Note>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export default function NoteModule({
  folders,
  notes,
  courses,
  selectedNoteId,
  onSelectNote,
  onAddFolder,
  onAddNote,
  onUpdateNote,
  onDeleteNote
}: NoteModuleProps) {
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderCourseId, setFolderCourseId] = useState('');
  const [noteEditTab, setNoteEditTab] = useState<'editor' | 'canvas'>('editor');

  // Drawing Canvas States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#4f46e5'); // indigo default
  const [brushSize, setBrushSize] = useState(3);
  const [eraserMode, setEraserMode] = useState(false);

  // Active note lookup
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  useEffect(() => {
    // If we switch tab to Canvas, paint initial backing if needed
    if (noteEditTab === 'canvas' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [noteEditTab, selectedNoteId]);

  // Filtering Notes
  const filteredNotes = notes.filter(n => {
    const matchFolder = activeFolderId === 'all' || n.folderId === activeFolderId;
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  const getCourse = (courseId?: string) => {
    return courses.find(c => c.id === courseId);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onAddFolder(folderName, folderCourseId || undefined);
    setFolderName('');
    setFolderCourseId('');
    setShowFolderModal(false);
  };

  const handleCreateNote = () => {
    const newNoteObj: Note = {
      id: `note-${Date.now()}`,
      title: 'Lecture Draft Summary',
      content: `# Lecture Notes Outline\n\n- Topic: Introduction\n- Key Formula/Themes:\n- References:\n\n*Double-click here to write and save.*`,
      folderId: activeFolderId !== 'all' ? activeFolderId : folders[0]?.id,
      courseId: folders.find(f => f.id === activeFolderId)?.courseId,
      tags: ['draft'],
      isFavorite: false,
      updatedAt: new Date().toISOString()
    };
    onAddNote(newNoteObj);
    onSelectNote(newNoteObj.id);
  };

  // HTML5 Drawing logic mouse events
  const startCanvasDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.strokeStyle = eraserMode ? '#ffffff' : brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopCanvasDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvasBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex overflow-hidden font-sans text-slate-800">
      
      {/* 1. Left Folders Explorer (Compact) */}
      <div className="w-56 border-r border-slate-200 bg-slate-50/55 p-3 flex flex-col h-full shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            Workspace Folders
          </h3>
          <button 
            onClick={() => setShowFolderModal(true)}
            className="p-1 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded transition"
            title="Add Library folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Directory paths list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          <button
            onClick={() => setActiveFolderId('all')}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              activeFolderId === 'all' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="truncate">📁 All Notebooks</span>
            <span className="text-[10px] opacity-75">({notes.length})</span>
          </button>

          {folders.map(f => {
            const courseRef = getCourse(f.courseId);
            const count = notes.filter(n => n.folderId === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFolderId(f.id)}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex flex-col gap-0.5 transition ${
                  activeFolderId === f.id 
                    ? 'bg-indigo-600 text-white shadow' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <div className="flex justify-between w-full items-center">
                  <span className="truncate font-bold">📂 {f.name}</span>
                  <span className="text-[10px] opacity-80 font-mono">({count})</span>
                </div>
                {courseRef && (
                  <span className={`text-[8.5px] uppercase tracking-wider ${activeFolderId === f.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {courseRef.code} Associated
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search tool block */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filter topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[10px] text-slate-805 placeholder-slate-450 focus:outline-none"
            />
            <Search className="absolute right-2 top-2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Middle Notes List Index */}
      <div className="w-56 border-r border-slate-200 p-3 flex flex-col h-full shrink-0">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Active Notes</span>
          <button 
            onClick={handleCreateNote}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" /> Note
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-slate-400">No notes indexed.</div>
          ) : (
            filteredNotes.map(n => {
              const isActive = activeNote && activeNote.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => onSelectNote(n.id)}
                  className={`p-2 rounded-lg cursor-pointer transition flex flex-col text-left border ${
                    isActive 
                      ? 'bg-slate-950 border-slate-800 text-white' 
                      : 'bg-white border-slate-150 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h5 className="text-[10px] font-bold line-clamp-1 flex-grow">
                      {n.title || 'Draft note'}
                    </h5>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateNote(n.id, { isFavorite: !n.isFavorite }); }}
                      className={`${n.isFavorite ? 'text-amber-500' : 'text-slate-350 hover:text-amber-500'} transition shrink-0`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                  
                  {/* content snippet */}
                  <span className="text-[9.5px] text-slate-400 truncate mt-1">
                    {n.content.replace(/[#*_\-]/g, '').slice(0, 40) || 'Empty summary draft.'}
                  </span>

                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-50/10 text-[8.5px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(n.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteNote(n.id); }}
                      className="text-slate-400 hover:text-red-500 opacity-60 hover:opacity-100"
                      title="Trash notebook"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Right Focused Content Pad / Editor */}
      <div className="flex-grow flex flex-col h-full bg-slate-50/30">
        {activeNote ? (
          <div className="flex flex-col h-full">
            
            {/* Note Editor Header */}
            <div className="bg-slate-950 text-white p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <input 
                  type="text" 
                  value={activeNote.title}
                  onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value, updatedAt: new Date().toISOString() })}
                  className="bg-transparent border-none focus:outline-none font-bold text-xs text-white max-w-[180px] md:max-w-xs"
                />
              </div>

              {/* View/Canvas Switcher */}
              <div className="flex border border-slate-800 p-0.5 rounded-lg bg-slate-900">
                <button
                  onClick={() => setNoteEditTab('editor')}
                  className={`px-2 py-1 rounded text-[9.5px] font-bold transition flex items-center gap-1 ${
                    noteEditTab === 'editor' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Markdown Code
                </button>
                <button
                  onClick={() => setNoteEditTab('canvas')}
                  className={`px-2 py-1 rounded text-[9.5px] font-bold transition flex items-center gap-1 ${
                    noteEditTab === 'canvas' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Paintbrush className="w-3 h-3" /> Stylus Draw
                </button>
              </div>
            </div>

            {/* Editing Box */}
            <div className="flex-grow p-4 min-h-0 bg-white">
              {noteEditTab === 'editor' ? (
                <div className="flex flex-col h-full gap-3">
                  <div className="flex-grow">
                    <textarea
                      value={activeNote.content}
                      onChange={(e) => onUpdateNote(activeNote.id, { content: e.target.value, updatedAt: new Date().toISOString() })}
                      className="w-full h-full p-3 font-mono text-[11px] leading-relaxed border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 select-text"
                      placeholder="Use Notion/OneNote headers markdown syntax..."
                    />
                  </div>

                  {/* Note specs triggers */}
                  <div className="flex border-t border-slate-100 pt-2.5 items-center justify-between shrink-0">
                    <div className="flex gap-1.5 items-center">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Tags:</span>
                      <div className="flex gap-1">
                        {activeNote.tags.map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-[9px] text-slate-600 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono">
                      Last edited: {new Date(activeNote.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                // Stylus whiteboard Canvas elements
                <div className="flex flex-col h-full gap-3">
                  <div className="bg-slate-100/60 p-2.5 border border-slate-200/80 rounded-lg flex flex-wrap items-center justify-between gap-3 shrink-0">
                    
                    {/* Brush Colors */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Brush:</span>
                      <div className="flex gap-1">
                        {['#000000', '#4f46e5', '#3b82f6', '#10b981', '#ef4444'].map(clr => (
                          <button
                            key={clr}
                            onClick={() => { setBrushColor(clr); setEraserMode(false); }}
                            className={`w-4 h-4 rounded-full border transition ${brushColor === clr && !eraserMode ? 'scale-125 ring-1.5 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: clr }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Eraser and Stroke controls */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={eraserMode}
                          onChange={(e) => setEraserMode(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 font-bold"
                        />
                        <span className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                          <Eraser className="w-3.5 h-3.5" /> Eraser Mode
                        </span>
                      </label>

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <span>Size:</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-16 h-1 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <span className="font-mono text-[9px]">{brushSize}px</span>
                      </div>
                    </div>

                    <button
                      onClick={clearCanvasBoard}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded border border-rose-200 transition flex items-center gap-1"
                    >
                      × Clear Canvas
                    </button>
                  </div>

                  {/* Interactive canvas pad */}
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-inner relative">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={280}
                      onMouseDown={startCanvasDrawing}
                      onMouseMove={drawOnCanvas}
                      onMouseUp={stopCanvasDrawing}
                      onMouseLeave={stopCanvasDrawing}
                      className="w-full h-full cursor-crosshair bg-white"
                    />
                    <div className="absolute top-2 left-2 pointer-events-none bg-slate-900/50 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded-full select-none">
                      Whiteboard Canvas Drawing Board: Mouse or Stylus active
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 py-20 text-xs">
            <BookOpen className="w-10 h-10 text-slate-300 animate-pulse mb-2" />
            <span>Select a folder or add a lecture note to begin reviews.</span>
          </div>
        )}
      </div>

      {/* New Folder Creation Popup */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white border border-slate-250 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="bg-indigo-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">Create Academic folder partition</h4>
                <p className="text-[10px] opacity-75">Syllabus segments, capstones, and homework reviews.</p>
              </div>
              <button onClick={() => setShowFolderModal(false)} className="text-white hover:opacity-80">×</button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Folder Partition Name</label>
                <input 
                  type="text" 
                  value={folderName} 
                  onChange={(e) => setFolderName(e.target.value)} 
                  placeholder="e.g. Software Testing Lab Notes"
                  className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Link to Course ID</label>
                <select 
                  value={folderCourseId} 
                  onChange={(e) => setFolderCourseId(e.target.value)}
                  className="w-full bg-slate-150 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="">No Course Linkage</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-1.5 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowFolderModal(false)}
                  className="text-xs font-semibold text-slate-500 px-3 py-1.5 hover:bg-slate-50 rounded"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  Confirm Group Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
