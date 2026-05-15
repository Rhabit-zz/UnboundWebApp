import React from "react";

export default function GatheringPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Gathering</h1>
      <p className="text-purple-200 mb-6">Gather resources and materials.</p>

      {/* Valid JSX layout converted from raw HTML */}
      <div id="gather" className="panel grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-zinc-800 p-4 rounded mb-4">
          <div className="card-title text-xl font-bold mb-2">Gathering Zone — Ashwood Forest</div>
          <p className="text-sm text-zinc-400 italic mb-4">
            Roll SPT dice (+ Foraging skill rank as flat bonus) vs material DC.
          </p>
          <div className="mb-4">
            <div>
              <label className="block text-sm mb-1">Gathering action</label>
              <select id="gatherAction" className="w-full bg-zinc-700 p-2 rounded">
                <option value="forage">Forage (basic)</option>
              </select>
            </div>
          </div>
          <div id="gatherLog" className="bg-black/40 p-3 rounded max-h-[180px] overflow-y-auto font-mono text-xs">
            <span className="text-zinc-400">Enter the forest...</span>
          </div>
        </div>

        <div className="card bg-zinc-800 p-4 rounded mb-4">
          <div className="card-title text-xl font-bold mb-2">Zone Materials</div>
          <div id="matList"></div>
        </div>
      </div>
    </section>
  );
}