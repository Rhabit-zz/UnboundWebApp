import React from "react";
import { Link } from "react-router-dom";

// Mock database for your application announcements and version updates
const ANNOUNCEMENTS = [
  {
    id: 1,
    tag: "SYSTEM",
    tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    title: "Database Sync Engine Deployed",
    date: "May 14, 2026",
    excerpt: "Successfully finalized the secure GitHub REST API asset bridge. Central data schemas are now fetching seamlessly into the local environment pipeline.",
  },
  {
    id: 2,
    tag: "RULEBOOK",
    tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    title: "Section 2.0 Tactical States Revised",
    date: "May 12, 2026",
    excerpt: "Hard-coded dictionary updates pushed to the System Reference Document. Re-balanced status condition stack limits and defensive resolution modules.",
  },
  {
    id: 3,
    tag: "GAMEPLAY",
    tagColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    title: "Combat Simulator Balancing Alpha",
    date: "May 08, 2026",
    excerpt: "Updated weight multipliers for Heavy and Reach armaments inside the Arena logic blocks. Testing automated 100-round simulations for stat scaling.",
  }
];

export default function HomePage() {
  return (
    <section className="p-8 text-white max-w-7xl mx-auto space-y-8 animate-fadeIn">
      
      {/* 1. HERO BRAND BANNER */}
      <div className="relative overflow-hidden p-8 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30 border border-zinc-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-black tracking-widest text-purple-400 uppercase">Project Engine Array</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
            Welcome to Unbound
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
            Your centralized web portal for sandbox simulation testing, dataset management, and character sheet optimization. All modules are cleanly bound to local database nodes.
          </p>
        </div>
      </div>

      {/* 2. NEWS FEED SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <span className="text-yellow-500 text-lg">📡</span>
          <h2 className="text-xl font-bold tracking-wide uppercase text-zinc-300">System News & Log Feed</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {ANNOUNCEMENTS.map((news) => (
            <div 
              key={news.id} 
              className="flex flex-col justify-between p-5 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition duration-200 shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${news.tagColor} tracking-wider uppercase`}>
                    {news.tag}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{news.date}</span>
                </div>
                <h3 className="font-bold text-base text-zinc-200 group-hover:text-yellow-500 transition">
                  {news.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                  {news.excerpt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. APPLICATION TABS NAVIGATION DECK */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <div className="flex items-center gap-2 px-1">
          <span className="text-purple-500 text-lg">🎛️</span>
          <h2 className="text-xl font-bold tracking-wide uppercase text-zinc-300">Interface Modules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link to="/profile" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">🎴</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Character Hub</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Review active status parameters and wallet progression nodes.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/characters" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">📝</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Manage Sheets</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Configure core attribute blocks, assign skills, and calculate stat pools.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/species" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">🧬</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Species Builder</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Assemble biological matrices, map genotypes, and designate trait sets.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/gathering" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">🌲</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Forage & Gather</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Simulate node extraction checks vs regional material difficulty classes.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/crafting" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">⚒️</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Workshop Crafting</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Combine gathered resources using recipe formulas to forge equipment.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/market" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">🪙</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Vendor Market</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Test gold trade loops and configure customized vendor inventory arrays.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/arena" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">⚔️</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Combat Arena</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Execute multi-round tactical skirmishes to analyze character stat weight values.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

          <Link to="/references" className="group p-5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 rounded-lg shadow-md transition flex flex-col justify-between h-36">
            <div>
              <div className="text-2xl mb-2 group-hover:scale-110 transition origin-left">📜</div>
              <h3 className="font-bold text-sm text-zinc-200 group-hover:text-purple-400 transition">Game Reference</h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">Browse the static rulebook documentation index and tactical state tables.</p>
            </div>
            <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase mt-2 group-hover:translate-x-1 transition">Launch Deck →</span>
          </Link>

        </div>
      </div>
    </section>
  );
}