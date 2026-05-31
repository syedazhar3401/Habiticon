/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Command, ArrowRight, CornerDownLeft, Loader2, Info } from 'lucide-react';
import { AIMessage, Course, CalendarEvent, Task } from '../types';
import { MorphPanel, ColorOrb } from './ui/ai-input';

interface AssistantChatProps {
  courses: Course[];
  events: CalendarEvent[];
  tasks: Task[];
  onTriggerAction: (actionType: string, payload: any) => void;
  onClose?: () => void;
}

export default function AssistantChat({
  courses,
  events,
  tasks,
  onTriggerAction,
  onClose
}: AssistantChatProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I'm **Aura**, your AI Academic Assistant. I can understand natural language and automatically perform actions inside your workspace.

For example, you can tell me things like:
* *"Add an assignment due next Friday for WIX1003"*
* *"Schedule study session for Data Structures every Tuesday at 6 PM"*
* *"Create an agenda note folder for Computer Science"*

How can I help optimize your academic schedule today?`,
      timestamp: new Date().toISOString()
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest messsages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent | string) => {
    let userMsgText = '';
    if (typeof e === 'string') {
      userMsgText = e.trim();
    } else {
      if (e) e.preventDefault();
      if (!prompt.trim()) return;
      userMsgText = prompt.trim();
      setPrompt('');
    }

    if (!userMsgText || loading) return;

    // Append user message
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: userMsgText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Execute post fetch towards /api/assistant
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMsgText,
          context: {
            courses,
            tasks,
            events
          }
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error status api.');
      }

      const resData = await response.json();

      const assistantMsg: AIMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        content: resData.reply || `I processed your request, but wasn't able to generate a detailed summary. Let me know if I should try again!`,
        timestamp: new Date().toISOString(),
        suggestedActions: resData.actions || []
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Error communicating with assistant gateway:", err);
      // Resilience fallback reply
      const errorMsg: AIMessage = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        content: `I'm having trouble reaching my database gateway directly right now, but I can guide you through setting up schedule items manually! You can also check if your **Settings > Secrets** have the required \`GEMINI_API_KEY\` active.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Convert custom bold markup and listing syntaxes into beautifully rendered HTML layouts securely
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      
      // Headers ###
      if (formatted.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-white mt-3 mb-1.5">{formatted.replace('### ', '')}</h4>;
      }
      if (formatted.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-semibold text-emerald-400 mt-4 mb-2">{formatted.replace('## ', '')}</h3>;
      }
      if (formatted.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-4 mb-2">{formatted.replace('# ', '')}</h2>;
      }

      // Bullet listings
      if (formatted.startsWith('* ') || formatted.startsWith('- ')) {
        const cleanContent = formatted.replace(/^[\*\-]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-300 leading-relaxed mb-1">
            {renderInlineFormat(cleanContent)}
          </li>
        );
      }

      // Plain paragraph formatting
      if (formatted.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {renderInlineFormat(formatted)}
        </p>
      );
    });
  };

  const renderInlineFormat = (lineText: string) => {
    // Simple bold regex parser
    const parts = lineText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-emerald-300 font-bold">{part.slice(2, -2)}</strong>;
      }
      // Inline code highlights
      const codeParts = part.split(/`([^`]+)`/g);
      return codeParts.map((subPart, subIdx) => {
        if (subIdx % 2 !== 0) {
          return <code key={subIdx} className="bg-slate-950 border border-slate-800 text-teal-400 font-mono text-[10px] px-1 py-0.5 rounded">{subPart}</code>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className="flex flex-col h-full bg-indigo-950 border border-indigo-900/60 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.25)] font-sans">
      {/* Bot Chat Header */}
      <div className="bg-indigo-950 px-4 py-3 flex items-center justify-between border-b border-indigo-900/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-inner">
            <ColorOrb dimension="22px" tones={{ base: "oklch(22.64% 0 0)" }} className="scale-115" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5 select-none">
              Gemmi Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[9px] text-indigo-400/70 font-mono select-none">Grounded Task NLU Model</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-[9.5px] text-indigo-200 flex items-center gap-1 bg-indigo-900/50 border border-indigo-850 px-2 py-0.5 rounded select-none">
            <Command className="w-2.5 h-2.5 text-indigo-300" />
            Workspace NLU
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-indigo-900 rounded text-indigo-300 hover:text-white transition font-black text-sm cursor-pointer ml-1 select-none"
              title="Close Assistant"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Message history panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-xl px-4 py-3 border text-xs shadow-md transition-all ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white border-indigo-500/20 rounded-tr-none shadow-[0_2px_12px_rgba(99,102,241,0.15)]' 
                : 'bg-indigo-900/40 text-slate-200 border-indigo-900/60 rounded-tl-none shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
            }`}>
              {/* Message author designation */}
              <div className="text-[9px] text-indigo-400/80 mb-1 font-mono uppercase tracking-wider">
                {msg.sender === 'user' ? 'Me' : 'Gemmi AI'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Message body content */}
              <div className="space-y-1">
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  formatMarkdown(msg.content)
                )}
              </div>

              {/* Action Suggestion capsules */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-900/50 space-y-2">
                  <div className="text-[9px] font-mono text-emerald-450 flex items-center gap-1">
                    <Info className="w-3 h-3 text-emerald-450" />
                    RECOMMENDED ACADEMIC TRANSACTIONS:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {msg.suggestedActions.map((act, index) => (
                      <button
                        key={index}
                        onClick={() => onTriggerAction(act.type, act.payload)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 rounded text-[11px] text-left transition-all flex items-center justify-between shadow active:scale-[0.98]"
                      >
                        <span className="truncate">{act.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-indigo-900/40 border border-indigo-900/60 rounded-xl rounded-tl-none px-4 py-3 flex items-center gap-2.5 text-indigo-200/80 text-xs shadow">
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Gemmi is indexing course directories...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Integrated Prompt Textarea Bottom Panel */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="p-3 bg-indigo-950 border-t border-indigo-900/40 flex flex-col gap-2 shrink-0 relative z-40 select-none"
      >
        <div className="relative flex items-center bg-indigo-950 border border-indigo-900 rounded-xl overflow-hidden focus-within:border-indigo-700 transition-all shadow-inner">
          <textarea
            placeholder="Ask Gemmi anything... (e.g. summarize notes)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="w-full h-16 resize-none bg-transparent outline-none border-none p-2.5 text-white text-xs placeholder-indigo-300/60 leading-relaxed scrollbar-thin"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute bottom-2.5 right-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/50 text-white disabled:text-indigo-400/40 rounded-lg transition-all active:scale-95 cursor-pointer border-none flex items-center justify-center"
            title="Send to Gemmi"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] text-indigo-400 font-mono flex items-center gap-1.5 select-none">
            <span className="w-1 h-1 rounded-full bg-emerald-450 animate-pulse"></span>
            Gemmi Engine v2
          </span>
          <span className="text-[9px] text-indigo-400 font-mono flex items-center gap-1 select-none">
            Press Enter <CornerDownLeft className="inline w-2 h-2 text-indigo-400" />
          </span>
        </div>
      </form>
    </div>
  );
}
