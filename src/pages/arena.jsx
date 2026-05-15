import React from "react";

export default function ArenaPage() {
  // Safe React event handler placeholders
  const initCombat = () => {};
  const stepTurn = () => {};
  const simulate100 = () => {};

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Arena</h1>
      <p className="text-purple-200 mb-6">Compete in battles and tournaments.</p>

      {/* Main Layout Area */}
      <div id="arena" className="panel active grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Combatant I */}
          <div className="card bg-zinc-800 p-4 rounded" id="c1card">
            <div className="card-title text-xl font-bold mb-2 text-yellow-500">Combatant I</div>
            <input 
              type="text" 
              id="c1name" 
              defaultValue="Kael" 
              onChange={initCombat}
              className="w-full mb-3 bg-zinc-700 p-2 rounded text-yellow-400 font-bold" 
            />
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><label className="block text-xs text-zinc-400">BDY</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1bdy" defaultValue="3" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">SPT</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1spt" defaultValue="2" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">MND</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1mnd" defaultValue="1" min="0" max="10" onChange={initCombat} /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><label className="block text-xs text-zinc-400">Skill rank</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1sk" defaultValue="2" min="0" max="5" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">Wpn bonus</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1wdmg" defaultValue="2" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">Armor DR</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c1dr" defaultValue="2" min="0" max="20" /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-xs text-zinc-400">Defense</label>
                <select id="c1def" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option value="bdy">Block (BDY)</option>
                  <option value="spt">Dodge (SPT)</option>
                  <option value="mnd">Deflect (MND)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Wpn weight</label>
                <select id="c1wtype" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option value="2">Medium (+2)</option>
                  <option value="1">Light (+1)</option>
                  <option value="4">Heavy (+4)</option>
                  <option value="3">Reach (+3)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Attack type</label>
                <select id="c1atype" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option>Slash</option>
                  <option>Stab</option>
                  <option>Bash</option>
                  <option>Throw</option>
                </select>
              </div>
            </div>
            <div id="c1bars"></div>
          </div>

          {/* Combatant II */}
          <div className="card bg-zinc-800 p-4 rounded" id="c2card">
            <div className="card-title text-xl font-bold mb-2 text-yellow-500">Combatant II</div>
            <input 
              type="text" 
              id="c2name" 
              defaultValue="Nyssa" 
              onChange={initCombat}
              className="w-full mb-3 bg-zinc-700 p-2 rounded text-yellow-400 font-bold" 
            />
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><label className="block text-xs text-zinc-400">BDY</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2bdy" defaultValue="2" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">SPT</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2spt" defaultValue="3" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">MND</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2mnd" defaultValue="2" min="0" max="10" onChange={initCombat} /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div><label className="block text-xs text-zinc-400">Skill rank</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2sk" defaultValue="1" min="0" max="5" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">Wpn bonus</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2wdmg" defaultValue="1" min="0" max="10" onChange={initCombat} /></div>
              <div><label className="block text-xs text-zinc-400">Armor DR</label><input type="number" className="w-full bg-zinc-700 p-1 rounded text-center" id="c2dr" defaultValue="1" min="0" max="20" /></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-xs text-zinc-400">Defense</label>
                <select id="c2def" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option value="spt">Dodge (SPT)</option>
                  <option value="bdy">Block (BDY)</option>
                  <option value="mnd">Deflect (MND)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Wpn weight</label>
                <select id="c2wtype" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option value="1">Light (+1)</option>
                  <option value="2">Medium (+2)</option>
                  <option value="4">Heavy (+4)</option>
                  <option value="3">Reach (+3)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400">Attack type</label>
                <select id="c2atype" className="w-full bg-zinc-700 p-1 rounded text-sm">
                  <option>Stab</option>
                  <option>Slash</option>
                  <option>Bash</option>
                  <option>Throw</option>
                </select>
              </div>
            </div>
            <div id="c2bars"></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="card bg-zinc-800 p-4 rounded">
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <span id="turnBadge" className="bg-purple-900 text-purple-200 px-3 py-1 text-sm rounded font-bold">Round 1</span>
            <div className="flex-1"></div>
            <button className="bg-yellow-600 text-black font-medium px-4 py-1.5 rounded hover:bg-yellow-500" onClick={initCombat}>Reset</button>
            <button className="bg-zinc-700 px-4 py-1.5 rounded hover:bg-zinc-600" onClick={stepTurn}>Next action</button>
            <button className="bg-zinc-700 px-4 py-1.5 rounded hover:bg-zinc-600" onClick={simulate100}>Simulate ×100</button>
          </div>
          <div id="combatLog" className="bg-black/30 p-3 rounded font-mono text-xs max-h-40 overflow-y-auto">
            <span className="text-zinc-400">Press Reset to initialise, then Next Action to step through combat.</span>
          </div>
        </div>

        {/* Sim Results */}
        <div id="simResults" className="hidden">
          <div className="card bg-zinc-800 p-4 rounded">
            <div className="card-title text-xl font-bold mb-2">Simulation — 100 fights</div>
            <div className="grid grid-cols-3 gap-4" id="simOut"></div>
          </div>
        </div>
      </div>
    </section>
  );
}