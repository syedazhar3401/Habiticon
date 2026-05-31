/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, Database, GitFork, ListCollapse, Compass, Rocket, Cpu, Eye
} from 'lucide-react';

export default function BlueprintDocs() {
  const [activeSegment, setActiveSegment] = useState<'prd' | 'architecture' | 'schema' | 'api' | 'roadmap'>('prd');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col font-sans text-slate-100">
      {/* Tab Header bar */}
      <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-emerald-400 w-5 h-5 animate-pulse" />
            Engineering Blueprint &amp; System Specs
          </h2>
          <p className="text-xs text-slate-400">Complete application specifications, deliverables, and architecture blueprints for Campus Task Manager.</p>
        </div>
        
        {/* Navigation pills */}
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSegment('prd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSegment === 'prd' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            PRD
          </button>
          <button
            onClick={() => setActiveSegment('architecture')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSegment === 'architecture' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Architecture
          </button>
          <button
            onClick={() => setActiveSegment('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSegment === 'schema' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Database className="w-3.5 h-3.5" />
            PostgreSQL Schema
          </button>
          <button
            onClick={() => setActiveSegment('api')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSegment === 'api' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <ListCollapse className="w-3.5 h-3.5" />
            API Design
          </button>
          <button
            onClick={() => setActiveSegment('roadmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${activeSegment === 'roadmap' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Rocket className="w-3.5 h-3.5" />
            Roadmap
          </button>
        </div>
      </div>

      {/* Docs Workspace Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        {activeSegment === 'prd' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">PRODUCT REQUIREMENTS</span>
              <h1 className="text-2xl font-bold text-white mt-1">Campus Task Manager — PRD v1.0</h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Campus Task Manager is a unified student workload optimization deck. Traditional tools store task lists, class schedules, and research folders in separated silos. This application links high-stakes exams, project deadlines, and classroom lecture notes directly onto courses, giving students absolute clarity on academic benchmarks and AI study plans.
              </p>
            </div>

            <hr className="border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Target Personas
                </h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Active College Undergraduates</strong>: Juggling multiple laboratory tasks, assignments, lecture slides, and study calendars.</li>
                  <li><strong>Project Team Leaders</strong>: Needing visual task-dependencies and Gantt forecastings for senior capstones.</li>
                </ul>
              </div>

              <div className="space-y-3 bg-slate-950/40 border border-slate-800/60 p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Core Value Propositions
                </h3>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside">
                  <li><strong>Unified Hierarchy</strong>: Everything centers on courses. Deletes structural context-switching.</li>
                  <li><strong>NLU Voice Scheduling</strong>: Speak naturally to Aura to generate structured items instantly.</li>
                  <li><strong>Workload Timelines</strong>: Gantt views illustrate workload density to manage cram cycles.</li>
                </ol>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Functional System Boundaries</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5">Feature Set</th>
                    <th className="py-2.5">Minimum Viable Scope (MVP)</th>
                    <th className="py-2.5">Advanced Target Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-3 font-medium text-emerald-400">Calendar Engine</td>
                    <td className="py-3">Month, Week, Day views with CRUD capability. Custom intervals.</td>
                    <td className="py-3">Bidirectional Sync with external Outlook/Google Calendars API.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-emerald-400">Gantt Visualizer</td>
                    <td className="py-3">Timeline plots showing start dates and completion indicators.</td>
                    <td className="py-3">Auto critical-path algorithms and lag-time adjustment prompts.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-emerald-400">AI Aura Agent</td>
                    <td className="py-3">Natural language query parser returning JSON transactional callbacks.</td>
                    <td className="py-3">Live audio workspace scheduling and contextual email PDF reviews.</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-emerald-400">Notepad Organizer</td>
                    <td className="py-3">Organized directory trees with Markdown and active Stylus canvas pad.</td>
                    <td className="py-3">Collab multiplayer live-canvas and optical character note search.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">Detailed Use Cases &amp; User Stories</h3>
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-emerald-400">US-101: Contextual Study Session Creation</div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    <strong>As a</strong> student with busy midterms,<br />
                    <strong>I want to</strong> type "Aura, block out 2 hours of study every Tuesday for WIX1003 starting at 6 PM",<br />
                    <strong>So that</strong> the platform parses the course association, dates, hours, and formats a recurring sequence on my calendar.
                  </p>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-emerald-400">US-102: Gantt Bottleneck Analysis</div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    <strong>As a</strong> Computer Science capstone coordinator,<br />
                    <strong>I want to</strong> map dependencies between the backend database schema and the API deployment tasks,<br />
                    <strong>So that</strong> I can visually flag scheduling overlaps or forecast task delays before milestones are compromised.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSegment === 'architecture' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">SYSTEM DIAGRAM</span>
              <h1 className="text-2xl font-bold text-white mt-1">N-Tier Full-Stack Product Topology</h1>
              <p className="text-slate-400 mt-2 text-sm">
                A system overview highlighting how student input triggers local state updates, backchannel Node APIs, and server-side safety boundaries with Gemini 3.5.
              </p>
            </div>

            {/* Architecture SVG diagram */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 800 460" className="w-full max-w-3xl text-slate-300 text-xs font-mono">
                {/* User Actor */}
                <rect x="20" y="190" width="100" height="70" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                <text x="70" y="225" textAnchor="middle" fill="#fff" fontWeight="bold">Student / Client</text>
                <text x="70" y="245" textAnchor="middle" fill="#a1a1aa" fontSize="10">Web Browser</text>

                {/* Arrow to Gateway */}
                <path d="M 120 225 L 200 225" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="160" y="210" textAnchor="middle" fill="#34d399" fontSize="9">Express REST API / WS</text>

                {/* Gateway / React Controller */}
                <rect x="200" y="50" width="160" height="360" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                <text x="280" y="80" textAnchor="middle" fill="#fff" fontWeight="bold">React SPA (Vite)</text>
                <line x1="210" y1="95" x2="350" y2="95" stroke="#475569" />

                {/* Client Sub-modules */}
                <rect x="220" y="110" width="120" height="35" rx="4" fill="#0f172a" stroke="#475569" />
                <text x="280" y="132" textAnchor="middle" fill="#93c5fd" fontSize="10">Calendar &amp; Events</text>

                <rect x="220" y="155" width="120" height="35" rx="4" fill="#0f172a" stroke="#475569" />
                <text x="280" y="177" textAnchor="middle" fill="#93c5fd" fontSize="10">Kanban Board Engine</text>

                <rect x="220" y="200" width="120" height="35" rx="4" fill="#0f172a" stroke="#3b82f6" />
                <text x="280" y="222" textAnchor="middle" fill="#60a5fa" fontSize="10">Interactive Gantt</text>

                <rect x="220" y="245" width="120" height="35" rx="4" fill="#0f172a" stroke="#475569" />
                <text x="280" y="267" textAnchor="middle" fill="#93c5fd" fontSize="10">Stylus Canvas Notepad</text>

                <rect x="220" y="290" width="120" height="35" rx="4" fill="#0f172a" stroke="#10b981" />
                <text x="280" y="312" textAnchor="middle" fill="#34d399" fontSize="10">Aura Chat Console</text>

                <rect x="220" y="335" width="120" height="35" rx="4" fill="#0f172a" stroke="#475569" />
                <text x="280" y="357" textAnchor="middle" fill="#93c5fd" fontSize="10">PRD Spec Blueprint</text>

                {/* Arrow React -> Express backend */}
                <path d="M 360 225 L 440 225" fill="none" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="400" y="210" textAnchor="middle" fill="#34d399" fontSize="9">POST JSON</text>

                {/* Node.js Express server */}
                <rect x="440" y="150" width="160" height="150" rx="8" fill="#1e293b" stroke="#c084fc" strokeWidth="2" />
                <text x="520" y="180" textAnchor="middle" fill="#fff" fontWeight="bold">Node.js API Server</text>
                <text x="520" y="198" textAnchor="middle" fill="#d8b4fe" fontSize="10">Port 3000</text>
                <line x1="450" y1="210" x2="590" y2="210" stroke="#475569" />

                <rect x="455" y="225" width="130" height="55" rx="4" fill="#0f172a" stroke="#a855f7" />
                <text x="520" y="245" textAnchor="middle" fill="#f472b6" fontSize="9">/api/assistant Route</text>
                <text x="520" y="260" textAnchor="middle" fill="#a1a1aa" fontSize="8">(Prompt NLU Parser &amp; Sync)</text>

                {/* Connection to External Database & LLM */}
                <path d="M 520 150 L 520 100" fill="none" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="480" y="125" textAnchor="middle" fill="#93c5fd" fontSize="9">SQL Query</text>

                <rect x="440" y="45" width="160" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="520" y="75" textAnchor="middle" fill="#e0f2fe" fontWeight="bold">PostgreSQL Database</text>

                <path d="M 600 225 L 680 225" fill="none" stroke="#fb7185" strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="640" y="210" textAnchor="middle" fill="#fda4af" fontSize="9">TLS Key Auth</text>

                <rect x="680" y="175" width="100" height="100" rx="8" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
                <text x="730" y="215" textAnchor="middle" fill="#fff" fontWeight="bold">Google AI</text>
                <text x="730" y="235" textAnchor="middle" fill="#fecdd3" fontSize="10">Gemini 3.5</text>
                <text x="730" y="250" textAnchor="middle" fill="#fecdd3" fontSize="8">flash</text>

                {/* SVG Marker definition for arrows */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-white">System Layer Definitions</h3>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li><strong>Presentation Layer</strong>: Core SPA structured in Vite, React, Tailwind CSS, using Lucide vectors for aesthetic interface glyphs. Runs entirely on sandboxed client ports, keeping viewport size-observers robust.</li>
                <li><strong>Application Controller</strong>: Mounted Express backend receiving natural lang commands, managing state fallback triggers during configuration tests, and establishing secure, proxy-safe tunnels to Gemini APIs.</li>
                <li><strong>LLM Grounding &amp; Context</strong>: Feeds real-time workspace states (student tasks, course colors, and event metadata) into Gemini 3.5-flash context prompt templates. This prevents hallucinations and forces correct Course IDs match.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSegment === 'schema' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">DATABASE BLUEPRINT</span>
              <h1 className="text-2xl font-bold text-white mt-1">PostgreSQL Database Normalization &amp; Relations</h1>
              <p className="text-slate-400 mt-2 text-sm">
                Comprehensive data definitions including indexes, foreign key linkages, course bindings, and priority check constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 font-mono text-[11px]">
              {/* Table 1: Courses */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                  <span>TABLE: courses</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Primary Key</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li><span className="text-purple-400">id</span> UUID DEFAULT gen_random_uuid() PRIMARY KEY</li>
                  <li><span className="text-purple-400">code</span> VARCHAR(15) UNIQUE NOT NULL <span className="text-slate-500">(e.g., 'WIX1003')</span></li>
                  <li><span className="text-purple-400">name</span> VARCHAR(150) NOT NULL</li>
                  <li><span className="text-purple-400">lecturer</span> VARCHAR(100)</li>
                  <li><span className="text-purple-400">semester</span> VARCHAR(20)</li>
                  <li><span className="text-purple-400">credits</span> INTEGER CONSTRAINT val_credits CHECK (credits &gt; 0)</li>
                  <li><span className="text-purple-400">location</span> VARCHAR(100)</li>
                  <li><span className="text-purple-400">color</span> VARCHAR(30) DEFAULT 'emerald'</li>
                </ul>
                <div className="text-[9px] text-slate-500 mt-3 pt-2 border-t border-slate-900">
                  INDEX idx_courses_code ON courses(code);
                </div>
              </div>

              {/* Table 2: Tasks & Assignments */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                  <span>TABLE: tasks</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Linked UUIDs</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li><span className="text-purple-400">id</span> UUID PRIMARY KEY</li>
                  <li><span className="text-purple-400">course_id</span> UUID REFERENCES courses(id) ON DELETE CASCADE</li>
                  <li><span className="text-purple-400">title</span> VARCHAR(200) NOT NULL</li>
                  <li><span className="text-purple-400">priority</span> VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high'))</li>
                  <li><span className="text-purple-400">deadline</span> DATE NOT NULL</li>
                  <li><span className="text-purple-400">estimated_hours</span> NUMERIC(5,2) DEFAULT 0.00</li>
                  <li><span className="text-purple-400">progress</span> INTEGER CHECK (progress BETWEEN 0 AND 100)</li>
                  <li><span className="text-purple-400">status</span> VARCHAR(15) CHECK (status IN ('not_started', 'in_progress', 'completed'))</li>
                  <li><span className="text-purple-400">dependencies</span> UUID[] <span className="text-slate-500">(Self-referencing Array)</span></li>
                  <li><span className="text-purple-400">description</span> TEXT</li>
                </ul>
              </div>

              {/* Table 3: Calendar Events */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                  <span>TABLE: calendar_events</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Event Sync</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li><span className="text-purple-400">id</span> UUID PRIMARY KEY</li>
                  <li><span className="text-purple-400">course_id</span> UUID REFERENCES courses(id) ON DELETE SET NULL</li>
                  <li><span className="text-purple-400">title</span> VARCHAR(200) NOT NULL</li>
                  <li><span className="text-purple-400">date</span> DATE NOT NULL</li>
                  <li><span className="text-purple-400">start_time</span> TIME NOT NULL</li>
                  <li><span className="text-purple-400">end_time</span> TIME NOT NULL</li>
                  <li><span className="text-purple-400">location</span> VARCHAR(150)</li>
                  <li><span className="text-purple-400">category</span> VARCHAR(20) CHECK (category IN ('class', 'exam', 'meeting', 'study_session', 'other'))</li>
                  <li><span className="text-purple-400">recurring</span> VARCHAR(15) CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly'))</li>
                  <li><span className="text-purple-400">reminder_minutes</span> INTEGER DEFAULT 15</li>
                </ul>
              </div>

              {/* Table 4: Notes System */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                  <span>TABLE: notes</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Notion-Inspired</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  <li><span className="text-purple-400">id</span> UUID PRIMARY KEY</li>
                  <li><span className="text-purple-400">course_id</span> UUID REFERENCES courses(id)</li>
                  <li><span className="text-purple-400">folder_id</span> UUID REFERENCES folders(id) ON DELETE CASCADE</li>
                  <li><span className="text-purple-400">title</span> VARCHAR(200) NOT NULL DEFAULT 'Untitled'</li>
                  <li><span className="text-purple-400">content</span> TEXT <span className="text-slate-500">(Markdown / Drawing Base64 Stream)</span></li>
                  <li><span className="text-purple-400">tags</span> VARCHAR(50)[] <span className="text-slate-500">(Array of tags)</span></li>
                  <li><span className="text-purple-400">is_favorite</span> BOOLEAN DEFAULT FALSE</li>
                  <li><span className="text-purple-400">updated_at</span> TIMESTAMP WITH TIME ZONE DEFAULT NOW()</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSegment === 'api' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">REST / SOCKET INTERFACES</span>
              <h1 className="text-2xl font-bold text-white mt-1">REST API Contract &amp; Schema Validation</h1>
              <p className="text-slate-400 mt-2 text-sm">
                Exposed endpoints for mobile application syncing, class lists, markdown notebooks, and Aura intelligent action recommendation.
              </p>
            </div>

            {/* Simulated Swagger documentation */}
            <div className="space-y-4 text-xs font-mono">
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">POST</span>
                    <span className="text-white font-semibold">/api/assistant</span>
                  </div>
                  <span className="text-slate-500">Aura NLP Dispatcher</span>
                </div>
                <div className="p-4 bg-slate-900/60 space-y-2">
                  <p className="text-slate-400 text-[11px] mb-2 font-sans">
                    Analyses input messages against active student course IDs, generating formatted markdown discussions and confirmation hooks.
                  </p>
                  <div className="text-slate-400 text-[11px]">Request Body Schema:</div>
                  <pre className="bg-slate-950 p-3 rounded text-slate-300 text-[10px] whitespace-pre-wrap">
{`{
  "prompt": "Create an assignment due on July 29 for WIX1003",
  "context": {
    "courses": [ { "id": "course-1", "code": "WIX1003", "name": "Computer Systems" } ],
    "tasks": [],
    "events": []
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">GET</span>
                    <span className="text-white font-semibold">/api/courses</span>
                  </div>
                  <span className="text-slate-500">List Courses &amp; Progress</span>
                </div>
                <div className="p-4 bg-slate-900/60">
                  <p className="text-slate-400 text-[11px] font-sans mb-1">
                    Retrieves lists of active student courses, computing summaries for upcoming exams and note folder directories.
                  </p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase text-[9px]">PUT</span>
                    <span className="text-white font-semibold">/api/tasks/:id</span>
                  </div>
                  <span className="text-slate-500">Update Task Metadata</span>
                </div>
                <div className="p-4 bg-slate-900/60">
                  <p className="text-slate-400 text-[11px] font-sans">
                    Saves updated task parameters like progress percentages, status (Completed / In Progress), priority flags, or modified milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSegment === 'roadmap' && (
          <div className="space-y-6 max-w-4xl font-sans">
            <div>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">PROJECT TIMELINE</span>
              <h1 className="text-2xl font-bold text-white mt-1">Deployment Roadmap &amp; Scaling Plan</h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Step-by-step launch cycles to go from our high-fidelity React interactive portal to a production-scale college network.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-bold text-sm min-w-[70px]">M1: Foundation</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Core Modules &amp; Local Persistence Engine</h4>
                  <p className="text-[11px] text-slate-400">
                    Establish relational hooks between state libraries. Ensure robust fallback execution when API networks undergo maintenance or credentials require token replacement.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-emerald-400 font-bold text-sm min-w-[70px]">M2: AI Aura</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-1">Grounding Prompt Trees and JSON Schema Enforcement</h4>
                  <p className="text-[11px] text-slate-400">
                    Fine-tune AI agent parsing thresholds using schema validators. Rigorously optimize context payloads to keep API tokens lightweight and latency minimized.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-blue-400 font-bold text-sm min-w-[70px]">M3: Sync Cloud</div>
                <div>
                  <h4 className="text-xs font-bold text-purple-400 mb-1">PostgreSQL Transition &amp; JWT Authentication Integration</h4>
                  <p className="text-[11px] text-slate-400">
                    Supercharge client-only variables with cloud-hosted database pipelines and authentication controls (Google OAuth / Microsoft Live ID) for single sign-on networks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-sky-400 font-bold text-sm min-w-[70px]">M4: Scale</div>
                <div>
                  <h4 className="text-xs font-bold text-sky-400 mb-1">Offline Service Workers &amp; Collaboration Nodes</h4>
                  <p className="text-[11px] text-slate-400">
                    Implement browser offline queues allowing students to draft lecture notes and update Gantt bars in standard lecture basements with zero wifi. Auto sync on reconnect.
                  </p>
                </div>
              </div>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Rocket className="text-emerald-400 w-4 h-4" />
                Recommendations for Scalability
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                To prepare for campus deployment of over 10,000 active students: we suggest utilizing a Redis cache for course schedules to bypass redundant database queries, partition PostgreSQL tables chronologically (e.g., quarterly or semester-based), and implement rate-limit wrappers to secure Gemini server-side routes against traffic spikes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
