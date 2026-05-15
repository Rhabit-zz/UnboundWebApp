import React, { useState } from "react";
import { useGame } from "../context/GameContext"; 

export default function AdminPage() {
  const { inventory, updateGoldAndXP, resetAllData } = useGame();
  
  const [goldInput, setGoldInput] = useState(100);
  const [xpInput, setXpInput] = useState(10);

  const adminAddItem = () => {};
  const applyAdminStats = () => {};
  const clearInventory = () => {};

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Admin</h1>
      <p className="text-purple-200 mb-6">Administrative controls and settings.</p>

      <div id="admin" className="panel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-3">Resource Injection</div>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Gold Amount</label>
                <input 
                  type="number" 
                  value={goldInput} 
                  onChange={(e) => setGoldInput(Number(e.target.value))}
                  className="w-20 bg-zinc-700 p-1.5 rounded text-white" 
                />
              </div>
              <button 
                className="bg-yellow-600 text-black font-semibold px-3 py-1.5 rounded hover:bg-yellow-500 text-sm" 
                onClick={() => updateGoldAndXP(goldInput, 0)}
              >
                Inject Gold
              </button>
              
              <div>
                <label className="block text-xs text-zinc-400 mb-1">XP Amount</label>
                <input 
                  type="number" 
                  value={xpInput} 
                  onChange={(e) => setXpInput(Number(e.target.value))}
                  className="w-20 bg-zinc-700 p-1.5 rounded text-white" 
                />
              </div>
              <button 
                className="bg-purple-600 text-white font-semibold px-3 py-1.5 rounded hover:bg-purple-500 text-sm" 
                onClick={() => updateGoldAndXP(0, xpInput)}
              >
                Inject XP
              </button>
            </div>

            <div className="border-b border-zinc-700 text-sm font-bold text-zinc-400 mb-3 pb-1">Add Item</div>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <select id="adminItem" className="flex-1 min-w-[150px] bg-zinc-700 p-1.5 rounded text-sm text-white">
                <option value="iron_sword">Iron Longsword</option>
                <option value="dagger">Dagger</option>
                <option value="greatsword">Greatsword</option>
                <option value="oak_staff">Oak Staff</option>
                <option value="leather_vest">Leather Vest</option>
                <option value="chain_shirt">Chain Shirt</option>
                <option value="healing_herb">Healing Herb</option>
                <option value="remedy_potion">Remedy Potion</option>
                <option value="iron_ore">Iron Ore</option>
                <option value="void_shard">Void Shard (rare)</option>
              </select>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Qty</label>
                <input type="number" id="adminQty" defaultValue="1" min="1" max="99" className="w-16 bg-zinc-700 p-1.5 rounded text-white" />
              </div>
              <button className="bg-yellow-600 text-black font-medium px-4 py-1.5 rounded hover:bg-yellow-500 text-sm" onClick={adminAddItem}>Add</button>
            </div>

            <div className="border-b border-zinc-700 text-sm font-bold text-zinc-400 mb-3 pb-1">Base Pools</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Base HP</label>
                <input type="number" id="adminHP" defaultValue="8" min="1" onChange={applyAdminStats} className="w-full bg-zinc-700 p-1.5 rounded text-center text-white" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Base SP</label>
                <input type="number" id="adminSP" defaultValue="8" min="1" onChange={applyAdminStats} className="w-full bg-zinc-700 p-1.5 rounded text-center text-white" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Base MP</label>
                <input type="number" id="adminMP" defaultValue="8" min="1" onChange={applyAdminStats} className="w-full bg-zinc-700 p-1.5 rounded text-center text-white" />
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-sm font-semibold" onClick={clearInventory}>Clear inventory</button>
              <button className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-sm font-semibold" onClick={resetAllData}>Full reset</button>
            </div>
          </div>

          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Live Application State Snapshot</div>
            <pre className="text-xs font-mono text-green-400 bg-black/50 p-4 rounded leading-relaxed whitespace-pre-wrap">
              {JSON.stringify({ inventory }, null, 2)}
            </pre>
          </div>

        </div>
      </div>
    </section>
  );
}