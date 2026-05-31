import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry, JournalEntryType, MoodType, MoodCheckIn, WellnessCheckIn, JournalImage } from '../types';
import { 
  Plus, Trash2, Edit3, X, Sliders, Check, Calendar, ArrowRight, BarChart2, Coffee, Moon, Sun, Award, Flame, Trophy, Sparkles, Settings, 
  Eye, Lock, Unlock, Image as ImageIcon, Send, Search, ListFilter, CheckSquare, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  Type, RefreshCw, Download, ShieldAlert, Heart, ChevronLeft, ChevronRight, Bold, Italic, Underline, Strikethrough, Paintbrush,
  Undo, Redo
} from 'lucide-react';
import { MorphPanel } from './ui/ai-input';

interface WellnessJournalModuleProps {
  entries: JournalEntry[];
  onUpdateEntries: (newEntries: JournalEntry[]) => void;
}

export default function WellnessJournalModule({
  entries,
  onUpdateEntries
}: WellnessJournalModuleProps) {
  // Navigation & View Toggles
  const [activeView, setActiveView] = useState<'timeline' | 'editor' | 'analytics'>('timeline');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Security Passcode Lock
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState<boolean>(() => {
    return localStorage.getItem('journal_lock_enabled') === 'true';
  });
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('journal_lock_enabled') === 'true';
  });
  const [passcode, setPasscode] = useState<string>(() => {
    return localStorage.getItem('journal_passcode') || '';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showLockSettings, setShowLockSettings] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  // Timeline Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Rich Text Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<JournalEntryType>('daily');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Custom Typography & Format bar states
  const [editorFont, setEditorFont] = useState("'Outfit', sans-serif");
  const [editorSize, setEditorSize] = useState('14');
  const [editorColor, setEditorColor] = useState('#1e293b'); // slate-800
  const [editorBgColor, setEditorBgColor] = useState('transparent');
  const [editorAlignment, setEditorAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  // Editor Check-in States
  const [moodScore, setMoodScore] = useState<number>(7);
  const [moodType, setMoodType] = useState<MoodType>('happy');
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [motivationLevel, setMotivationLevel] = useState<number>(8);
  const [sleepQuality, setSleepQuality] = useState<number>(7);

  // Wellness Check-in States
  const [anxietyLevel, setAnxietyLevel] = useState<number>(3);
  const [focusLevel, setFocusLevel] = useState<number>(7);
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);
  const [workloadPressure, setWorkloadPressure] = useState<number>(5);
  const [assignmentConfidence, setAssignmentConfidence] = useState<number>(8);
  const [productivityRating, setProductivityRating] = useState<number>(8);

  // Gratitude Guided Prompts States
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');

  // Image Attachments States
  const [attachedImages, setAttachedImages] = useState<JournalImage[]>([]);
  const [showImageMockPicker, setShowImageMockPicker] = useState(false);
  const [customImageCaption, setCustomImageCaption] = useState('');

  // Tag inputs
  const [tagInput, setTagInput] = useState('');
  const [entryTags, setEntryTags] = useState<string[]>([]);

  // AI Assistant Analysis State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    summary: string;
    recurringThemes: string[];
    positiveHighlights: string[];
    sentiment: string;
  } | null>(null);

  // Canvas ref for visual graph rendering
  const moodCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wellnessCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-Save Notification Timer
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'UnsavedChanges'>('Saved');

  // Static Preset High-Resolution Mock Campus/Wellness Images to bypass local file limits
  const mockImagePresets = [
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80', caption: 'Academic Campus Library' },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80', caption: 'Morning Yoga and Stretching' },
    { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80', caption: 'Deep Work Coding Workspace' },
    { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=500&q=80', caption: 'Nature Walk Reflection' }
  ];

  // Helper date conversions YYYY-MM-DD -> Month DD, YYYY
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // --- Security: Unlock Passcode challenge ---
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === passcode) {
      setIsLocked(false);
      setPasscodeInput('');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid 4-digit passcode security shield active.');
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
      localStorage.setItem('journal_passcode', newPasscode);
      localStorage.setItem('journal_lock_enabled', 'true');
      setPasscode(newPasscode);
      setIsLocked(true);
      setShowLockSettings(false);
    } else {
      localStorage.removeItem('journal_passcode');
      localStorage.setItem('journal_lock_enabled', 'false');
      setPasscode('');
      setIsLocked(false);
      setShowLockSettings(false);
    }
  };

  // --- Search & Filters computation ---
  const filteredEntries = entries.filter(entry => {
    const keywordMatch = searchQuery === '' || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const typeMatch = filterType === 'all' || entry.type === filterType;
    
    const moodMatch = filterMood === 'all' || entry.mood.type === filterMood;
    
    const tagMatch = filterTag === 'all' || entry.tags.includes(filterTag);
    
    return keywordMatch && typeMatch && moodMatch && tagMatch;
  });

  // Extract all unique tags
  const allUniqueTags = Array.from(
    new Set(entries.flatMap(e => e.tags))
  );

  // Streak Math (Reflection streaking keep burning)
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const sortedDates = [...entries]
      .map(e => e.dateCreated)
      .sort((a, b) => b.localeCompare(a)); // latest first
    
    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    
    // Check if user logged today or yesterday
    const firstLog = new Date(sortedDates[0]);
    firstLog.setHours(0,0,0,0);
    const diff = today.getTime() - firstLog.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 1) return 0; // Streak broken

    let dateSet = new Set(sortedDates);
    while (true) {
      const yyyy = checkDate.getFullYear();
      const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const dd = String(checkDate.getDate()).padStart(2, '0');
      const checkStr = `${yyyy}-${mm}-${dd}`;
      
      if (dateSet.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // yesterday grace
        if (streak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yyyy2 = checkDate.getFullYear();
          const mm2 = String(checkDate.getMonth() + 1).padStart(2, '0');
          const dd2 = String(checkDate.getDate()).padStart(2, '0');
          const checkStr2 = `${yyyy2}-${mm2}-${dd2}`;
          if (dateSet.has(checkStr2)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  const reflectionStreak = calculateStreak();

  // --- Editor Functionality: Open/Edit ---
  const handleOpenEntry = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setEditTitle(entry.title);
    setEditType(entry.type);
    setEditContent(entry.content);
    setEditDate(entry.dateCreated);
    setMoodScore(entry.mood.score);
    setMoodType(entry.mood.type);
    setEnergyLevel(entry.mood.energyLevel);
    setStressLevel(entry.mood.stressLevel);
    setMotivationLevel(entry.mood.motivationLevel);
    setSleepQuality(entry.mood.sleepQuality);

    if (entry.wellness) {
      setAnxietyLevel(entry.wellness.anxietyLevel);
      setFocusLevel(entry.wellness.focusLevel);
      setExerciseCompleted(entry.wellness.exerciseCompleted);
      setWorkloadPressure(entry.wellness.workloadPressure);
      setAssignmentConfidence(entry.wellness.assignmentConfidence);
      setProductivityRating(entry.wellness.productivityRating);
    } else {
      resetWellnessStates();
    }

    setGratitude1(entry.gratitudeItems?.[0] || '');
    setGratitude2(entry.gratitudeItems?.[1] || '');
    setGratitude3(entry.gratitudeItems?.[2] || '');
    setAttachedImages(entry.images);
    setEntryTags(entry.tags);
    setAiAnalysis(entry.aiInsights || null);
    
    setSaveStatus('Saved');
    setActiveView('editor');
  };

  const handleNewEntryClick = () => {
    setSelectedEntryId(null);
    setEditTitle('');
    setEditType('daily');
    setEditContent('');
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setEditDate(`${yyyy}-${mm}-${dd}`);

    setMoodScore(7);
    setMoodType('happy');
    setEnergyLevel(7);
    setStressLevel(4);
    setMotivationLevel(8);
    setSleepQuality(7);
    resetWellnessStates();
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setAttachedImages([]);
    setEntryTags([]);
    setAiAnalysis(null);
    
    setSaveStatus('Saved');
    setActiveView('editor');
  };

  const resetWellnessStates = () => {
    setAnxietyLevel(3);
    setFocusLevel(7);
    setExerciseCompleted(false);
    setWorkloadPressure(5);
    setAssignmentConfidence(8);
    setProductivityRating(8);
  };

  // --- Auto Save & Save Trigger ---
  const handleSaveEntry = () => {
    setSaveStatus('Saving...');
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const hh = String(today.getHours()).padStart(2, '0');
    const mins = String(today.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${mins}`;

    const moodObj: MoodCheckIn = {
      score: moodScore,
      type: moodType,
      energyLevel,
      stressLevel,
      motivationLevel,
      sleepQuality
    };

    const wellnessObj: WellnessCheckIn = {
      anxietyLevel,
      focusLevel,
      exerciseCompleted,
      workloadPressure,
      assignmentConfidence,
      productivityRating
    };

    const gratitudeList = [];
    if (gratitude1.trim()) gratitudeList.push(gratitude1.trim());
    if (gratitude2.trim()) gratitudeList.push(gratitude2.trim());
    if (gratitude3.trim()) gratitudeList.push(gratitude3.trim());

    if (selectedEntryId) {
      // Update entry
      const updated = entries.map(e => {
        if (e.id === selectedEntryId) {
          return {
            ...e,
            title: editTitle.trim() || 'Untitled Reflection',
            type: editType,
            content: editContent,
            dateCreated: editDate || e.dateCreated,
            mood: moodObj,
            wellness: wellnessObj,
            gratitudeItems: gratitudeList.length > 0 ? gratitudeList : undefined,
            tags: entryTags,
            images: attachedImages,
            lastModified: new Date().toISOString(),
            aiInsights: aiAnalysis || undefined
          };
        }
        return e;
      });
      onUpdateEntries(updated);
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: `entry-${Date.now()}`,
        userId: 'student-1',
        dateCreated: editDate || dateStr,
        timeCreated: timeStr,
        lastModified: new Date().toISOString(),
        type: editType,
        title: editTitle.trim() || 'Untitled Reflection',
        content: editContent,
        mood: moodObj,
        wellness: wellnessObj,
        gratitudeItems: gratitudeList.length > 0 ? gratitudeList : undefined,
        tags: entryTags,
        images: attachedImages,
        isLocked: false,
        aiInsights: aiAnalysis || undefined
      };
      onUpdateEntries([newEntry, ...entries]);
      setSelectedEntryId(newEntry.id);
    }

    setTimeout(() => {
      setSaveStatus('Saved');
    }, 800);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to permanently delete this journal entry?')) {
      const updated = entries.filter(e => e.id !== entryId);
      onUpdateEntries(updated);
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null);
      }
      setActiveView('timeline');
    }
  };

  // --- AI Insights Trigger (Vite Server POST) ---
  const handleTriggerAI = async (customPrompt?: string) => {
    if (!editContent.trim()) {
      alert('Write some content first before consulting the AI Reflections assistant!');
      return;
    }

    setAiLoading(true);
    try {
      const promptVal = customPrompt || "";
      const response = await fetch('/api/reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: `${promptVal}\n\nJournal Content:\n${editContent}`,
          moodScore: moodScore,
          wellness: {
            anxietyLevel,
            focusLevel,
            workloadPressure,
            assignmentConfidence,
            productivityRating
          }
        })
      });

      if (!response.ok) {
        throw new Error('Reflections analyzer server error');
      }

      const resData = await response.json();
      setAiAnalysis({
        summary: resData.summary,
        recurringThemes: resData.recurringThemes || [],
        positiveHighlights: resData.positiveHighlights || [],
        sentiment: resData.sentiment || 'neutral'
      });
    } catch (err) {
      console.error('Failed communicating with AI reflections gateway:', err);
      // Fallback
      setAiAnalysis({
        summary: 'A supportive, custom summary detailing your day. Keep reflecting to build consistency streaks!',
        recurringThemes: ['Workload balancing', 'Mindful scheduling'],
        positiveHighlights: ['Documented thoughts, taking active steps to review stressors.'],
        sentiment: 'neutral'
      });
    } finally {
      setAiLoading(false);
    }
  };

  // --- Image Attachments Handling ---
  const handleAddMockImage = (presetUrl: string, caption: string) => {
    const newImg: JournalImage = {
      id: `img-${Date.now()}`,
      url: presetUrl,
      caption: caption || 'Attached reflection image'
    };
    setAttachedImages([...attachedImages, newImg]);
    setShowImageMockPicker(false);
  };

  const handleRemoveImage = (imgId: string) => {
    setAttachedImages(attachedImages.filter(img => img.id !== imgId));
  };

  // --- Tags Helpers ---
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!entryTags.includes(newTag)) {
        setEntryTags([...entryTags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagVal: string) => {
    setEntryTags(entryTags.filter(t => t !== tagVal));
  };

  // --- Calculations for metrics ---
  const wordsCount = editContent ? editContent.split(/\s+/).filter(w => w.trim().length > 0).length : 0;
  const charsCount = editContent ? editContent.length : 0;
  const readingTime = Math.max(1, Math.round(wordsCount / 225)); // average reading speed ~225 wpm

  // --- Analytics HTML5 Canvas drawing ---
  useEffect(() => {
    if (activeView !== 'analytics' || entries.length === 0) return;

    // A. Draw Mood Line Graph
    const mCanvas = moodCanvasRef.current;
    if (mCanvas) {
      const ctx = mCanvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = mCanvas.getBoundingClientRect();
        const displayWidth = rect.width || 340;
        const displayHeight = rect.height || 190;

        mCanvas.width = displayWidth * dpr;
        mCanvas.height = displayHeight * dpr;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        
        // Data prep (sorted dates ascending)
        const data = [...entries]
          .sort((a,b) => a.dateCreated.localeCompare(b.dateCreated))
          .slice(-7); // show last 7 entries

        if (data.length > 0) {
          const padding = 30;
          const width = displayWidth - padding * 2;
          const height = displayHeight - padding * 2;
          const stepX = data.length > 1 ? width / (data.length - 1) : width;

          // Drawing Background Grid
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 1;
          for (let i = 1; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(displayWidth - padding, y);
            ctx.stroke();
          }

          // Draw line path
          ctx.strokeStyle = '#6366f1'; // indigo-500
          ctx.lineWidth = 3;
          ctx.beginPath();

          data.forEach((entry, idx) => {
            const x = padding + idx * stepX;
            // score 1-10 mapped to height
            const y = padding + height - ((entry.mood.score - 1) / 9) * height;
            
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Draw markers & text labels
          data.forEach((entry, idx) => {
            const x = padding + idx * stepX;
            const y = padding + height - ((entry.mood.score - 1) / 9) * height;

            ctx.fillStyle = '#4f46e5'; // indigo-600
            ctx.beginPath();
            ctx.arc(x, y, 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Date text label
            ctx.fillStyle = '#64748b'; // slate-500
            ctx.font = 'bold 8px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.dateCreated.split('-').slice(1).join('/'), x, displayHeight - 10);

            // Score tag
            ctx.fillStyle = '#1e293b'; // slate-800
            ctx.font = 'bold 9px Outfit, sans-serif';
            ctx.fillText(String(entry.mood.score), x, y - 10);
          });
        }
      }
    }

    // B. Draw Wellness-Academic Correlation Bento Graph
    const wCanvas = wellnessCanvasRef.current;
    if (wCanvas) {
      const ctx = wCanvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = wCanvas.getBoundingClientRect();
        const displayWidth = rect.width || 340;
        const displayHeight = rect.height || 190;

        wCanvas.width = displayWidth * dpr;
        wCanvas.height = displayHeight * dpr;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        
        const data = [...entries]
          .sort((a,b) => a.dateCreated.localeCompare(b.dateCreated))
          .slice(-5); // last 5 entries

        if (data.length > 0) {
          const padding = 30;
          const width = displayWidth - padding * 2;
          const height = displayHeight - padding * 2;
          const stepX = data.length > 1 ? width / (data.length - 1) : width;

          // Legend
          ctx.fillStyle = '#f43f5e'; // rose-500
          ctx.fillRect(padding, 10, 8, 8);
          ctx.fillStyle = '#64748b';
          ctx.font = '8px Outfit, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('Anxiety Rating', padding + 12, 17);

          ctx.fillStyle = '#10b981'; // emerald-500
          ctx.fillRect(padding + 90, 10, 8, 8);
          ctx.fillStyle = '#64748b';
          ctx.fillText('Focus Rating', padding + 102, 17);

          // Draw Anxiety Line (rose-500)
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          data.forEach((entry, idx) => {
            const x = padding + idx * stepX;
            const score = entry.wellness ? entry.wellness.anxietyLevel : 3;
            const y = padding + height - ((score - 1) / 9) * height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Draw Focus Line (emerald-500)
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          data.forEach((entry, idx) => {
            const x = padding + idx * stepX;
            const score = entry.wellness ? entry.wellness.focusLevel : 7;
            const y = padding + height - ((score - 1) / 9) * height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Draw Grid X markers
          data.forEach((entry, idx) => {
            const x = padding + idx * stepX;
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 8px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(entry.dateCreated.split('-').slice(1).join('/'), x, displayHeight - 10);
          });
        }
      }
    }
  }, [activeView, entries]);

  // Synchronize uncontrolled contentEditable innerHTML only on entry load or when entering editor view to prevent caret jumping
  useEffect(() => {
    if (editorRef.current && activeView === 'editor') {
      if (editorRef.current.innerHTML !== editContent) {
        editorRef.current.innerHTML = editContent;
      }
    }
  }, [selectedEntryId, activeView]);

  // JSON backup ledger exports
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `habiticon_wellbeing_ledger_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handlePurgeLogs = () => {
    if (confirm('CAUTION: You are about to permanently delete all journal entries. This action CANNOT be undone! Proceed?')) {
      onUpdateEntries([]);
      alert('All reflection database ledgers purged completely.');
      setActiveView('timeline');
    }
  };

  // Content-Editable command utilities (Basic rich text simulation)
  const execFormat = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    // Sync rich text edits to state
    const editableDiv = document.getElementById('rich-reflections-editor');
    if (editableDiv) {
      setEditContent(editableDiv.innerHTML);
      setSaveStatus('UnsavedChanges');
    }
  };

  // Sync state if content editable modifications are made directly
  const handleEditableChange = (e: React.FormEvent<HTMLDivElement>) => {
    setEditContent(e.currentTarget.innerHTML);
    setSaveStatus('UnsavedChanges');
  };

  // Handle clicking on horizontal divider HR to delete it
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'HR') {
      if (confirm('Do you want to remove this horizontal divider?')) {
        target.remove();
        setEditContent(e.currentTarget.innerHTML);
        setSaveStatus('UnsavedChanges');
      }
    }
  };

  // Trigger auto-saves on form field edits
  const notifyUnsaved = () => {
    if (saveStatus !== 'UnsavedChanges') {
      setSaveStatus('UnsavedChanges');
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full font-sans text-slate-800 relative">
      
      {/* SECURITY ACCESS PANEL: Private Passcode Lock Challenge */}
      {isLocked && (
        <div className="absolute inset-0 bg-indigo-950/95 backdrop-blur-md rounded-2xl z-50 flex items-center justify-center p-6 text-white text-center select-none animate-in fade-in duration-200">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Private Wellbeing Ledger Locked</h3>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">Input your 4-digit security code to reveal secure daily reflection timeline.</p>
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
                className="w-full text-center tracking-widest text-lg font-black bg-slate-950 border border-slate-800 rounded-lg py-2.5 text-white focus:outline-none focus:border-rose-500"
                required
                autoFocus
              />
              {passcodeError && (
                <span className="text-[9.5px] text-red-400 font-bold block leading-snug">{passcodeError}</span>
              )}
              <button 
                type="submit" 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded-lg transition active:scale-95 cursor-pointer"
              >
                Unlock Secure Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap justify-between items-center border-b border-slate-200/50 pb-4 mb-4 gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
            <Heart className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
            Journal &amp; Wellbeing reflections Hub
          </h2>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Explore emotional trends • Write daily gratitude logs • Consult Aura AI</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Views switcher */}
          <div className="flex bg-slate-100 p-0.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 shrink-0">
            <button 
              onClick={() => setActiveView('timeline')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer ${activeView === 'timeline' ? 'bg-white text-indigo-700 font-bold shadow-sm' : 'hover:text-slate-900'}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Timeline Logs
            </button>
            <button 
              onClick={() => setActiveView('analytics')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer ${activeView === 'analytics' ? 'bg-white text-indigo-700 font-bold shadow-sm' : 'hover:text-slate-900'}`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              Wellness Analytics
            </button>
          </div>

          <button 
            onClick={() => setShowLockSettings(!showLockSettings)}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition shrink-0 cursor-pointer"
            title="Privacy Guard Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button 
            onClick={handleNewEntryClick}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] px-3 py-2 rounded-lg flex items-center gap-1 transition shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + New Reflection
          </button>
        </div>
      </div>

      {/* Security settings popout overlay card */}
      {showLockSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-40 p-4">
          <form onSubmit={handleSaveLockSettings} className="max-w-xs w-full bg-white border border-slate-200 p-5 rounded-xl shadow-2xl space-y-3.5 animate-in zoom-in duration-150 text-slate-800 text-left">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-650" />
                Journal Lock settings
              </h4>
              <button type="button" onClick={() => setShowLockSettings(false)} className="text-slate-400 hover:text-slate-700 font-bold">×</button>
            </div>

            <div className="space-y-3.5 py-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isPasscodeEnabled}
                  onChange={(e) => setIsPasscodeEnabled(e.target.checked)}
                  className="rounded text-indigo-650"
                />
                Enable 4-Digit Passcode Guard
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

      {/* 2. Main Content Panels */}
      <div className="flex-grow overflow-hidden h-full">
        {activeView === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
            
            {/* Timeline Column (Col-4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-3 shrink-0">
                <h3 className="text-xs font-bold text-slate-805 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  Filter Reflections
                </h3>
                <span className="text-[9.5px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{filteredEntries.length} Saved</span>
              </div>

              {/* Tag filters bar / Search */}
              <div className="space-y-2 shrink-0 pb-3 border-b border-slate-100">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search keywords..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 pl-7 focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 text-slate-650 font-semibold focus:outline-none"
                  >
                    <option value="all">All Reflection Types</option>
                    <option value="daily">Daily Journals</option>
                    <option value="reflection">Reflections</option>
                    <option value="goal_review">Goal Reviews</option>
                    <option value="study_reflection">Study logs</option>
                    <option value="gratitude">Gratitude Logs</option>
                    <option value="freeform">Freeform Logs</option>
                  </select>

                  <select 
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="text-[10px] bg-slate-50 border border-slate-200 rounded p-1 text-slate-650 font-semibold focus:outline-none"
                  >
                    <option value="all">All Emotional States</option>
                    <option value="very_happy">Very Happy 😄</option>
                    <option value="happy">Happy 🙂</option>
                    <option value="neutral">Neutral 😐</option>
                    <option value="stressed">Stressed 😣</option>
                    <option value="sad">Sad 😢</option>
                  </select>
                </div>

                {allUniqueTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    <button 
                      onClick={() => setFilterTag('all')}
                      className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${filterTag === 'all' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    >
                      # All
                    </button>
                    {allUniqueTags.map(tagVal => (
                      <button 
                        key={tagVal}
                        onClick={() => setFilterTag(tagVal)}
                        className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border transition cursor-pointer ${filterTag === tagVal ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                      >
                        #{tagVal}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline feed */}
              <div className="flex-grow space-y-2.5 overflow-y-auto mt-3 pr-1 scrollbar-thin">
                {filteredEntries.map(entry => (
                  <div 
                    key={entry.id} 
                    onClick={() => handleOpenEntry(entry)}
                    className="p-3 bg-slate-50 hover:bg-white border border-slate-100 hover:border-rose-200 rounded-xl cursor-pointer transition-all duration-200 shadow-xs flex flex-col gap-2 group text-left"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {entry.type.replace('_', ' ')}
                      </span>
                      <span className="text-[13px]" title={`Mood index: ${entry.mood.score}/10`}>
                        {entry.mood.type === 'very_happy' && '😄'}
                        {entry.mood.type === 'happy' && '🙂'}
                        {entry.mood.type === 'neutral' && '😐'}
                        {entry.mood.type === 'stressed' && '😣'}
                        {entry.mood.type === 'sad' && '😢'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-650 transition-colors">
                        {entry.title}
                      </h4>
                      <p className="text-[10px]/snug text-slate-500 mt-0.5 line-clamp-2">
                        {entry.content.replace(/<[^>]*>/g, '')} {/* Strip tags */}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono pt-1.5 border-t border-slate-200/40">
                      <span>{formatDateDisplay(entry.dateCreated)}</span>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                          className="text-slate-400 hover:text-red-500 transition"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredEntries.length === 0 && (
                  <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-1 select-none">
                    <Sliders className="w-8 h-8 text-slate-200" />
                    <span>No reflection logs matching query filters.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reflection details panel / dashboard mockup if none selected (Col-8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-center items-center h-full overflow-hidden text-center select-none text-slate-800">
              <div className="max-w-md space-y-4">
                <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Heart className="w-6 h-6 fill-rose-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Select or Create a Wellbeing Reflection</h3>
                  <p className="text-[10.5px] text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                    Keep a dedicated personal journal, complete wellness indicators, record items of gratitude, and let Aura AI highlight emotional stress trajectories.
                  </p>
                </div>
                
                {/* Journal Streak banner info */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full text-[10px] font-extrabold">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
                  Active Journaling: {reflectionStreak} Days Streak
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-left">
                  <button 
                    onClick={handleNewEntryClick}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-xs font-bold text-indigo-700 transition cursor-pointer"
                  >
                    ✍️ Create Reflection Entry
                  </button>
                  <button 
                    onClick={() => setActiveView('analytics')}
                    className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 rounded-xl text-xs font-bold text-rose-700 transition cursor-pointer"
                  >
                    📊 Check Long-Term Wellbeing
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 3. Editor View (Google Docs / Day One style) */}
        {activeView === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full overflow-hidden">
            
            {/* Editor Workspace Column (Col-8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-hidden text-left relative">
              
              {/* Header Editor status indicator bar */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9.5px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-0.5">
                    {editType} log
                  </span>
                  <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full ${saveStatus === 'Saved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'}`}>
                    {saveStatus}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <MorphPanel onSubmit={handleTriggerAI} isLoading={aiLoading} />

                  <button 
                    onClick={handleSaveEntry}
                    className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10.5px] font-bold rounded-lg flex items-center gap-0.5 transition shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Entry
                  </button>

                  <button 
                    onClick={() => setActiveView('timeline')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-650"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Formatting Textbar Header */}
              <div className="flex flex-wrap gap-1.5 py-2.5 border-b border-slate-100 bg-slate-50/50 rounded px-2 mt-2 shrink-0 select-none items-center text-xs">
                {/* Font typography select */}
                <select 
                  value={editorFont}
                  onChange={(e) => setEditorFont(e.target.value)}
                  className="bg-white border border-slate-200 rounded p-1 text-[10px] font-bold text-slate-650 focus:outline-none"
                  title="Typography Font"
                >
                  <option value="'Outfit', sans-serif">Outfit</option>
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Fira Sans', sans-serif">Fira Sans</option>
                  <option value="'Fira Code', monospace">Fira Code</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>

                {/* Font Size controls */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded p-0.5 font-mono text-[9px] font-bold">
                  <button onClick={() => setEditorSize(String(Math.max(8, parseInt(editorSize) - 1)))} className="p-0.5 hover:bg-slate-100 rounded text-slate-450 cursor-pointer">-</button>
                  <span className="px-1 text-slate-800">{editorSize}pt</span>
                  <button onClick={() => setEditorSize(String(Math.min(72, parseInt(editorSize) + 1)))} className="p-0.5 hover:bg-slate-100 rounded text-slate-450 cursor-pointer">+</button>
                </div>

                <div className="w-px h-5 bg-slate-200 mx-1"></div>

                {/* Bold Italic Underline Strikethrough buttons */}
                <button onClick={() => execFormat('bold')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Bold text"><Bold className="w-3.5 h-3.5" /></button>
                <button onClick={() => execFormat('italic')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Italic text"><Italic className="w-3.5 h-3.5" /></button>
                <button onClick={() => execFormat('underline')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Underline text"><Underline className="w-3.5 h-3.5" /></button>
                <button onClick={() => execFormat('strikeThrough')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Strikethrough text"><Strikethrough className="w-3.5 h-3.5" /></button>
                
                {/* Undo Redo buttons */}
                <button onClick={() => execFormat('undo')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Undo"><Undo className="w-3.5 h-3.5" /></button>
                <button onClick={() => execFormat('redo')} className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer" title="Redo"><Redo className="w-3.5 h-3.5" /></button>

                <div className="w-px h-5 bg-slate-200 mx-1"></div>

                {/* Text Colors */}
                <select 
                  value={editorColor}
                  onChange={(e) => { setEditorColor(e.target.value); execFormat('foreColor', e.target.value); }}
                  className="bg-white border border-slate-200 rounded p-0.5 text-[9px] focus:outline-none"
                  title="Text Color"
                >
                  <option value="#1e293b">Dark Slate</option>
                  <option value="#2563eb">Indigo Blue</option>
                  <option value="#e11d48">Rose Red</option>
                  <option value="#059669">Emerald Green</option>
                  <option value="#d97706">Amber Orange</option>
                </select>

                {/* Highlight Colors */}
                <select 
                  value={editorBgColor}
                  onChange={(e) => { setEditorBgColor(e.target.value); execFormat('backColor', e.target.value); }}
                  className="bg-white border border-slate-200 rounded p-0.5 text-[9px] focus:outline-none"
                  title="Highlight Color"
                >
                  <option value="transparent">No Highlight</option>
                  <option value="#fef08a">Yellow Glow</option>
                  <option value="#fecdd3">Rose Glow</option>
                  <option value="#a7f3d0">Emerald Glow</option>
                  <option value="#bfdbfe">Blue Glow</option>
                </select>

                <div className="w-px h-5 bg-slate-200 mx-1"></div>

                {/* Headings */}
                <button onClick={() => execFormat('formatBlock', '<h1>')} className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-black text-[10px] text-slate-700 cursor-pointer" title="H1 Title">H1</button>
                <button onClick={() => execFormat('formatBlock', '<h2>')} className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-black text-[10px] text-slate-700 cursor-pointer" title="H2 Section">H2</button>
                <button onClick={() => execFormat('formatBlock', '<blockquote>')} className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-black text-[10px] text-slate-700 cursor-pointer" title="Quote Block">""</button>
                <button onClick={() => execFormat('insertHorizontalRule')} className="px-1 py-0.5 hover:bg-slate-200 rounded font-bold text-[10px] text-slate-700 cursor-pointer" title="Horizontal divider">—</button>

                <div className="w-px h-5 bg-slate-200 mx-1"></div>

                {/* Paragraph Alignments */}
                <button onClick={() => { setEditorAlignment('left'); execFormat('justifyLeft'); }} className={`p-1 hover:bg-slate-200 rounded cursor-pointer ${editorAlignment === 'left' ? 'text-indigo-600 bg-slate-100' : 'text-slate-500'}`}><AlignLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setEditorAlignment('center'); execFormat('justifyCenter'); }} className={`p-1 hover:bg-slate-200 rounded cursor-pointer ${editorAlignment === 'center' ? 'text-indigo-600 bg-slate-100' : 'text-slate-500'}`}><AlignCenter className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setEditorAlignment('right'); execFormat('justifyRight'); }} className={`p-1 hover:bg-slate-200 rounded cursor-pointer ${editorAlignment === 'right' ? 'text-indigo-600 bg-slate-100' : 'text-slate-500'}`}><AlignRight className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setEditorAlignment('justify'); execFormat('justifyFull'); }} className={`p-1 hover:bg-slate-200 rounded cursor-pointer ${editorAlignment === 'justify' ? 'text-indigo-600 bg-slate-100' : 'text-slate-500'}`}><AlignJustify className="w-3.5 h-3.5" /></button>

                <div className="w-px h-5 bg-slate-200 mx-1"></div>

                {/* Lists */}
                <button onClick={() => execFormat('insertUnorderedList')} className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold text-[10px] text-slate-700 cursor-pointer" title="Bullet Lists">• List</button>
                <button onClick={() => execFormat('insertOrderedList')} className="px-1.5 py-0.5 hover:bg-slate-200 rounded font-bold text-[10px] text-slate-700 cursor-pointer" title="Numbered Lists">1. List</button>
              </div>

              {/* Scrollable Entry Body Editor */}
              <div className="flex-grow space-y-4 overflow-y-auto mt-3 pr-1 scrollbar-thin">
                {/* Title input */}
                <div>
                  <input 
                    type="text" 
                    placeholder="Reflections Title..."
                    value={editTitle}
                    onChange={(e) => { setEditTitle(e.target.value); notifyUnsaved(); }}
                    className="w-full text-sm font-extrabold text-slate-900 border-none outline-none placeholder-slate-300 py-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-3 border-b border-slate-150">
                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">Reflection Category Type</label>
                    <select 
                      value={editType}
                      onChange={(e) => { setEditType(e.target.value as any); notifyUnsaved(); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
                    >
                      <option value="daily">Daily Reflection log</option>
                      <option value="reflection">Deeper Mental analysis</option>
                      <option value="goal_review">Personal Goal review</option>
                      <option value="study_reflection">Study workload reflection</option>
                      <option value="gratitude">Structured Gratitude Exercises</option>
                      <option value="freeform">Freeform notebook entry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">Log Date</label>
                    <input 
                      type="date"
                      value={editDate}
                      onChange={(e) => { setEditDate(e.target.value); notifyUnsaved(); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-bold text-slate-400 uppercase mb-1">Entry Tags (Press Enter)</label>
                    <input 
                      type="text"
                      placeholder="Add tag... (e.g. Exams, Health)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    />
                    {entryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entryTags.map(tagVal => (
                          <span key={tagVal} className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8.5px] font-bold">
                            #{tagVal}
                            <button type="button" onClick={() => handleRemoveTag(tagVal)} className="text-[10px] text-indigo-400 hover:text-indigo-700">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actual Custom Content-Editable text document */}
                <div 
                  id="rich-reflections-editor"
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditableChange}
                  onClick={handleEditorClick}
                  style={{
                    fontFamily: editorFont,
                    fontSize: `${editorSize}px`,
                    color: editorColor,
                    backgroundColor: 'transparent',
                    textAlign: editorAlignment,
                    minHeight: '160px'
                  }}
                  className="outline-none focus:outline-none text-slate-800 leading-relaxed py-2 w-full prose max-w-none border-b border-slate-100"
                />

                {/* Guided Gratitude Prompts Exercises */}
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                    Guided Reflections &amp; Gratitude Prompts (Optional)
                  </h4>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[9.5px] text-slate-500 font-semibold mb-1">1. What are three things you are grateful for today?</label>
                      <input 
                        type="text" 
                        placeholder="Today, I am grateful for..."
                        value={gratitude1}
                        onChange={(e) => { setGratitude1(e.target.value); notifyUnsaved(); }}
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-slate-500 font-semibold mb-1">2. What went well today / what made you smile?</label>
                      <input 
                        type="text" 
                        placeholder="I smiled today because..."
                        value={gratitude2}
                        onChange={(e) => { setGratitude2(e.target.value); notifyUnsaved(); }}
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] text-slate-500 font-semibold mb-1">3. What achievement are you proud of today?</label>
                      <input 
                        type="text" 
                        placeholder="I am proud of accomplishing..."
                        value={gratitude3}
                        onChange={(e) => { setGratitude3(e.target.value); notifyUnsaved(); }}
                        className="w-full bg-white border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Media Image Gallery */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      Reflection Galleries ({attachedImages.length} attached)
                    </h4>
                    <button 
                      type="button"
                      onClick={() => setShowImageMockPicker(true)}
                      className="text-[9.5px] text-indigo-600 font-extrabold hover:underline"
                    >
                      + Attach Image
                    </button>
                  </div>

                  {showImageMockPicker && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex justify-between items-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Select Mock Reflection Image</span>
                        <button type="button" onClick={() => setShowImageMockPicker(false)} className="text-slate-400 hover:text-slate-700">×</button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {mockImagePresets.map(preset => (
                          <div 
                            key={preset.url}
                            onClick={() => handleAddMockImage(preset.url, preset.caption)}
                            className="bg-white border border-slate-100 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-400 transition"
                          >
                            <img src={preset.url} alt="preset" className="w-full h-14 object-cover" />
                            <span className="text-[7.5px] font-semibold text-slate-500 p-1 block truncate">{preset.caption}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {attachedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {attachedImages.map(img => (
                        <div key={img.id} className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden relative group">
                          <img src={img.url} alt={img.caption} className="w-full h-24 object-cover" />
                          <span className="text-[8.5px] font-semibold text-slate-600 p-1.5 block truncate bg-white/90">{img.caption}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/60 hover:bg-slate-950 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom statistics panel */}
              <div className="flex justify-between items-center text-[9.5px] text-slate-400 pt-2 border-t border-slate-100 mt-auto shrink-0 select-none font-mono">
                <div className="flex gap-4">
                  <span>Words: <strong>{wordsCount}</strong></span>
                  <span>Characters: <strong>{charsCount}</strong></span>
                  <span>Reading: <strong>~{readingTime}m</strong></span>
                </div>
                <span>Sync persists securely in browser sandbox cache.</span>
              </div>
            </div>

            {/* Check-ins & AI reflections side drawer (Col-4) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full overflow-y-auto space-y-5 text-left scrollbar-thin">
              
              {/* Mood HUD scale checkin */}
              <div className="space-y-3 pb-3 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
                  Mood Indicators
                </h4>

                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    { key: 'very_happy', val: 9, label: '😄 Very Happy' },
                    { key: 'happy', val: 7, label: '🙂 Happy' },
                    { key: 'neutral', val: 5, label: '😐 Neutral' },
                    { key: 'stressed', val: 3, label: '😣 Stressed' },
                    { key: 'sad', val: 1, label: '😢 Sad' }
                  ].map(m => (
                    <button
                      key={m.key}
                      onClick={() => { setMoodType(m.key as any); setMoodScore(m.val); notifyUnsaved(); }}
                      className={`p-2 border rounded-xl flex flex-col items-center gap-1.5 transition duration-150 cursor-pointer ${
                        moodType === m.key 
                          ? 'bg-rose-50 border-rose-200 font-bold text-rose-700' 
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg">{m.label.split(' ')[0]}</span>
                      <span className="text-[7.5px] font-bold block truncate">{m.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Energy Rating ({energyLevel}/10)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={energyLevel}
                      onChange={(e) => { setEnergyLevel(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Motivation Rating ({motivationLevel}/10)</label>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={motivationLevel}
                      onChange={(e) => { setMotivationLevel(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Wellness Check-in Optional Questions */}
              <div className="space-y-3 pb-3 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  Wellness Ratings HUD
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                      <span>Anxiety Levels</span>
                      <span>{anxietyLevel}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={anxietyLevel}
                      onChange={(e) => { setAnxietyLevel(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                      <span>Sleep Quality</span>
                      <span>{sleepQuality}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={sleepQuality}
                      onChange={(e) => { setSleepQuality(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                      <span>Workload Stress Level</span>
                      <span>{workloadPressure}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={workloadPressure}
                      onChange={(e) => { setWorkloadPressure(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase mb-1">
                      <span>Assignment Confidence</span>
                      <span>{assignmentConfidence}/10</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={assignmentConfidence}
                      onChange={(e) => { setAssignmentConfidence(Number(e.target.value)); notifyUnsaved(); }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer mt-1">
                    <input 
                      type="checkbox"
                      checked={exerciseCompleted}
                      onChange={(e) => { setExerciseCompleted(e.target.checked); notifyUnsaved(); }}
                      className="rounded text-rose-500"
                    />
                    Daily Physical Exercise Completed
                  </label>
                </div>
              </div>

              {/* Aura AI reflections panel */}
              <div className="bg-indigo-900 border border-indigo-950 text-white rounded-2xl p-4 space-y-3.5 shadow-md">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400 animate-bounce" />
                  Aura AI reflections Assistant
                </h4>

                {aiAnalysis ? (
                  <div className="space-y-3 text-[10.5px]/relaxed text-indigo-150">
                    <div>
                      <span className="font-extrabold text-[9px] uppercase tracking-widest text-emerald-400 block">AI Summary</span>
                      <p className="mt-0.5 font-medium leading-relaxed">{aiAnalysis.summary}</p>
                    </div>

                    {aiAnalysis.recurringThemes.length > 0 && (
                      <div>
                        <span className="font-extrabold text-[9px] uppercase tracking-widest text-emerald-400 block">Identified Themes</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 mt-0.5">
                          {aiAnalysis.recurringThemes.map((t, idx) => <li key={idx}>{t}</li>)}
                        </ul>
                      </div>
                    )}

                    {aiAnalysis.positiveHighlights.length > 0 && (
                      <div>
                        <span className="font-extrabold text-[9px] uppercase tracking-widest text-emerald-400 block">Accomplishments to Celebrate</span>
                        <ul className="list-disc pl-3.5 space-y-0.5 mt-0.5">
                          {aiAnalysis.positiveHighlights.map((h, idx) => <li key={idx}>{h}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[8.5px] uppercase font-bold pt-2 border-t border-indigo-900/60 font-mono">
                      <span>Sentiment: <strong className="text-white">{aiAnalysis.sentiment}</strong></span>
                      <button 
                        type="button" 
                        onClick={() => setAiAnalysis(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        Clear Insights
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[10.5px] text-indigo-200 space-y-3 font-medium">
                    <p>Trigger Aura AI reflections to extract supportive summaries, sentiment trackers, and recurring stress topics securely.</p>
                    <button
                      type="button"
                      onClick={handleTriggerAI}
                      disabled={aiLoading}
                      className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-white font-bold text-xs transition cursor-pointer"
                    >
                      {aiLoading ? 'Grounding Reflections...' : 'Generate AI Reflections'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 4. Analytics & Curves Dashboard View */}
        {activeView === 'analytics' && (
          <div className="space-y-4 h-full overflow-y-auto pr-1">
            
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Reflection Streak</span>
                  <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
                    <Flame className="w-5.5 h-5.5 text-amber-500 fill-amber-500" />
                    <span>{reflectionStreak} Days</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Logs Saved</span>
                  <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
                    <Trophy className="w-5.5 h-5.5 text-indigo-600" />
                    <span>{entries.length} Entries</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Gratitude logged</span>
                  <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
                    <Heart className="w-5.5 h-5.5 text-rose-500 fill-rose-500" />
                    <span>{entries.filter(e => e.gratitudeItems && e.gratitudeItems.length > 0).length} Entries</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Passcode Vault</span>
                  <div className="text-xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
                    <Unlock className="w-5.5 h-5.5 text-slate-500" />
                    <span>{passcode ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagrams Curves row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Canvas line mood diagram */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 self-start">
                  📈 Weekly Mood Rating Curves (Avg. Tracker)
                </h4>
                <canvas 
                  ref={moodCanvasRef} 
                  className="w-full bg-slate-50 rounded-lg border border-slate-100"
                  style={{ height: '190px' }}
                />
                <span className="text-[9px] text-slate-400 mt-2 block">Drawn dynamically on HTML5 Canvas. Line highlights relative day logs.</span>
              </div>

              {/* Canvas line wellness correlation diagram */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 self-start">
                  📊 Anxiety vs Focus wellbeing correlations
                </h4>
                <canvas 
                  ref={wellnessCanvasRef} 
                  className="w-full bg-slate-50 rounded-lg border border-slate-100"
                  style={{ height: '190px' }}
                />
                <span className="text-[9px] text-slate-400 mt-2 block">Tracks daily academic pressure impact alongside focus levels.</span>
              </div>
            </div>

            {/* Administration & secure data purge keys */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5 text-left">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-600 animate-pulse" />
                Ledger Administration &amp; Secure Backups
              </h4>
              <p className="text-[10px] text-slate-500 max-w-lg leading-relaxed mt-1">
                Your reflections and wellness logs are stored natively. You can backup your logs to a JSON document or complete a master wipe of all reflection records here.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={handleExportData}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Reflections Backup
                </button>
                <button 
                  onClick={handlePurgeLogs}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge Reflection Ledger
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
