import React, { useState } from "react";

export default function ReferencePage() {
  // Navigation tabs to click through your massive rulebook sections
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <section className="p-8 text-white max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-2 tracking-wide text-zinc-100">System Reference Document</h1>
        <p className="text-purple-200 text-sm">Official TTRPG rulebook index and core mechanics repository.</p>
      </div>

      {/* Manual Document Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-px">
        <button 
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "rules" ? "border-yellow-500 text-yellow-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          📜 Core Rules
        </button>
        <button 
          onClick={() => setActiveTab("status")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "status" ? "border-purple-500 text-purple-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          ✨ Status Conditions
        </button>
        <button 
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === "skills" ? "border-purple-500 text-purple-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}
        >
          ⚒️ Profession & Craft Skills
        </button>
      </div>

      {/* CORE RULES TAB LAYER */}
      {activeTab === "rules" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-2xl font-black text-yellow-500">Core Engine Principles</h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">Section 1.0 — System Fundamentals</p>
          </div>
          
          <div className="space-y-4 max-w-4xl text-zinc-300 text-sm leading-relaxed">
            <p>
              Paste your first major block of your 28,000-word rulebook text here. You can separate long paragraphs cleanly using standard HTML spacing elements to create a natural, readable document layout.
            </p>
            <h3 className="text-lg font-bold text-zinc-100 mt-6 mb-2">1.1 Attribute Array Resolutions</h3>
            <p>
              Hard-code your physical and mental check rules here. For example: Actions require rolling SPT dice (+ Foraging skill rank as a flat bonus) vs a target material DC layer.
            </p>
          </div>
        </div>
      )}

      {/* STATUS CONDITIONS TAB LAYER */}
      {activeTab === "status" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-2xl font-black text-yellow-500">Status Condition Dictionary</h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">Section 2.0 — Tactical States</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card bg-zinc-800/40 p-4 rounded border border-zinc-800">
              <h3 className="font-bold text-red-400 text-base mb-1">Bleeding</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                Paste the precise rulebook definition for Bleeding here. Target suffers flat physical damage variables at the initiation phase of their turnaround sequence.
              </p>
            </div>
            
            <div className="card bg-zinc-800/40 p-4 rounded border border-zinc-800">
              <h3 className="font-bold text-blue-400 text-base mb-1">Stunned</h3>
              <p className="text-zinc-300 text-xs leading-relaxed">
                Target loses their next core action allocation module. Reactive actions and defense options suffer extreme penalty modifiers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROFESSION & CRAFT SKILLS TAB LAYER */}
      {activeTab === "skills" && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-2xl font-black text-purple-400">Capability Matrices</h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">Section 3.0 — Character Professions</p>
          </div>
          
          <div className="space-y-4 max-w-4xl text-zinc-300 text-sm leading-relaxed">
            <p>
              Paste your long-form text blocks detailing how crafting ranks, gathering check pools, and professional trade matrices operate. This avoids syncing data arrays over network wires completely.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}