import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";

interface ToolbarProps {
  onCommand: (command: string, value?: string) => void;
  activeButtons: string[];
  textAlign: "left" | "center" | "right" | "justify";
  onAlign: (align: "left" | "center" | "right" | "justify") => void;
  editorFont: string;
  onFontChange: (font: string) => void;
  editorSize: string;
  onSizeChange: (size: string) => void;
  editorColor: string;
  onColorChange: (color: string) => void;
  editorBgColor: string;
  onBgColorChange: (bgColor: string) => void;
}

export const Toolbar = ({
  onCommand,
  activeButtons,
  textAlign,
  onAlign,
  editorFont,
  onFontChange,
  editorSize,
  onSizeChange,
  editorColor,
  onColorChange,
  editorBgColor,
  onBgColorChange,
}: ToolbarProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const colors = [
    { name: "Dark Slate", value: "#1e293b" },
    { name: "Indigo Blue", value: "#2563eb" },
    { name: "Rose Red", value: "#e11d48" },
    { name: "Emerald Green", value: "#059669" },
    { name: "Amber Orange", value: "#d97706" },
  ];

  const highlights = [
    { name: "No Highlight", value: "transparent" },
    { name: "Yellow Glow", value: "#fef08a" },
    { name: "Rose Glow", value: "#fecdd3" },
    { name: "Emerald Glow", value: "#a7f3d0" },
    { name: "Blue Glow", value: "#bfdbfe" },
  ];

  const activeColor = colors.find((c) => c.value === editorColor) || colors[0];
  const activeHighlight = highlights.find((h) => h.value === editorBgColor) || highlights[0];

  return (
    <div className="relative flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-50/70 border border-slate-200/80 rounded-xl shadow-xs z-30 select-none max-w-full text-slate-700">
      {/* 1. Font Selector */}
      <div className="relative shrink-0">
        <select
          value={editorFont}
          onChange={(e) => onFontChange(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none hover:bg-slate-50 transition cursor-pointer appearance-none pr-6 min-w-[100px]"
          title="Typography Font"
        >
          <option value="'Outfit', sans-serif">Outfit</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="'Fira Sans', sans-serif">Fira Sans</option>
          <option value="'Fira Code', monospace">Fira Code</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
        </select>
        <ChevronDown className="w-3 h-3 text-slate-450 absolute right-2 top-2.5 pointer-events-none" />
      </div>

      {/* 2. Font Size Controls */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 font-mono text-[10px] font-bold shrink-0">
        <button
          type="button"
          onClick={() => onSizeChange(String(Math.max(8, parseInt(editorSize) - 1)))}
          className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition"
          title="Decrease Size"
        >
          -
        </button>
        <span className="px-1 text-slate-800 font-sans">{editorSize}pt</span>
        <button
          type="button"
          onClick={() => onSizeChange(String(Math.min(72, parseInt(editorSize) + 1)))}
          className="px-1.5 py-0.5 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition"
          title="Increase Size"
        >
          +
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200/80 mx-0.5 shrink-0" />

      {/* 3. Inline formatting controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onCommand("bold")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            activeButtons.includes("bold")
              ? "bg-indigo-550/10 text-indigo-700 font-bold"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onCommand("italic")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            activeButtons.includes("italic")
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onCommand("underline")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            activeButtons.includes("underline")
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onCommand("strikeThrough")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            activeButtons.includes("strikeThrough")
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Undo & Redo */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onCommand("undo")}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-200/60 text-slate-650 cursor-pointer transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onCommand("redo")}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-200/60 text-slate-650 cursor-pointer transition-colors"
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200/80 mx-0.5 shrink-0" />

      {/* 4. Text Colors Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
          }}
          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          title="Text Color"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: activeColor.value }}
          />
          {activeColor.name}
          <ChevronDown className="w-3 h-3 text-slate-450" />
        </button>

        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 mt-1 bg-white border border-slate-200/80 shadow-lg rounded-xl p-1.5 flex flex-col gap-1 z-40 min-w-[120px]"
            >
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    onColorChange(c.value);
                    onCommand("foreColor", c.value);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-slate-55 rounded-lg text-[10px] font-semibold text-slate-700 transition cursor-pointer"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-200 shrink-0"
                    style={{ backgroundColor: c.value }}
                  />
                  {c.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 5. Highlight Colors Dropdown */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
          }}
          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          title="Highlight Color"
        >
          <span
            className="w-2.5 h-2.5 rounded inline-block shrink-0 border border-slate-200"
            style={{
              backgroundColor:
                activeHighlight.value === "transparent"
                  ? "#ffffff"
                  : activeHighlight.value,
            }}
          />
          {activeHighlight.name}
          <ChevronDown className="w-3 h-3 text-slate-450" />
        </button>

        <AnimatePresence>
          {showHighlightPicker && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 mt-1 bg-white border border-slate-200/80 shadow-lg rounded-xl p-1.5 flex flex-col gap-1 z-40 min-w-[130px]"
            >
              {highlights.map((hl) => (
                <button
                  key={hl.value}
                  type="button"
                  onClick={() => {
                    onBgColorChange(hl.value);
                    onCommand("backColor", hl.value);
                    setShowHighlightPicker(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-slate-55 rounded-lg text-[10px] font-semibold text-slate-700 transition cursor-pointer"
                >
                  <span
                    className="w-3 h-3 rounded border border-slate-200 shrink-0 text-center text-[9px] font-bold text-slate-400 flex items-center justify-center"
                    style={{
                      backgroundColor:
                        hl.value === "transparent" ? "#ffffff" : hl.value,
                    }}
                  >
                    {hl.value === "transparent" && "×"}
                  </span>
                  {hl.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200/80 mx-0.5 shrink-0" />

      {/* 6. Block Formats: H1, H2, blockquote, HR */}
      <div className="flex items-center gap-0.5 shrink-0 text-[10px] font-extrabold">
        <button
          type="button"
          onClick={() => onCommand("formatBlock", "<h1>")}
          className="px-2 py-1 hover:bg-slate-200/60 rounded-md text-slate-700 transition cursor-pointer"
          title="H1 Title"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => onCommand("formatBlock", "<h2>")}
          className="px-2 py-1 hover:bg-slate-200/60 rounded-md text-slate-700 transition cursor-pointer"
          title="H2 Section"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => onCommand("formatBlock", "<blockquote>")}
          className="px-2.5 py-1 hover:bg-slate-200/60 rounded-md text-slate-700 font-serif transition cursor-pointer text-xs"
          title='Quote Block ("")'
        >
          ""
        </button>
        <button
          type="button"
          onClick={() => onCommand("insertHorizontalRule")}
          className="px-2 py-1 hover:bg-slate-200/60 rounded-md text-slate-700 transition cursor-pointer"
          title="Horizontal Rule"
        >
          —
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200/80 mx-0.5 shrink-0" />

      {/* 7. Alignments */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onAlign("left")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            textAlign === "left"
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Align Left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onAlign("center")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            textAlign === "center"
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Align Center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onAlign("right")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            textAlign === "right"
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Align Right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onAlign("justify")}
          className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
            textAlign === "justify"
              ? "bg-indigo-550/10 text-indigo-700"
              : "hover:bg-slate-200/60 text-slate-650"
          } cursor-pointer`}
          title="Justify Align"
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200/80 mx-0.5 shrink-0" />

      {/* 8. Lists */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onCommand("insertUnorderedList")}
          className="px-2 py-1 hover:bg-slate-200/60 rounded-md text-[10px] font-bold text-slate-700 transition cursor-pointer"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => onCommand("insertOrderedList")}
          className="px-2 py-1 hover:bg-slate-200/60 rounded-md text-[10px] font-bold text-slate-700 transition cursor-pointer"
          title="Ordered List"
        >
          1. List
        </button>
      </div>
    </div>
  );
};
