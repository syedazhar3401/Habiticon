/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  VisionItem, VisionMilestone, VisionCategory, VisionStatus,
  DashboardVisionPin, Task, JournalEntry
} from '../types';
import {
  Plus, X, Edit2, Trash2, Archive, Copy, Pin, PinOff, Target, Image as ImageIcon,
  ChevronDown, ChevronUp, Calendar, Flag, Tag, CheckCircle2, Circle, ArrowRight,
  LayoutGrid, Columns, GalleryHorizontal, Clock, TrendingUp, Filter,
  BarChart3, Award, Sparkles, Upload, BookOpen, CheckSquare, Star,
  AlignLeft, ChevronLeft, ChevronRight, MoreHorizontal
} from 'lucide-react';

// ─── Category Helpers ──────────────────────────────────────────

const CATEGORY_META: Record<VisionCategory, { label: string; color: string; bg: string; dot: string }> = {
  academic:       { label: 'Academic',         color: 'text-indigo-700',  bg: 'bg-indigo-100',   dot: 'bg-indigo-500' },
  career:         { label: 'Career',           color: 'text-violet-700',  bg: 'bg-violet-100',   dot: 'bg-violet-500' },
  personal_growth:{ label: 'Personal Growth',  color: 'text-rose-700',    bg: 'bg-rose-100',     dot: 'bg-rose-500' },
  health_wellness:{ label: 'Health',           color: 'text-emerald-700', bg: 'bg-emerald-100',  dot: 'bg-emerald-500' },
  financial:      { label: 'Financial',        color: 'text-amber-700',   bg: 'bg-amber-100',    dot: 'bg-amber-500' },
  travel:         { label: 'Travel',           color: 'text-sky-700',     bg: 'bg-sky-100',      dot: 'bg-sky-500' },
  creativity:     { label: 'Creativity',       color: 'text-fuchsia-700', bg: 'bg-fuchsia-100',  dot: 'bg-fuchsia-500' },
  relationships:  { label: 'Relationships',    color: 'text-pink-700',    bg: 'bg-pink-100',     dot: 'bg-pink-500' },
  custom:         { label: 'Custom',           color: 'text-slate-700',   bg: 'bg-slate-100',    dot: 'bg-slate-500' },
};

const STATUS_META: Record<VisionStatus, { label: string; color: string; bg: string }> = {
  dreaming:    { label: 'Dreaming',     color: 'text-sky-700',    bg: 'bg-sky-100' },
  planning:    { label: 'Planning',     color: 'text-amber-700',  bg: 'bg-amber-100' },
  in_progress: { label: 'In Progress',  color: 'text-violet-700', bg: 'bg-violet-100' },
  achieved:    { label: 'Achieved',     color: 'text-emerald-700',bg: 'bg-emerald-100' },
};

const CARD_BG_COLORS = [
  'from-violet-500 to-indigo-700',
  'from-rose-500 to-pink-700',
  'from-sky-500 to-cyan-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-700',
  'from-fuchsia-500 to-purple-700',
];

// ─── Image Compression Helper ──────────────────────────────────

function compressImage(file: File, maxW = 800, maxH = 600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
        if (h > maxH) { w = Math.round((w * maxH) / h); h = maxH; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Props ─────────────────────────────────────────────────────

interface VisionBoardModuleProps {
  visionItems: VisionItem[];
  dashboardPins: DashboardVisionPin[];
  tasks: Task[];
  journalEntries: JournalEntry[];
  onUpdateVisions: (items: VisionItem[]) => void;
  onUpdatePins: (pins: DashboardVisionPin[]) => void;
  onNavigate: (tab: any) => void;
}

// ─── Blank Vision Template ─────────────────────────────────────

const blankVision = (): Omit<VisionItem, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  description: '',
  motivationStatement: '',
  imageDataUrl: '',
  category: 'personal_growth',
  status: 'dreaming',
  priority: 'medium',
  progress: undefined,
  targetDate: '',
  tags: [],
  milestones: [],
  isPinned: false,
  isArchived: false,
  linkedTaskIds: [],
  linkedJournalIds: [],
});

// ─── Vision Card Component ──────────────────────────────────────

function VisionCard({
  vision, compact = false,
  onEdit, onDelete, onDuplicate, onArchive, onTogglePin,
  onOpen, colorIdx
}: {
  key?: React.Key;
  vision: VisionItem; compact?: boolean;
  onEdit: () => void; onDelete: () => void; onDuplicate: () => void;
  onArchive: () => void; onTogglePin: () => void; onOpen: () => void;
  colorIdx: number;
}) {
  const catMeta = CATEGORY_META[vision.category];
  const bgFallback = CARD_BG_COLORS[colorIdx % CARD_BG_COLORS.length];

  return (
    <div
      className={`relative ${compact ? '' : 'aspect-[3/4]'} rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]`}
      style={{ minHeight: compact ? 200 : undefined }}
      onClick={onOpen}
    >
      {/* Background image or gradient */}
      {vision.imageDataUrl ? (
        <img src={vision.imageDataUrl} alt={vision.title} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgFallback}`} />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-transparent" />

      {/* Top row badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
        <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full ${catMeta.dot} bg-opacity-90 backdrop-blur-sm`}>
          {catMeta.label}
        </span>
        <div className="flex items-center gap-1">
          {vision.isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow" />}
          {vision.isArchived && <Award className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 drop-shadow" />}
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h4 className="text-white font-bold text-xs leading-snug line-clamp-2 drop-shadow">{vision.title}</h4>
        {!compact && vision.description && (
          <p className="text-white/65 text-[10px] mt-0.5 line-clamp-2 leading-relaxed">{vision.description}</p>
        )}
        <div className="flex items-center justify-between mt-1.5 gap-2">
          {vision.targetDate && (
            <span className="text-white/55 text-[9px] font-mono flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(vision.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          )}
          {vision.progress !== undefined && (
            <span className="text-white/65 text-[9px] font-bold ml-auto">{vision.progress}%</span>
          )}
        </div>
        {vision.progress !== undefined && (
          <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden mt-1">
            <div
              className="h-full rounded-full bg-violet-400 transition-all"
              style={{ width: `${vision.progress}%`, boxShadow: '0 0 6px rgba(167,139,250,0.8)' }}
            />
          </div>
        )}
      </div>

      {/* Hover action row */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onEdit} className="text-white/80 hover:text-white transition" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={onDuplicate} className="text-white/80 hover:text-white transition" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
        <button onClick={onTogglePin} className="text-white/80 hover:text-amber-400 transition" title={vision.isPinned ? 'Unpin' : 'Pin to dashboard'}>
          {vision.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onArchive} className="text-white/80 hover:text-emerald-400 transition" title={vision.isArchived ? 'Unarchive' : 'Archive'}>
          <Archive className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete} className="text-white/80 hover:text-rose-400 transition" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

// ─── Main Module ────────────────────────────────────────────────

export default function VisionBoardModule({
  visionItems, dashboardPins, tasks, journalEntries,
  onUpdateVisions, onUpdatePins, onNavigate
}: VisionBoardModuleProps) {

  const [activeView, setActiveView] = useState<'grid' | 'kanban' | 'gallery' | 'timeline'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // 'all' | 'active' | 'archived'
  const [sortBy, setSortBy] = useState<'newest' | 'pinned' | 'progress' | 'target'>('pinned');
  const [showModal, setShowModal] = useState(false);
  const [editingVision, setEditingVision] = useState<VisionItem | null>(null);
  const [detailVisionId, setDetailVisionId] = useState<string | null>(null);

  // ─── Form State ──────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMotivation, setFormMotivation] = useState('');
  const [formCategory, setFormCategory] = useState<VisionCategory>('personal_growth');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formStatus, setFormStatus] = useState<VisionStatus>('dreaming');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formImageDataUrl, setFormImageDataUrl] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formEnableProgress, setFormEnableProgress] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formTagInput, setFormTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formMilestones, setFormMilestones] = useState<VisionMilestone[]>([]);
  const [formImageLoading, setFormImageLoading] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);

  // ─── Computed Visions ─────────────────────────────────────────

  const filteredVisions = visionItems
    .filter(v => {
      if (filterStatus === 'archived') return v.isArchived;
      if (filterStatus === 'active') return !v.isArchived;
      return true;
    })
    .filter(v => filterCategory === 'all' || v.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      if (sortBy === 'progress') {
        return (b.progress ?? -1) - (a.progress ?? -1);
      }
      if (sortBy === 'target') {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return a.targetDate.localeCompare(b.targetDate);
      }
      return b.updatedAt.localeCompare(a.updatedAt); // newest
    });

  const activeVisions = visionItems.filter(v => !v.isArchived);
  const achievedVisions = visionItems.filter(v => v.isArchived);
  const avgProgress = activeVisions.filter(v => v.progress !== undefined).length > 0
    ? Math.round(activeVisions.filter(v => v.progress !== undefined).reduce((s, v) => s + (v.progress ?? 0), 0) / activeVisions.filter(v => v.progress !== undefined).length)
    : null;

  // ─── Image Handlers ───────────────────────────────────────────

  const handleFileChange = async (file: File) => {
    setFormImageLoading(true);
    try {
      const dataUrl = await compressImage(file);
      setFormImageDataUrl(dataUrl);
    } catch { /* ignore */ }
    setFormImageLoading(false);
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imgItem = items.find(i => i.type.startsWith('image/'));
    if (imgItem) {
      e.preventDefault();
      const file = imgItem.getAsFile();
      if (file) await handleFileChange(file);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      document.addEventListener('paste', handlePaste);
      return () => document.removeEventListener('paste', handlePaste);
    }
  }, [showModal, handlePaste]);

  // ─── Open modal helpers ───────────────────────────────────────

  const openAdd = () => {
    setEditingVision(null);
    setFormTitle(''); setFormDesc(''); setFormMotivation('');
    setFormCategory('personal_growth'); setFormCustomCategory('');
    setFormStatus('dreaming'); setFormPriority('medium');
    setFormImageDataUrl(''); setFormTargetDate('');
    setFormEnableProgress(false); setFormProgress(0);
    setFormIsPinned(false); setFormTags([]); setFormTagInput('');
    setFormMilestones([]); setShowMilestones(false);
    setShowModal(true);
  };

  const openEdit = (v: VisionItem) => {
    setEditingVision(v);
    setFormTitle(v.title); setFormDesc(v.description); setFormMotivation(v.motivationStatement ?? '');
    setFormCategory(v.category); setFormCustomCategory(v.customCategory ?? '');
    setFormStatus(v.status); setFormPriority(v.priority);
    setFormImageDataUrl(v.imageDataUrl); setFormTargetDate(v.targetDate ?? '');
    setFormEnableProgress(v.progress !== undefined); setFormProgress(v.progress ?? 0);
    setFormIsPinned(v.isPinned); setFormTags([...v.tags]);
    setFormMilestones(v.milestones.map(m => ({ ...m }))); setShowMilestones(v.milestones.length > 0);
    setShowModal(true);
  };

  // ─── Save / CRUD ──────────────────────────────────────────────

  const handleSave = () => {
    if (!formTitle.trim() || !formImageDataUrl) return;
    const now = new Date().toISOString();
    if (editingVision) {
      const updated: VisionItem = {
        ...editingVision,
        title: formTitle.trim(),
        description: formDesc.trim(),
        motivationStatement: formMotivation.trim(),
        category: formCategory,
        customCategory: formCategory === 'custom' ? formCustomCategory : undefined,
        status: formStatus,
        priority: formPriority,
        imageDataUrl: formImageDataUrl,
        targetDate: formTargetDate || undefined,
        progress: formEnableProgress ? formProgress : undefined,
        isPinned: formIsPinned,
        tags: formTags,
        milestones: formMilestones,
        updatedAt: now,
      };
      onUpdateVisions(visionItems.map(v => v.id === editingVision.id ? updated : v));
    } else {
      const newVision: VisionItem = {
        id: `vision-${Date.now()}`,
        title: formTitle.trim(),
        description: formDesc.trim(),
        motivationStatement: formMotivation.trim(),
        category: formCategory,
        customCategory: formCategory === 'custom' ? formCustomCategory : undefined,
        status: formStatus,
        priority: formPriority,
        imageDataUrl: formImageDataUrl,
        targetDate: formTargetDate || undefined,
        progress: formEnableProgress ? formProgress : undefined,
        isPinned: formIsPinned,
        isArchived: false,
        tags: formTags,
        milestones: formMilestones,
        linkedTaskIds: [],
        linkedJournalIds: [],
        createdAt: now,
        updatedAt: now,
      };
      onUpdateVisions([newVision, ...visionItems]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Permanently delete this vision?')) return;
    onUpdateVisions(visionItems.filter(v => v.id !== id));
    onUpdatePins(dashboardPins.filter(p => p.visionId !== id));
    if (detailVisionId === id) setDetailVisionId(null);
  };

  const handleDuplicate = (vision: VisionItem) => {
    const now = new Date().toISOString();
    const copy: VisionItem = {
      ...vision,
      id: `vision-${Date.now()}`,
      title: vision.title + ' (Copy)',
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      milestones: vision.milestones.map(m => ({ ...m, id: `ms-${Date.now()}-${Math.random()}` })),
    };
    onUpdateVisions([copy, ...visionItems]);
  };

  const handleArchive = (vision: VisionItem) => {
    onUpdateVisions(visionItems.map(v => v.id === vision.id ? { ...v, isArchived: !v.isArchived, status: !v.isArchived ? 'achieved' : 'in_progress', updatedAt: new Date().toISOString() } : v));
  };

  const handleTogglePin = (vision: VisionItem) => {
    const updated = visionItems.map(v => v.id === vision.id ? { ...v, isPinned: !v.isPinned, updatedAt: new Date().toISOString() } : v);
    onUpdateVisions(updated);
    if (!vision.isPinned) {
      const maxOrder = dashboardPins.length > 0 ? Math.max(...dashboardPins.map(p => p.displayOrder)) : -1;
      onUpdatePins([...dashboardPins, { visionId: vision.id, displayOrder: maxOrder + 1 }]);
    } else {
      onUpdatePins(dashboardPins.filter(p => p.visionId !== vision.id));
    }
  };

  const handleToggleMilestone = (visionId: string, milestoneId: string) => {
    onUpdateVisions(visionItems.map(v => {
      if (v.id !== visionId) return v;
      return {
        ...v,
        milestones: v.milestones.map(m =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted, completedAt: !m.isCompleted ? new Date().toISOString() : undefined } : m
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  // Kanban drag
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const handleKanbanDrop = (status: VisionStatus, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingId) return;
    onUpdateVisions(visionItems.map(v => v.id === draggingId ? { ...v, status, updatedAt: new Date().toISOString() } : v));
    setDraggingId(null);
  };

  // Tag helpers
  const addTag = () => {
    const t = formTagInput.trim();
    if (t && !formTags.includes(t)) setFormTags(prev => [...prev, t]);
    setFormTagInput('');
  };

  // Milestone helpers
  const addMilestone = () => {
    const ms: VisionMilestone = {
      id: `ms-${Date.now()}`,
      visionId: editingVision?.id ?? 'new',
      title: '',
      isCompleted: false,
    };
    setFormMilestones(prev => [...prev, ms]);
  };

  // ─── Render helpers ───────────────────────────────────────────

  const detailVision = visionItems.find(v => v.id === detailVisionId) ?? null;

  const KANBAN_COLS: { status: VisionStatus; label: string; color: string; headerBg: string }[] = [
    { status: 'dreaming',    label: 'Dreaming',     color: 'border-sky-200',     headerBg: 'bg-sky-50' },
    { status: 'planning',    label: 'Planning',     color: 'border-amber-200',   headerBg: 'bg-amber-50' },
    { status: 'in_progress', label: 'In Progress',  color: 'border-violet-200',  headerBg: 'bg-violet-50' },
    { status: 'achieved',    label: 'Achieved',     color: 'border-emerald-200', headerBg: 'bg-emerald-50' },
  ];

  const upcomingMilestones = visionItems
    .flatMap(v => v.milestones.map(m => ({ ...m, visionTitle: v.title })))
    .filter(m => !m.isCompleted && m.dueDate)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5);

  // ─── JSX ─────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col font-sans text-slate-800 bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-5 py-3.5 shrink-0">

        {/* Top row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </span>
              My Vision Board
            </h2>
            <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500 font-semibold">
              <span>{activeVisions.length} Active</span>
              {achievedVisions.length > 0 && <><span className="text-slate-300">·</span><span className="text-emerald-600">{achievedVisions.length} Achieved</span></>}
              {avgProgress !== null && <><span className="text-slate-300">·</span><span className="text-violet-600">{avgProgress}% avg progress</span></>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View switcher */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              {([['grid', LayoutGrid], ['kanban', Columns], ['gallery', GalleryHorizontal], ['timeline', Clock]] as const).map(([v, Icon]) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-all ${activeView === v ? 'bg-white shadow text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title={v.charAt(0).toUpperCase() + v.slice(1)}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-[10.5px] font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option value="pinned">Pinned First</option>
              <option value="newest">Most Recent</option>
              <option value="progress">Most Progress</option>
              <option value="target">Target Date</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-[10.5px] font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400"
            >
              <option value="all">All Visions</option>
              <option value="active">Active Only</option>
              <option value="archived">Achieved</option>
            </select>

            {/* Add button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Vision
            </button>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            onClick={() => setFilterCategory('all')}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${filterCategory === 'all' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_META) as VisionCategory[]).map(cat => {
            const m = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${filterCategory === cat ? `${m.bg} ${m.color}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Main view */}
        <div className={`flex-1 overflow-y-auto p-5 ${detailVisionId ? 'xl:pr-2' : ''}`}>

          {/* Empty state */}
          {filteredVisions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-600">
                  {filterCategory === 'all' && filterStatus === 'all' ? 'Your vision board is empty' : 'No visions match this filter'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  {filterCategory === 'all' && filterStatus === 'all'
                    ? 'Start adding your dreams, goals, and aspirations. Visualize your future.'
                    : 'Try a different category or status filter.'}
                </p>
              </div>
              {filterCategory === 'all' && filterStatus === 'all' && (
                <button
                  onClick={openAdd}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded-xl shadow transition active:scale-95 cursor-pointer"
                >
                  + Add Your First Vision
                </button>
              )}
            </div>
          )}

          {/* ── Grid View ── */}
          {activeView === 'grid' && filteredVisions.length > 0 && (
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {filteredVisions.map((vision, idx) => (
                <VisionCard
                  key={vision.id}
                  vision={vision}
                  colorIdx={idx}
                  onOpen={() => { setDetailVisionId(prev => prev === vision.id ? null : vision.id); }}
                  onEdit={() => openEdit(vision)}
                  onDelete={() => handleDelete(vision.id)}
                  onDuplicate={() => handleDuplicate(vision)}
                  onArchive={() => handleArchive(vision)}
                  onTogglePin={() => handleTogglePin(vision)}
                />
              ))}
            </div>
          )}

          {/* ── Kanban View ── */}
          {activeView === 'kanban' && filteredVisions.length > 0 && (
            <div className="grid grid-cols-4 gap-4 h-full min-h-[480px]">
              {KANBAN_COLS.map(col => {
                const colVisions = filteredVisions.filter(v => v.status === col.status);
                return (
                  <div
                    key={col.status}
                    className={`flex flex-col border-2 ${col.color} rounded-2xl overflow-hidden`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleKanbanDrop(col.status, e)}
                  >
                    {/* Column header */}
                    <div className={`${col.headerBg} px-3 py-2.5 flex items-center justify-between border-b ${col.color}`}>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{col.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-white/60 rounded-full px-1.5">{colVisions.length}</span>
                    </div>
                    {/* Cards */}
                    <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto">
                      {colVisions.map((vision, idx) => (
                        <div
                          key={vision.id}
                          draggable
                          onDragStart={() => setDraggingId(vision.id)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <VisionCard
                            vision={vision}
                            compact
                            colorIdx={idx}
                            onOpen={() => { setDetailVisionId(prev => prev === vision.id ? null : vision.id); }}
                            onEdit={() => openEdit(vision)}
                            onDelete={() => handleDelete(vision.id)}
                            onDuplicate={() => handleDuplicate(vision)}
                            onArchive={() => handleArchive(vision)}
                            onTogglePin={() => handleTogglePin(vision)}
                          />
                        </div>
                      ))}
                      {colVisions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl text-[10px] text-slate-400 font-medium">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Gallery View ── */}
          {activeView === 'gallery' && filteredVisions.length > 0 && (
            <div style={{ columnCount: 3, columnGap: '1.25rem' }}>
              {filteredVisions.map((vision, idx) => (
                <div key={vision.id} style={{ breakInside: 'avoid', marginBottom: '1.25rem' }}>
                  <VisionCard
                    vision={vision}
                    colorIdx={idx}
                    onOpen={() => setDetailVisionId(prev => prev === vision.id ? null : vision.id)}
                    onEdit={() => openEdit(vision)}
                    onDelete={() => handleDelete(vision.id)}
                    onDuplicate={() => handleDuplicate(vision)}
                    onArchive={() => handleArchive(vision)}
                    onTogglePin={() => handleTogglePin(vision)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ── Timeline View ── */}
          {activeView === 'timeline' && filteredVisions.length > 0 && (() => {
            const withDate = filteredVisions.filter(v => v.targetDate).sort((a, b) => (a.targetDate ?? '').localeCompare(b.targetDate ?? ''));
            const noDate = filteredVisions.filter(v => !v.targetDate);
            const grouped: Record<string, VisionItem[]> = {};
            withDate.forEach(v => {
              const d = new Date(v.targetDate! + 'T00:00:00');
              const key = `${d.getFullYear()} Q${Math.ceil((d.getMonth() + 1) / 3)}`;
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(v);
            });
            return (
              <div className="space-y-8 max-w-3xl">
                {Object.entries(grouped).map(([quarter, visions]) => (
                  <div key={quarter}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                      <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{quarter}</h3>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="pl-5 space-y-3">
                      {visions.map(vision => {
                        const catMeta = CATEGORY_META[vision.category];
                        return (
                          <div
                            key={vision.id}
                            onClick={() => setDetailVisionId(prev => prev === vision.id ? null : vision.id)}
                            className={`flex items-center gap-4 p-3.5 bg-white border rounded-xl cursor-pointer hover:border-violet-300 hover:shadow-md transition-all ${detailVisionId === vision.id ? 'border-violet-300 shadow-md ring-1 ring-violet-200' : 'border-slate-200'}`}
                          >
                            {vision.imageDataUrl
                              ? <img src={vision.imageDataUrl} alt={vision.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                              : <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${CARD_BG_COLORS[visionItems.indexOf(vision) % CARD_BG_COLORS.length]} shrink-0`} />
                            }
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color}`}>{catMeta.label}</span>
                                {vision.isPinned && <Pin className="w-3 h-3 text-amber-400 fill-amber-400" />}
                              </div>
                              <p className="text-xs font-bold text-slate-800 truncate">{vision.title}</p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{vision.description}</p>
                            </div>
                            {vision.progress !== undefined && (
                              <div className="text-right shrink-0">
                                <p className="text-xs font-black text-violet-600">{vision.progress}%</p>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${vision.progress}%` }} />
                                </div>
                              </div>
                            )}
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">
                              {new Date(vision.targetDate! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {noDate.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">No Target Date</h3>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="pl-5 space-y-3">
                      {noDate.map(vision => {
                        const catMeta = CATEGORY_META[vision.category];
                        return (
                          <div
                            key={vision.id}
                            onClick={() => setDetailVisionId(prev => prev === vision.id ? null : vision.id)}
                            className="flex items-center gap-4 p-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-violet-300 hover:shadow-md transition-all"
                          >
                            {vision.imageDataUrl
                              ? <img src={vision.imageDataUrl} alt={vision.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                              : <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${CARD_BG_COLORS[visionItems.indexOf(vision) % CARD_BG_COLORS.length]} shrink-0`} />
                            }
                            <div className="flex-1 min-w-0">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${catMeta.bg} ${catMeta.color}`}>{catMeta.label}</span>
                              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{vision.title}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Detail Drawer ── */}
        {detailVision && (
          <div className="w-[400px] shrink-0 border-l border-slate-200 bg-white overflow-y-auto flex flex-col">
            {/* Drawer header */}
            <div className="relative">
              {detailVision.imageDataUrl
                ? <img src={detailVision.imageDataUrl} alt={detailVision.title} className="w-full h-48 object-cover" />
                : <div className={`w-full h-48 bg-gradient-to-br ${CARD_BG_COLORS[visionItems.indexOf(detailVision) % CARD_BG_COLORS.length]}`} />
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setDetailVisionId(null)}
                className="absolute top-3 right-3 w-7 h-7 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_META[detailVision.category].dot} text-white`}>
                      {CATEGORY_META[detailVision.category].label}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_META[detailVision.status].bg} ${STATUS_META[detailVision.status].color}`}>
                      {STATUS_META[detailVision.status].label}
                    </span>
                  </div>
                  <h3 className="text-white font-black text-sm leading-snug drop-shadow">{detailVision.title}</h3>
                </div>
                <button onClick={() => openEdit(detailVision)} className="shrink-0 w-7 h-7 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center text-white transition cursor-pointer">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-5 flex-1">
              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">{detailVision.description}</p>
              {detailVision.motivationStatement && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1">Why This Matters</p>
                  <p className="text-xs text-violet-800 italic leading-relaxed">"{detailVision.motivationStatement}"</p>
                </div>
              )}

              {/* Progress + Date */}
              <div className="grid grid-cols-2 gap-3">
                {detailVision.progress !== undefined && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progress</p>
                    <p className="text-xl font-black text-violet-600 mt-0.5">{detailVision.progress}%</p>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${detailVision.progress}%`, boxShadow: '0 0 6px rgba(124,58,237,0.5)' }} />
                    </div>
                  </div>
                )}
                {detailVision.targetDate && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Target Date</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      {new Date(detailVision.targetDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {detailVision.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detailVision.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {/* Milestones */}
              {detailVision.milestones.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-violet-500" /> Milestones
                    <span className="text-slate-400 font-semibold normal-case ml-1">
                      {detailVision.milestones.filter(m => m.isCompleted).length}/{detailVision.milestones.length}
                    </span>
                  </p>
                  <div className="space-y-2">
                    {detailVision.milestones.map(ms => (
                      <div key={ms.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition">
                        <button
                          onClick={() => handleToggleMilestone(detailVision.id, ms.id)}
                          className="mt-0.5 shrink-0 cursor-pointer"
                        >
                          {ms.isCompleted
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                            : <Circle className="w-4 h-4 text-slate-300" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${ms.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {ms.title || 'Untitled milestone'}
                          </p>
                          {ms.dueDate && (
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {new Date(ms.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked tasks */}
              {(() => {
                const linked = tasks.filter(t => detailVision.linkedTaskIds.includes(t.id));
                if (linked.length === 0) return null;
                return (
                  <div>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" /> Linked Tasks
                    </p>
                    <div className="space-y-1.5">
                      {linked.map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : t.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                          <span className="font-semibold text-slate-700 truncate flex-1">{t.title}</span>
                          <span className="text-[9px] text-slate-400 font-mono shrink-0">Due {t.deadline.slice(5)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Linked journal entries */}
              {(() => {
                const linked = journalEntries.filter(e => detailVision.linkedJournalIds.includes(e.id));
                if (linked.length === 0) return null;
                return (
                  <div>
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-rose-500" /> Journal Reflections
                    </p>
                    <div className="space-y-1.5">
                      {linked.map(e => (
                        <div key={e.id} className="flex items-center gap-2 text-xs p-2 bg-rose-50 border border-rose-100 rounded-lg cursor-pointer hover:border-rose-300 transition" onClick={() => onNavigate('wellness')}>
                          <BookOpen className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate flex-1">{e.title}</span>
                          <span className="text-[9px] text-slate-400 shrink-0">{e.dateCreated}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Quick actions */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-2">
                <button onClick={() => handleTogglePin(detailVision)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold rounded-lg border transition cursor-pointer ${detailVision.isPinned ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {detailVision.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                  {detailVision.isPinned ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={() => handleArchive(detailVision)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold rounded-lg border transition cursor-pointer ${detailVision.isArchived ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Archive className="w-3 h-3" />
                  {detailVision.isArchived ? 'Restore' : 'Archive'}
                </button>
                <button onClick={() => { handleDuplicate(detailVision); setDetailVisionId(null); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                <button onClick={() => { handleDelete(detailVision.id); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[10.5px] font-bold rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-black text-slate-900">{editingVision ? 'Edit Vision' : 'Create New Vision'}</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer">
                <X className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            {/* Modal body — two-column layout */}
            <div className="flex flex-1 overflow-hidden">

              {/* Left: Image zone */}
              <div className="w-64 shrink-0 border-r border-slate-100 p-4 flex flex-col gap-3">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Cover Image *</p>

                {formImageDataUrl ? (
                  <div className="relative flex-1 min-h-48 rounded-xl overflow-hidden">
                    <img src={formImageDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setFormImageDataUrl('')}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    ref={pasteZoneRef}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={async e => {
                      e.preventDefault(); setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) await handleFileChange(file);
                    }}
                    className={`flex-1 min-h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2.5 text-center p-4 transition-colors ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'}`}
                  >
                    {formImageLoading ? (
                      <div className="animate-pulse text-xs text-slate-400 font-semibold">Processing...</div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10.5px] font-bold text-slate-600">Paste, Drop or Upload</p>
                          <p className="text-[9.5px] text-slate-400 mt-0.5">Ctrl+V anywhere in this dialog</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-[10.5px] font-bold text-slate-600 hover:bg-slate-50 hover:border-violet-300 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) await handleFileChange(file);
                    e.target.value = '';
                  }}
                />
                <p className="text-[9px] text-slate-400 text-center">JPG · PNG · WEBP supported. Auto-compressed.</p>
              </div>

              {/* Right: Form fields */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">

                {/* Title */}
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Vision Title *</label>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="e.g. Graduate with First Class Honours"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Description</label>
                  <textarea
                    maxLength={280}
                    rows={2}
                    placeholder="Describe your vision and what achieving it means to you..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                </div>

                {/* Motivation */}
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Motivation Statement <span className="text-slate-400 normal-case font-semibold">(optional)</span></label>
                  <input
                    type="text"
                    maxLength={160}
                    placeholder="Your personal 'why' affirmation..."
                    value={formMotivation}
                    onChange={e => setFormMotivation(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                </div>

                {/* Category + Status row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as VisionCategory)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      {(Object.keys(CATEGORY_META) as VisionCategory[]).map(cat => (
                        <option key={cat} value={cat}>{CATEGORY_META[cat].label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as VisionStatus)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      {(Object.keys(STATUS_META) as VisionStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom category */}
                {formCategory === 'custom' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Custom Category Name</label>
                    <input
                      type="text"
                      maxLength={30}
                      placeholder="e.g. Side Projects"
                      value={formCustomCategory}
                      onChange={e => setFormCustomCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                )}

                {/* Priority + Target date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Priority</label>
                    <select
                      value={formPriority}
                      onChange={e => setFormPriority(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Target Date <span className="text-slate-400 normal-case font-semibold">(optional)</span></label>
                    <input
                      type="date"
                      value={formTargetDate}
                      onChange={e => setFormTargetDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                    />
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formEnableProgress}
                      onChange={e => setFormEnableProgress(e.target.checked)}
                      className="rounded text-violet-600"
                    />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Track Progress</span>
                  </label>
                  {formEnableProgress && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-semibold">0%</span>
                        <span className="text-xs font-black text-violet-600">{formProgress}%</span>
                        <span className="text-[10px] text-slate-500 font-semibold">100%</span>
                      </div>
                      <input
                        type="range" min={0} max={100} value={formProgress}
                        onChange={e => setFormProgress(Number(e.target.value))}
                        className="w-full accent-violet-600 cursor-pointer"
                      />
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${formProgress}%`, boxShadow: '0 0 6px rgba(124,58,237,0.4)' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider block mb-1">Tags <span className="text-slate-400 normal-case font-semibold">(press Enter to add)</span></label>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {formTags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {tag}
                        <button onClick={() => setFormTags(f => f.filter(t => t !== tag))} className="hover:text-rose-500 transition cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={formTagInput}
                    onChange={e => setFormTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                {/* Pin + Options */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formIsPinned} onChange={e => setFormIsPinned(e.target.checked)} className="rounded text-violet-600" />
                    <span className="text-[10.5px] font-bold text-slate-600">Pin to Dashboard</span>
                  </label>
                </div>

                {/* Milestones accordion */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowMilestones(!showMilestones)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <span className="text-[10.5px] font-black text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-500" />
                      Milestones ({formMilestones.length})
                    </span>
                    {showMilestones ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {showMilestones && (
                    <div className="p-3 space-y-2.5 border-t border-slate-100">
                      {formMilestones.map((ms, i) => (
                        <div key={ms.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Milestone ${i + 1}`}
                            value={ms.title}
                            onChange={e => setFormMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, title: e.target.value } : m))}
                            className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10.5px] font-medium text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-400"
                          />
                          <input
                            type="date"
                            value={ms.dueDate ?? ''}
                            onChange={e => setFormMilestones(prev => prev.map((m, idx) => idx === i ? { ...m, dueDate: e.target.value } : m))}
                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-400 cursor-pointer"
                          />
                          <button onClick={() => setFormMilestones(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-400 transition cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {formMilestones.length < 10 && (
                        <button onClick={addMilestone} className="flex items-center gap-1 text-[10.5px] font-bold text-violet-600 hover:text-violet-700 transition cursor-pointer">
                          <Plus className="w-3.5 h-3.5" /> Add Milestone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <p className="text-[10px] text-slate-400 font-medium">
                {!formImageDataUrl ? '⚠ Upload a cover image to continue' : !formTitle.trim() ? '⚠ Add a title to continue' : '✓ Ready to save'}
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 border border-slate-200 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle.trim() || !formImageDataUrl}
                  className="px-5 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {editingVision ? 'Update Vision' : 'Save Vision →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
