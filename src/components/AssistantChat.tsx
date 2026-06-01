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
    <div className="flex flex-col h-full bg-black border-4 border-black text-[#F9F9F9] overflow-hidden font-sans">
      {/* Bot Chat Header */}
      <div className="bg-black px-4 py-3 flex items-center justify-between border-b-4 border-black shrink-0 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center border border-black shadow">
            <ColorOrb dimension="22px" tones={{ base: "oklch(22.64% 0 0)" }} className="scale-115" />
          </div>
          <div>
            <div className="text-xs font-black text-white flex items-center gap-1.5 select-none uppercase tracking-wider">
              Gemmi Assistant
              <span className="w-1.5 h-1.5 rounded-full bg-[#E85002] animate-pulse"></span>
            </div>
            <div className="text-[9px] text-[#A7A7A7] font-mono select-none font-bold">Grounded Task NLU Model</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-[9.5px] text-white flex items-center gap-1 bg-[#333333] border-2 border-black px-2 py-0.5 rounded-none select-none font-bold">
            <Command className="w-2.5 h-2.5 text-[#E85002]" />
            Workspace NLU
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-[#E85002] hover:text-black border-2 border-black bg-white text-black transition font-black text-xs cursor-pointer ml-1 select-none flex items-center justify-center w-6 h-6 rounded-none shadow"
              title="Close Assistant"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Message history panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-black">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-none px-4 py-3 border-2 border-black text-xs shadow-md transition-all ${
              msg.sender === 'user' 
                ? 'bg-[#F9F9F9] text-black shadow-[3px_3px_0px_#A7A7A7]' 
                : 'bg-[#333333] text-[#F9F9F9] shadow-[3px_3px_0px_#E85002]'
            }`}>
              {/* Message author designation */}
              <div className={`text-[9px] mb-1 font-mono uppercase tracking-wider font-bold ${
                msg.sender === 'user' ? 'text-[#646464]' : 'text-[#E85002]'
              }`}>
                {msg.sender === 'user' ? 'Me' : 'Gemmi AI'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Message body content */}
              <div className="space-y-1 leading-relaxed">
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap font-mono font-semibold">{msg.content}</p>
                ) : (
                  formatMarkdown(msg.content)
                )}
              </div>

              {/* Action Suggestion capsules */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t-2 border-black space-y-2">
                  <div className="text-[9px] font-mono text-[#E85002] flex items-center gap-1 font-black tracking-wider">
                    <Info className="w-3 h-3 text-[#E85002]" />
                    RECOMMENDED ACADEMIC TRANSACTIONS:
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {msg.suggestedActions.map((act, index) => (
                      <button
                        key={index}
                        onClick={() => onTriggerAction(act.type, act.payload)}
                        className="bg-[#E85002] hover:bg-white text-black font-black px-3 py-1.5 border-2 border-black rounded-none text-[11px] text-left transition-all flex items-center justify-between shadow active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
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
            <div className="bg-[#333333] border-2 border-black text-[#F9F9F9] rounded-none px-4 py-3 flex items-center gap-2.5 text-xs shadow-[3px_3px_0px_#E85002]">
              <Loader2 className="w-3.5 h-3.5 text-[#E85002] animate-spin" />
              <span className="font-mono font-bold">Gemmi is indexing course directories...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Integrated Prompt Textarea Bottom Panel */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="p-3 bg-black border-t-4 border-black flex flex-col gap-2 shrink-0 relative z-40 select-none"
      >
        <div className="relative flex items-center bg-[#333333] border-2 border-black rounded-none overflow-hidden focus-within:border-[#E85002] transition-all shadow-inner">
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
            className="w-full h-16 resize-none bg-transparent outline-none border-none p-2.5 text-white text-xs placeholder-[#A7A7A7]/60 leading-relaxed font-mono font-semibold"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="absolute bottom-2.5 right-2.5 p-1.5 bg-[#E85002] hover:bg-white text-black disabled:bg-black disabled:text-[#A7A7A7] border-2 border-black rounded-none transition-all active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center justify-center"
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
          <span className="text-[9px] text-[#A7A7A7] font-mono flex items-center gap-1.5 select-none font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85002] animate-pulse"></span>
            Gemmi Engine v2
          </span>
          <span className="text-[9px] text-[#A7A7A7] font-mono flex items-center gap-1 select-none font-bold">
            Press Enter <CornerDownLeft className="inline w-2 h-2 text-[#A7A7A7]" />
          </span>
        </div>
      </form>
    </div>
  );
}
