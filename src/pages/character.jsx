import React from "react";

export default function CharacterPage() {
  // Safe React event handler placeholders
  const updateCharSheet = () => {};

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Characters</h1>
      <p className="text-purple-200 mb-6">Create and manage your characters.</p>

      {/* Main Layout Grid */}
      <div id="charbuilder" className="panel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT COLUMN: Identity + Stats */}
          <div>
            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-3">Identity</div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Character name</label>
                <input 
                  type="text" 
                  id="char-name" 
                  defaultValue="Unnamed Hero" 
                  className="bg-zinc-700 text-yellow-400 p-2 rounded w-full font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm mb-1">Species</label>
                  <select id="char-species" onChange={updateCharSheet} className="w-full bg-zinc-700 p-2 rounded"></select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Persona</label>
                  <select id="char-persona" onChange={updateCharSheet} className="w-full bg-zinc-700 p-2 rounded"></select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Persona rank (1–5)</label>
                <input 
                  type="number" 
                  id="char-persona-rank" 
                  defaultValue="1" 
                  min="1" 
                  max="5" 
                  onChange={updateCharSheet} 
                  className="w-full bg-zinc-700 p-2 rounded"
                />
              </div>
            </div>

            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-3">Core Stats</div>
              <div className="flex justify-around bg-zinc-900 p-4 rounded mb-3">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black" id="cs-bdy">0</span>
                  <span className="text-xs text-zinc-400 font-bold">BDY</span>
                  <input type="number" id="char-bdy" defaultValue="2" min="0" max="10" onChange={updateCharSheet} className="w-12 text-center bg-zinc-700 mt-2 p-1 rounded" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black" id="cs-spt">0</span>
                  <span className="text-xs text-zinc-400 font-bold">SPT</span>
                  <input type="number" id="char-spt" defaultValue="2" min="0" max="10" onChange={updateCharSheet} className="w-12 text-center bg-zinc-700 mt-2 p-1 rounded" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black" id="cs-mnd">0</span>
                  <span className="text-xs text-zinc-400 font-bold">MND</span>
                  <input type="number" id="char-mnd" defaultValue="2" min="0" max="10" onChange={updateCharSheet} className="w-12 text-center bg-zinc-700 mt-2 p-1 rounded" />
                </div>
              </div>
              <div id="char-pools" className="flex flex-wrap gap-2"></div>
            </div>

            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-2">Persona Abilities</div>
              <div id="char-persona-detail" className="text-sm text-zinc-400 italic"></div>
            </div>

            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-2">Species Traits</div>
              <div id="char-species-traits" className="text-sm"></div>
            </div>
          </div>

          {/* RIGHT COLUMN: Skills + Affinities */}
          <div>
            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-3 flex justify-between items-center">
                <span>Skills</span>
                <span className="text-xs text-zinc-400 font-mono">
                  XP spent: <span id="char-xp-spent">0</span>
                </span>
              </div>
              <div className="mb-3">
                <label className="block text-sm mb-1">Available XP</label>
                <input type="number" id="char-xp" defaultValue="15" min="0" max="200" onChange={updateCharSheet} className="w-20 bg-zinc-700 p-2 rounded" />
              </div>
              <div id="skill-list"></div>
            </div>

            <div className="card bg-zinc-800 p-4 rounded mb-4">
              <div className="card-title text-xl font-bold mb-3">Affinities</div>
              
              <div className="border-b border-zinc-700 text-sm font-bold text-zinc-400 mb-2 pb-1">Emotional</div>
              <div id="aff-emotional" className="leading-loose"></div>
              
              <div className="border-b border-zinc-700 text-sm font-bold text-zinc-400 mt-4 mb-2 pb-1">Primal Elemental</div>
              <div id="aff-primal" className="leading-loose"></div>
              
              <div className="border-b border-zinc-700 text-sm font-bold text-zinc-400 mt-4 mb-2 pb-1">Arcane</div>
              <div id="aff-arcane" className="leading-loose"></div>
              
              <div id="aff-selection-display" className="mt-3 text-xs text-zinc-400 italic"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}