import React from "react";
import { useGame } from "../context/GameContext";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  // Pull persistent game data directly from our global store context
  const { characters, speciesPresets, inventory } = useGame();

  return (
    <section className="p-8 text-white">
      {/* Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/40 via-zinc-900 to-zinc-900 border border-purple-500/20 rounded-xl">
        <h1 className="text-4xl font-black mb-2 tracking-wide text-zinc-100">Character Hub</h1>
        <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
          Welcome back to Unbound. This is your central command deck. Track your active progression parameters, manage asset records, and step directly into game activities below.
        </p>
      </div>

      {/* Overview Stat Widgets Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Wallet Balance</span>
          <div className="text-2xl font-black text-yellow-500 mt-1">{inventory.gold} <span className="text-xs font-normal text-zinc-500">Gold</span></div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Accumulated Pool</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{inventory.xp} <span className="text-xs font-normal text-zinc-500">XP</span></div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Active Characters</span>
          <div className="text-2xl font-black text-zinc-100 mt-1">{characters.length} <span className="text-xs font-normal text-zinc-500">Roster</span></div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg shadow-sm">
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Custom Genotypes</span>
          <div className="text-2xl font-black text-yellow-600 mt-1">{speciesPresets.length} <span className="text-xs font-normal text-zinc-500">Species</span></div>
        </div>
      </div>

      {/* Interface Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double Card Panel: Quick Jump Launch Deck */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-yellow-500">Quick Activities Launch Deck</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/gathering" className="p-3 bg-zinc-800/50 border border-zinc-800 hover:border-purple-500/40 rounded transition group">
                <div className="font-bold text-sm group-hover:text-yellow-400 transition">🌲 Forage & Gather</div>
                <p className="text-xs text-zinc-400 mt-1">Roll stats to extract valuable resources from active sectors.</p>
              </Link>
              <Link to="/crafting" className="p-3 bg-zinc-800/50 border border-zinc-800 hover:border-purple-500/40 rounded transition group">
                <div className="font-bold text-sm group-hover:text-yellow-400 transition">⚒️ Workshop Crafting</div>
                <p className="text-xs text-zinc-400 mt-1">Refine raw structural raw components into equipment items.</p>
              </Link>
              <Link to="/market" className="p-3 bg-zinc-800/50 border border-zinc-800 hover:border-purple-500/40 rounded transition group">
                <div className="font-bold text-sm group-hover:text-yellow-400 transition">🪙 Vendor Market</div>
                <p className="text-xs text-zinc-400 mt-1">Barter inventory drops with traders for premium gold pieces.</p>
              </Link>
              <Link to="/arena" className="p-3 bg-zinc-800/50 border border-zinc-800 hover:border-purple-500/40 rounded transition group">
                <div className="font-bold text-sm group-hover:text-yellow-400 transition">⚔️ Combat Arena</div>
                <p className="text-xs text-zinc-400 mt-1">Simulate tactical skirmishes between custom generated fighters.</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Card Panel: Summary State Lists */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Party Roster Preview</h2>
            {characters.length === 0 ? (
              <div className="text-xs text-zinc-500 italic p-4 text-center bg-zinc-950/40 rounded border border-zinc-800/50">
                No active character records detected in memory container. Use the sheet manager panel to initialize profiles.
              </div>
            ) : (
              <div className="space-y-2">
                {characters.map((char) => (
                  <div key={char.id} className="flex justify-between items-center bg-zinc-800/40 px-3 py-2 rounded text-xs border border-zinc-800">
                    <span className="font-bold text-zinc-200">{char.name || "Unnamed Hero"}</span>
                    <span className="text-yellow-600 font-mono">BDY {char.bdy || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}