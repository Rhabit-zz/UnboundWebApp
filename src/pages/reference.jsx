import React from "react";

export default function ReferencePage() {
  // Safe React event handler placeholders
  const renderStatusEffects = () => {};
  const renderSkillRef = () => {};
  const renderAffRef = () => {};

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">References</h1>
      <p className="text-purple-200 mb-6">Game reference materials and guides.</p>

      {/* Embedded visual layout converted to clean React JSX syntax */}
      <div id="reference" className="panel grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Status Effects</div>
            <div className="mb-3">
              <select id="se-category" onChange={renderStatusEffects} className="w-full bg-zinc-700 p-2 rounded"></select>
            </div>
            <div id="se-list"></div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="card bg-zinc-800 p-4 rounded">
            <div className="card-title text-xl font-bold mb-2">Skill Reference</div>
            <div className="mb-3">
              <select id="skill-cat-ref" onChange={renderSkillRef} className="w-full bg-zinc-700 p-2 rounded"></select>
            </div>
            <div id="skill-ref-list"></div>
          </div>
          
          <div className="card bg-zinc-800 p-4 rounded">
            <div className="card-title text-xl font-bold mb-2">Affinity Quick Reference</div>
            <div className="mb-2">
              <select id="aff-ref-domain" onChange={renderAffRef} className="w-full bg-zinc-700 p-2 rounded">
                <option value="emotional">Emotional</option>
                <option value="primal">Primal Elemental (Tier 1)</option>
                <option value="arcane">Arcane</option>
              </select>
            </div>
            <div id="aff-ref-list"></div>
          </div>
        </div>
      </div>
    </section>
  );
}