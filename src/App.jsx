import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Page Imports
import HomePage from "./pages/home.jsx";
import SpeciesPage from "./pages/species.jsx";
import CharactersPage from "./pages/character.jsx";
import GatheringPage from "./pages/gathering.jsx";
import CraftingPage from "./pages/crafting.jsx";
import ArenaPage from "./pages/arena.jsx";
import MarketPage from "./pages/market.jsx";
import AdminPage from "./pages/admin.jsx";
import ProfilePage from "./pages/profile.jsx";
import ReferencesPage from "./pages/reference.jsx";
import WorkshopPage from "./pages/workshop.jsx";

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Container holding layout panels */}
      <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
        
        {/* SIDE PANEL NAVIGATION BAR */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-1 shrink-0">
          <div className="px-3 py-4 mb-4 border-b border-zinc-800">
            <h1 className="text-xl font-black tracking-wider text-yellow-500 uppercase">Unbound App</h1>
          </div>
          
          <nav className="flex flex-col gap-1 text-sm font-medium">
            <Link to="/" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Dashboard</Link>
            <Link to="/references" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Game Reference</Link>
            <Link to="/workshop" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Skill Workshop</Link>
            <Link to="/species" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Species Builder</Link>
            <Link to="/characters" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Characters</Link>
            <Link to="/gathering" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Gathering</Link>
            <Link to="/crafting" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Crafting</Link>
            <Link to="/market" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Market</Link>
            <Link to="/arena" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Arena</Link>
            <Link to="/profile" className="px-3 py-2 rounded hover:bg-zinc-800 hover:text-yellow-400 transition">Profile</Link>
            <Link to="/admin" className="px-3 py-2 mt-6 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition">Admin Controls</Link>
          </nav>
        </aside>

        {/* MAIN GAME INTERFACE VIEW */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-2">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/species" element={<SpeciesPage />} />
            <Route path="/gathering" element={<GatheringPage />} />
            <Route path="/crafting" element={<CraftingPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/references" element={<ReferencesPage />} />
            <Route path="/workshop" element={<WorkshopPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}