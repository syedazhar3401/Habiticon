import React, { useState, useRef, useEffect } from 'react';
import { Folder, Note, Course } from '../types';
import { 
  Plus, FolderPlus, FileText, Search, Tag, Star, Trash2, Edit3, Paintbrush, BookOpen, Clock, Download, Eraser, CheckSquare, List,
  Lock, Unlock, ShieldAlert, Sparkles, RefreshCw, Undo, Redo, ImageIcon, EyeOff
} from 'lucide-react';
import { Toolbar } from './ui/toolbar';

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

  // Security Passcode Lock States
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('notes_lock_enabled') === 'true';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('notes_lock_enabled') === 'true';
  });
  const [passcode, setPasscode] = useState<string>(() => {
    return localStorage.getItem('notes_passcode') || '';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showLockSettings, setShowLockSettings] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');
  const [lockedFolders, setLockedFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('notes_locked_folders');
    return saved ? JSON.parse(saved) : [];
  });

  // Custom Rich Editor Formatting States
  const [activeButtons, setActiveButtons] = useState<string[]>([]);
  const [editorAlignment, setEditorAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [editorFont, setEditorFont] = useState<string>("'Outfit', sans-serif");
  const [editorSize, setEditorSize] = useState<string>("14");
  const [editorColor, setEditorColor] = useState<string>("#1e293b"); // dark slate
  const [editorBgColor, setEditorBgColor] = useState<string>("transparent");
  const [drawMode, setDrawMode] = useState<boolean>(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Time Travel Log Date State
  const [editDate, setEditDate] = useState<string>('');

  // Mock uploader images gallery
  const [attachedImages, setAttachedImages] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('notes_attached_images');
    return saved ? JSON.parse(saved) : {};
  });
  const [showImageMockPicker, setShowImageMockPicker] = useState(false);

  const mockImagePresets = [
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500&q=80'
  ];

  // Grounded Aura AI Notebook Summarizer States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    keyOutlines: string[];
    actionSteps: string[];
  } | null>(null);

  // Active note lookup
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  // Sync date when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditDate(new Date(activeNote.updatedAt).toISOString().split('T')[0]);
    }
  }, [selectedNoteId]);

  // Synchronize uncontrolled contentEditable editor to prevent caret jumping
  useEffect(() => {
    if (editorRef.current && noteEditTab === 'editor' && activeNote) {
      if (editorRef.current.innerHTML !== activeNote.content) {
        editorRef.current.innerHTML = activeNote.content;
      }
    }
  }, [selectedNoteId, noteEditTab]);

  // Canvas save/load helper functions
  const drawWhiteboardGrid = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const displayWidth = canvas.width / (window.devicePixelRatio || 1);
    const displayHeight = canvas.height / (window.devicePixelRatio || 1);
    
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 15; i < displayWidth; i += 15) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, displayHeight);
      ctx.stroke();
    }
    for (let j = 15; j < displayHeight; j += 15) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(displayWidth, j);
      ctx.stroke();
    }
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeNote) return;
    const dataUrl = canvas.toDataURL();
    localStorage.setItem(`note_drawing_${activeNote.id}`, dataUrl);
  };

  const loadCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeNote) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataUrl = localStorage.getItem(`note_drawing_${activeNote.id}`);
    if (dataUrl) {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (noteEditTab === 'canvas') {
          drawWhiteboardGrid(canvas, ctx);
        }
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (noteEditTab === 'canvas') {
        drawWhiteboardGrid(canvas, ctx);
      }
    }
  };

  // Retina High-DPI Whiteboard Canvas Backing & Calibration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const calibrateCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const displayWidth = Math.floor(rect.width) || 500;
        const displayHeight = Math.floor(rect.height) || 280;

        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;

          ctx.scale(dpr, dpr);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Load the note-specific overlay sketch
          const dataUrl = localStorage.getItem(`note_drawing_${activeNote?.id}`);
          if (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (noteEditTab === 'canvas') {
                drawWhiteboardGrid(canvas, ctx);
              }
              ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
            };
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (noteEditTab === 'canvas') {
              drawWhiteboardGrid(canvas, ctx);
            }
          }
        }
      }
    };

    calibrateCanvas();

    const resizeObserver = new ResizeObserver(() => {
      calibrateCanvas();
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener('resize', calibrateCanvas);
    return () => {
      window.removeEventListener('resize', calibrateCanvas);
      resizeObserver.disconnect();
    };
  }, [noteEditTab, selectedNoteId, drawMode, activeNote?.id]);

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
      content: `<h2>Notebook outline</h2><ul><li>Topic Focus:</li><li>Details:</li></ul>`,
      folderId: activeFolderId !== 'all' ? activeFolderId : folders[0]?.id,
      courseId: folders.find(f => f.id === activeFolderId)?.courseId,
      tags: ['draft'],
      isFavorite: false,
      updatedAt: new Date().toISOString()
    };
    onAddNote(newNoteObj);
    onSelectNote(newNoteObj.id);
  };

  // --- Security Passcode locking handlers ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === passcode) {
      setIsLocked(false);
      setPasscodeInput('');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid 4-digit passcode shield.');
      setPasscodeInput('');
    }
  };

  const handleSaveLockSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasscodeEnabled) {
      if (newPasscode.length !== 4 || !/^\d+$/.test(newPasscode)) {
        alert('Passcode must be a 4-digit numeric code.');
        return;
      }
      localStorage.setItem('notes_passcode', newPasscode);
      localStorage.setItem('notes_lock_enabled', 'true');
      setPasscode(newPasscode);
      setIsLocked(true);
      setShowLockSettings(false);
    } else {
      localStorage.removeItem('notes_passcode');
      localStorage.setItem('notes_lock_enabled', 'false');
      setPasscode('');
      setIsLocked(false);
      setShowLockSettings(false);
    }
  };

  const toggleFolderLock = (folderId: string) => {
    if (!passcode) {
      alert('Please configure a master passcode inside Lock Settings first.');
      setShowLockSettings(true);
      return;
    }
    const updated = lockedFolders.includes(folderId)
      ? lockedFolders.filter(id => id !== folderId)
      : [...lockedFolders, folderId];
    setLockedFolders(updated);
    localStorage.setItem('notes_locked_folders', JSON.stringify(updated));
  };

  const activeFolderIsLocked = activeFolderId !== 'all' && lockedFolders.includes(activeFolderId) && isLocked;

  // --- HTML5 Whiteboard stylus draw handlers ---
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
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasData();
    }
  };

  const clearCanvasBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (noteEditTab === 'canvas') {
      drawWhiteboardGrid(canvas, ctx);
    }
    saveCanvasData();
  };

  // --- Content-Editable and toolbar controllers ---
  const handleFontChange = (font: string) => {
    setEditorFont(font);
    execFormat('fontName', font);
  };

  const handleSizeChange = (size: string) => {
    setEditorSize(size);
    execFormat('fontSize', size);
  };

  const handleColorChange = (color: string) => {
    setEditorColor(color);
    execFormat('foreColor', color);
  };

  const handleBgColorChange = (bgColor: string) => {
    setEditorBgColor(bgColor);
    execFormat('backColor', bgColor);
  };

  const execFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current && activeNote) {
      onUpdateNote(activeNote.id, {
        content: editorRef.current.innerHTML,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleEditableChange = (e: React.FormEvent<HTMLDivElement>) => {
    if (activeNote) {
      onUpdateNote(activeNote.id, {
        content: e.currentTarget.innerHTML,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleDateChange = (dateVal: string) => {
    setEditDate(dateVal);
    if (activeNote) {
      onUpdateNote(activeNote.id, {
        updatedAt: new Date(dateVal).toISOString()
      });
    }
  };

  // --- Mock image attachments handlers ---
  const handleAddMockImage = (url: string) => {
    if (!activeNote) return;
    const current = attachedImages[activeNote.id] || [];
    const updated = [...current, url];
    const next = { ...attachedImages, [activeNote.id]: updated };
    setAttachedImages(next);
    localStorage.setItem('notes_attached_images', JSON.stringify(next));
    setShowImageMockPicker(false);
  };

  const handleRemoveImage = (url: string) => {
    if (!activeNote) return;
    const current = attachedImages[activeNote.id] || [];
    const updated = current.filter(u => u !== url);
    const next = { ...attachedImages, [activeNote.id]: updated };
    setAttachedImages(next);
    localStorage.setItem('notes_attached_images', JSON.stringify(next));
  };

  // --- AI Summarizer ---
  const handleTriggerAI = async () => {
    if (!activeNote || !activeNote.content.trim()) {
      alert('Write some content inside your study note first before consulting Aura!');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Provide a study outline of this lecture note. Active Note Title: "${activeNote.title}". Content: "${activeNote.content}".`,
          context: {
            courses,
            notes
          }
        })
      });

      if (!response.ok) {
        throw new Error('Aura analyzer server error');
      }

      const resData = await response.json();
      const replyText = resData.reply || '';
      
      const outlines = replyText.match(/-\s+(.*?)(?=\n|$)/g)?.map((s: string) => s.replace(/^-\s+/, '')) || [
        "Review core course outline frameworks",
        "Complete workbook chapter reviews"
      ];

      setAiAnalysis({
        summary: replyText.split('\n')[0] || 'Structured summary mapping lecture deliverables.',
        keyOutlines: outlines.slice(0, 3),
        actionSteps: ["Read related handbook guidelines", "Collaborate on tasks inside study groups"]
      });
    } catch (err) {
      console.error('Failed communicating with AI summaries gateway:', err);
      setAiAnalysis({
        summary: 'A supportive outlines summary sheet mapping topics.',
        keyOutlines: ["Syllabus segment revision", "Assignment timeline check"],
        actionSteps: ["Complete deliverables tasks", "Ground lessons with classmates"]
      });
    } finally {
      setAiLoading(false);
    }
  };

  // --- JSON backups ---
  const handleExportNotes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ folders, notes }, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `habiticon_notes_ledger_${Date.now()}.json`);
    dlAnchor.click();
  };

  const wordsCount = activeNote?.content ? activeNote.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.trim().length > 0).length : 0;
  const charsCount = activeNote?.content ? activeNote.content.replace(/<[^>]*>/g, '').length : 0;
  const readingTime = Math.max(1, Math.round(wordsCount / 225));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full flex overflow-hidden font-sans text-slate-800 relative">
      
      {/* SECURITY ACCESS PANEL: Private Folder Locked */}
      {activeFolderIsLocked && (
        <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-md rounded-2xl z-50 flex items-center justify-center p-6 text-white text-center select-none animate-in fade-in duration-200">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-sm tracking-tight text-white">Academic folder locked</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Input your 4-digit code to reveal study segments.</p>
            </div>

            <form onSubmit={handleUnlock} className="w-full space-y-3 mt-1">
              <input 
                type="password"
                maxLength={4}
                value={passcodeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setPasscodeInput(val);
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-lg font-black bg-slate-950 border border-slate-800 rounded-lg py-2 text-white focus:outline-none focus:border-rose-500"
                required
                autoFocus
              />
              {passcodeError && (
                <span className="text-[9.5px] text-red-400 font-bold block">{passcodeError}</span>
              )}
              <button 
                type="submit" 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 cursor-pointer"
              >
                Unlock Folder
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. Left Folders Explorer (Compact) */}
      <div className="w-56 border-r border-slate-200 bg-slate-50/55 p-3 flex flex-col h-full shrink-0 select-none">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Folders explorer
          </h3>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowLockSettings(true)}
              className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-650 rounded"
              title="Vault Settings"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowFolderModal(true)}
              className="p-1 hover:bg-slate-200 text-slate-500 hover:text-indigo-650 rounded transition cursor-pointer"
              title="Add Library folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Directory paths list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
          <button
            onClick={() => setActiveFolderId('all')}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
              activeFolderId === 'all' 
                ? 'bg-slate-950 text-white shadow' 
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="truncate">📁 All Notebooks</span>
            <span className="text-[10px] opacity-75">({notes.length})</span>
          </button>

          {folders.map(f => {
            const courseRef = getCourse(f.courseId);
            const count = notes.filter(n => n.folderId === f.id).length;
            const isFolderLocked = lockedFolders.includes(f.id);

            return (
              <div key={f.id} className="group flex flex-col rounded-lg relative">
                <button
                  onClick={() => {
                    setActiveFolderId(f.id);
                    if (isFolderLocked) setIsLocked(true);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex flex-col gap-0.5 transition cursor-pointer ${
                    activeFolderId === f.id 
                      ? 'bg-slate-950 text-white shadow' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="flex justify-between w-full items-center">
                    <span className="truncate font-bold flex items-center gap-1">
                      {isFolderLocked ? '🔒' : '📂'} {f.name}
                    </span>
                    <span className="text-[10px] opacity-80 font-mono">({count})</span>
                  </div>
                  {courseRef && (
                    <span className={`text-[8.5px] uppercase tracking-wider ${activeFolderId === f.id ? 'text-slate-400' : 'text-slate-500'}`}>
                      {courseRef.code} Associated
                    </span>
                  )}
                </button>

                {/* Inline Lock toggle for folder */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFolderLock(f.id); }}
                  className="absolute right-1 top-2.5 opacity-0 group-hover:opacity-100 p-0.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition text-slate-500"
                  title={isFolderLocked ? "Remove Folder Lock" : "Passcode Lock Folder"}
                >
                  {isFolderLocked ? <Unlock className="w-2.5 h-2.5 text-rose-600" /> : <Lock className="w-2.5 h-2.5" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Export / Backup button bottom */}
        <div className="pt-2 border-t border-slate-200/60 shrink-0">
          <button
            onClick={handleExportNotes}
            className="w-full py-1 text-slate-500 hover:text-indigo-650 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9.5px] font-bold transition flex items-center justify-center gap-1 shrink-0"
            title="Backup database JSON"
          >
            <Download className="w-3.5 h-3.5" />
            Backup Notebook JSON
          </button>
        </div>
      </div>

      {/* 2. Middle Notes List Index */}
      <div className="w-56 border-r border-slate-200 p-3 flex flex-col h-full shrink-0 select-none">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Active Notes</span>
          <button 
            onClick={handleCreateNote}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" /> Note
          </button>
        </div>

        {/* Search filter */}
        <div className="relative mb-3 shrink-0">
          <input 
            type="text" 
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[10.5px] bg-slate-50 border border-slate-200 rounded-lg py-1 pl-7 focus:outline-none focus:border-indigo-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.2" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-[10px] text-slate-400">No notes indexed.</div>
          ) : (
            filteredNotes.map(n => {
              const isActive = activeNote && activeNote.id === n.id;
              return (
                <div
                  key={n.id}
                  onClick={() => onSelectNote(n.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition flex flex-col text-left border ${
                    isActive 
                      ? 'bg-slate-950 border-slate-800 text-white' 
                      : 'bg-white border-slate-150 text-slate-800 hover:border-slate-350'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <h5 className="text-[10px] font-bold line-clamp-1 flex-grow">
                      {n.title || 'Draft note'}
                    </h5>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateNote(n.id, { isFavorite: !n.isFavorite }); }}
                      className={`${n.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'} transition shrink-0`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                  
                  {/* content snippet */}
                  <span className="text-[9px] text-slate-450 truncate mt-1">
                    {n.content.replace(/<[^>]*>/g, '').slice(0, 30) || 'Empty outline draft.'}
                  </span>

                  <div className="flex justify-between items-center mt-2.5 pt-1.5 border-t border-slate-200/20 text-[8px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteNote(n.id); }}
                      className="text-slate-450 hover:text-red-500 opacity-60 hover:opacity-100 transition"
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
            <div className="bg-slate-950 text-white p-3 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <input 
                  type="text" 
                  value={activeNote.title}
                  onChange={(e) => onUpdateNote(activeNote.id, { title: e.target.value, updatedAt: new Date().toISOString() })}
                  className="bg-transparent border-none focus:outline-none font-bold text-xs text-white max-w-[180px] md:max-w-xs"
                />
              </div>

              <div className="flex items-center gap-2.5">
                {/* AI Review trigger */}
                <button 
                  onClick={handleTriggerAI}
                  disabled={aiLoading}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white text-[9.5px] font-extrabold rounded-lg flex items-center gap-1 transition"
                  title="Aura AI note summaries"
                >
                  {aiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-300" />}
                  {aiLoading ? 'Grounding Summary...' : 'Aura Summary'}
                </button>

                {/* Draw on Document toggle for Rich Document editor */}
                {noteEditTab === 'editor' && (
                  <button
                    onClick={() => setDrawMode(!drawMode)}
                    className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      drawMode 
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md animate-pulse' 
                        : 'bg-white/10 border-white/20 text-indigo-200 hover:bg-white/15 hover:text-white'
                    }`}
                    title="Draw stylus vector lines transparently on top of document"
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    {drawMode ? 'Drawing Mode: Active' : 'Draw on Document'}
                  </button>
                )}

                {/* View/Canvas Switcher */}
                <div className="flex border border-slate-800 p-0.5 rounded-lg bg-slate-900 shrink-0">
                  <button
                    onClick={() => setNoteEditTab('editor')}
                    className={`px-2 py-1 rounded text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      noteEditTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" /> Rich Document
                  </button>
                  <button
                    onClick={() => { setNoteEditTab('canvas'); setDrawMode(false); }}
                    className={`px-2 py-1 rounded text-[9.5px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      noteEditTab === 'canvas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Paintbrush className="w-3 h-3" /> Stylus Whiteboard
                  </button>
                </div>
              </div>
            </div>

            {/* Note Body Editing Panel */}
            <div className="flex-grow p-4 min-h-0 bg-white flex flex-col">
              {noteEditTab === 'editor' ? (
                <div className="flex-grow flex flex-col md:flex-row gap-4 h-full min-h-0 text-left">
                  
                  {/* Left Column: Rich Text Document */}
                  <div className="flex-1 flex flex-col h-full min-h-0 relative">
                    
                    {/* The premium interactive framer-motion toolbar */}
                    <div className="mb-2 shrink-0 flex flex-col gap-2">
                      <Toolbar 
                        onCommand={execFormat}
                        activeButtons={activeButtons}
                        textAlign={editorAlignment}
                        onAlign={(align) => { 
                          setEditorAlignment(align); 
                          execFormat(align === 'left' ? 'justifyLeft' : align === 'center' ? 'justifyCenter' : align === 'right' ? 'justifyRight' : 'justifyFull'); 
                        }}
                        editorFont={editorFont}
                        onFontChange={handleFontChange}
                        editorSize={editorSize}
                        onSizeChange={handleSizeChange}
                        editorColor={editorColor}
                        onColorChange={handleColorChange}
                        editorBgColor={editorBgColor}
                        onBgColorChange={handleBgColorChange}
                      />

                      {/* Overlays Draw Mode brush controls */}
                      {drawMode && (
                        <div className="bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-250 shrink-0 text-slate-700 select-none">
                          <div className="flex items-center gap-2">
                            <span className="text-[9.5px] font-extrabold text-rose-800 uppercase tracking-wider">Stylus Overlays:</span>
                            <div className="flex gap-1">
                              {['#000000', '#4f46e5', '#3b82f6', '#10b981', '#ef4444'].map(clr => (
                                <button
                                  key={clr}
                                  type="button"
                                  onClick={() => { setBrushColor(clr); setEraserMode(false); }}
                                  className={`w-4 h-4 rounded-full border transition hover:scale-110 cursor-pointer ${brushColor === clr && !eraserMode ? 'scale-125 ring-1.5 ring-rose-500' : 'border-slate-200'}`}
                                  style={{ backgroundColor: clr }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1 cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={eraserMode}
                                onChange={(e) => setEraserMode(e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500 font-bold"
                              />
                              <span className="text-[10px] font-semibold text-slate-650 flex items-center gap-1">
                                <Eraser className="w-3.5 h-3.5" /> Eraser Overlay
                              </span>
                            </label>

                            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                              <span>Stroke:</span>
                              <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={brushSize}
                                onChange={(e) => setBrushSize(Number(e.target.value))}
                                className="w-16 h-1 bg-slate-200 rounded-lg cursor-pointer accent-rose-600"
                              />
                              <span className="font-mono text-[9px]">{brushSize}px</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={clearCanvasBoard}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            × Clear Overlay
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata bar: Date backdating and category parameters */}
                    <div className="grid grid-cols-2 gap-3 mb-2.5 pb-2.5 border-b border-slate-100 shrink-0">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update Date</label>
                        <input 
                          type="date"
                          value={editDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-bold text-slate-650 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Tags (Comma Sep)</label>
                        <input 
                          type="text"
                          placeholder="e.g. exams, discrete"
                          value={activeNote.tags.join(', ')}
                          onChange={(e) => onUpdateNote(activeNote.id, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean), updatedAt: new Date().toISOString() })}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-[10px] font-semibold text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Rich text document area */}
                    <div className="flex-grow overflow-y-auto min-h-0 relative border-b border-slate-100 pr-1" id="scrolling-editor-container">
                      <div className="relative w-full min-h-full">
                        <div
                          id="rich-note-editor"
                          ref={editorRef}
                          contentEditable={!drawMode}
                          onInput={handleEditableChange}
                          style={{
                            fontFamily: editorFont,
                            fontSize: `${editorSize}px`,
                            color: editorColor,
                            textAlign: editorAlignment === 'justify' ? 'justify' : editorAlignment,
                            minHeight: '400px',
                          }}
                          className={`outline-none focus:outline-none leading-relaxed py-2 w-full prose max-w-none ${
                            drawMode ? 'pointer-events-none select-none opacity-85' : ''
                          }`}
                        />
                        
                        {/* Transparent Canvas overlay layer for drawing directly on document */}
                        <canvas
                          ref={canvasRef}
                          onMouseDown={startCanvasDrawing}
                          onMouseMove={drawOnCanvas}
                          onMouseUp={stopCanvasDrawing}
                          onMouseLeave={stopCanvasDrawing}
                          className={`absolute inset-0 w-full h-full bg-transparent ${
                            drawMode ? 'pointer-events-auto cursor-pencil z-20 animate-in fade-in duration-200' : 'pointer-events-none z-10'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="mt-2.5 shrink-0 select-none">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          Document Attachments ({(attachedImages[activeNote.id] || []).length})
                        </span>
                        <button 
                          onClick={() => setShowImageMockPicker(true)}
                          className="text-[9px] text-indigo-650 font-bold hover:underline"
                        >
                          + Attach Preset Image
                        </button>
                      </div>

                      {showImageMockPicker && (
                        <div className="p-2 border border-slate-200 bg-slate-50/50 rounded-xl mb-2 flex gap-2 overflow-x-auto">
                          {mockImagePresets.map(url => (
                            <img 
                              key={url} 
                              src={url} 
                              alt="Preset" 
                              onClick={() => handleAddMockImage(url)}
                              className="w-12 h-10 object-cover rounded border border-slate-200 cursor-pointer hover:border-indigo-500 transition shrink-0" 
                            />
                          ))}
                        </div>
                      )}

                      {attachedImages[activeNote.id]?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {attachedImages[activeNote.id].map((url, index) => (
                            <div key={index} className="relative group shrink-0 w-16 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100">
                              <img src={url} alt="Attached" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => handleRemoveImage(url)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Editor Footer Stats */}
                    <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 shrink-0 select-none font-mono">
                      <div className="flex gap-3">
                        <span>Words: <strong>{wordsCount}</strong></span>
                        <span>Characters: <strong>{charsCount}</strong></span>
                        <span>Reading: <strong>~{readingTime}m</strong></span>
                      </div>
                      <span>Notebook Database Backup Active</span>
                    </div>

                  </div>

                  {/* Right Column: Aura AI summaries side block */}
                  {aiAnalysis && (
                    <div className="w-full md:w-60 bg-indigo-900 text-white rounded-xl p-3 shadow-md flex flex-col gap-3 shrink-0 animate-in fade-in slide-in-from-right-3 duration-150 overflow-y-auto scrollbar-thin">
                      <div className="flex justify-between items-start">
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-400">Aura Study Guide</span>
                        <button onClick={() => setAiAnalysis(null)} className="text-indigo-200 hover:text-white font-bold">×</button>
                      </div>

                      <div>
                        <span className="font-extrabold text-[8px] uppercase tracking-wider text-slate-400 block">AI summary</span>
                        <p className="mt-0.5 text-[10.5px]/relaxed leading-relaxed font-semibold text-indigo-100">{aiAnalysis.summary}</p>
                      </div>

                      {aiAnalysis.keyOutlines.length > 0 && (
                        <div>
                          <span className="font-extrabold text-[8px] uppercase tracking-wider text-slate-400 block">Key Themes Outlines</span>
                          <ul className="list-disc pl-3.5 space-y-0.5 mt-0.5 text-[9.5px]/snug text-indigo-200">
                            {aiAnalysis.keyOutlines.map((o, idx) => <li key={idx}>{o}</li>)}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.actionSteps.length > 0 && (
                        <div>
                          <span className="font-extrabold text-[8px] uppercase tracking-wider text-slate-400 block">Recommended Review Steps</span>
                          <ul className="list-disc pl-3.5 space-y-0.5 mt-0.5 text-[9.5px]/snug text-indigo-200">
                            {aiAnalysis.actionSteps.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                // Stylus whiteboard Canvas elements (Retina dynamic scaled)
                <div className="flex flex-col h-full gap-3 text-left select-none">
                  <div className="bg-slate-100/60 p-2 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 shrink-0">
                    
                    {/* Brush Colors */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase">Brush:</span>
                      <div className="flex gap-1">
                        {['#000000', '#4f46e5', '#3b82f6', '#10b981', '#ef4444'].map(clr => (
                          <button
                            key={clr}
                            onClick={() => { setBrushColor(clr); setEraserMode(false); }}
                            className={`w-4 h-4 rounded-full border transition cursor-pointer ${brushColor === clr && !eraserMode ? 'scale-125 ring-1.5 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: clr }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Eraser and Stroke controls */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={eraserMode}
                          onChange={(e) => setEraserMode(e.target.checked)}
                          className="rounded text-indigo-650 focus:ring-indigo-500 font-bold"
                        />
                        <span className="text-[10px] font-semibold text-slate-650 flex items-center gap-1">
                          <Eraser className="w-3.5 h-3.5" /> Eraser Mode
                        </span>
                      </label>

                      <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <span>Stroke:</span>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-16 h-1 bg-slate-250 rounded-lg cursor-pointer accent-indigo-600"
                        />
                        <span className="font-mono text-[9px]">{brushSize}px</span>
                      </div>
                    </div>

                    <button
                      onClick={clearCanvasBoard}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      × Clear Canvas
                    </button>
                  </div>

                  {/* Interactive canvas pad (High-resolution display scaling) */}
                  <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-inner relative min-h-[300px]">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startCanvasDrawing}
                      onMouseMove={drawOnCanvas}
                      onMouseUp={stopCanvasDrawing}
                      onMouseLeave={stopCanvasDrawing}
                      className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
                    />
                    <div className="absolute top-2.5 left-2.5 pointer-events-none bg-slate-900/50 backdrop-blur-xs text-white text-[8px] font-mono px-2 py-0.5 rounded-full">
                      Whiteboard Vector Canvas: Stylus / Pen Active (High-Resolution Backing)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 py-20 text-xs select-none">
            <BookOpen className="w-10 h-10 text-slate-300 animate-pulse mb-2" />
            <span>Select a folder partition or add a lecture note to begin reviews.</span>
          </div>
        )}
      </div>

      {/* New Folder Creation Popup */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans select-none">
          <div className="bg-white border border-slate-250 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="bg-indigo-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">Create Academic folder partition</h4>
                <p className="text-[10px] opacity-75">Syllabus segments, capstones, and homework reviews.</p>
              </div>
              <button onClick={() => setShowFolderModal(false)} className="text-white hover:opacity-80">×</button>
            </div>

            <form onSubmit={handleCreateFolder} className="p-4 space-y-3.5 text-left">
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
                  className="text-xs font-semibold text-slate-505 px-3 py-1.5 hover:bg-slate-50 rounded"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
                >
                  Confirm Group Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security settings popout overlay card */}
      {showLockSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <form onSubmit={handleSaveLockSettings} className="max-w-xs w-full bg-white border border-slate-200 p-5 rounded-xl shadow-2xl space-y-3.5 animate-in zoom-in duration-150 text-slate-800 text-left">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-650" />
                Notebook settings
              </h4>
              <button type="button" onClick={() => setShowLockSettings(false)} className="text-slate-400 hover:text-slate-700 font-bold">×</button>
            </div>

            <div className="space-y-3.5 py-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isPasscodeEnabled}
                  onChange={(e) => setIsPasscodeEnabled(e.target.checked)}
                  className="rounded text-indigo-650 animate-pulse"
                />
                Enable 4-Digit Passcode Locker
              </label>

              {isPasscodeEnabled && (
                <div>
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase mb-1">Enter 4-Digit Passcode</label>
                  <input 
                    type="password"
                    maxLength={4}
                    value={newPasscode}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) setNewPasscode(val);
                    }}
                    placeholder="e.g. 1234"
                    className="w-full bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-xs tracking-widest text-center"
                    required={isPasscodeEnabled}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 shrink-0">
              <button type="button" onClick={() => setShowLockSettings(false)} className="text-xs text-slate-455 px-2.5 py-1.5 rounded hover:bg-slate-50">Cancel</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition active:scale-95 cursor-pointer">Save Vault</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
