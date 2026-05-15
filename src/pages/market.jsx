import React, { useState } from "react";
import { useGame } from "../context/GameContext";

// Catalog for setting up vendor slots
const INITIAL_VENDORS = [
  { id: "iron_sword", name: "Iron Longsword", cost: 25, type: "Weapon" },
  { id: "dagger", name: "Steel Dagger", cost: 12, type: "Weapon" },
  { id: "leather_vest", name: "Leather Vest", cost: 20, type: "Armor" },
  { id: "healing_herb", name: "Healing Herb", cost: 5, type: "Consumable" },
  { id: "remedy_potion", name: "Remedy Potion", cost: 15, type: "Consumable" }
];

export default function MarketPage() {
  const { inventory, updateGoldAndXP } = useGame();
  const [marketMessage, setMarketMessage] = useState("");

  const handlePurchase = (item) => {
    if (inventory.gold < item.cost) {
      setMarketMessage(`❌ Insufficient gold to purchase ${item.name}!`);
      setTimeout(() => setMarketMessage(""), 3000);
      return;
    }

    updateGoldAndXP(-item.cost, 0);
    setMarketMessage(`✅ Successfully configured ${item.name}!`);
    setTimeout(() => setMarketMessage(""), 3000);
  };

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Market</h1>
      <p className="text-purple-200 mb-6">Manage vendor setups and trade assets.</p>

      {marketMessage && (
        <div style={{ marginBottom: '14px', padding: '10px', background: 'var(--ink, #121214)', border: '1px solid var(--border, #27272a)', borderRadius: 'var(--radius, 4px)', fontSize: '13px', textAlign: 'center' }}>
          {marketMessage}
        </div>
      )}

      {/* RESTORED: Exact structural class names from your game stylesheet */}
      <div id="market" className="panel">
        <div className="col2">
          
          {/* Vendor Stock Setup Area */}
          <div className="card">
            <div className="card-title">Shop — Vendor Stock</div>
            <div id="shopList" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INITIAL_VENDORS.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 'var(--radius, 4px)', border: '1px solid var(--border, #27272a)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text3, #a1a1aa)', uppercase: 'true' }}>{item.type}</span>
                  </div>
                  <button 
                    onClick={() => handlePurchase(item)}
                    className="btn btn-gold"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    Set Up ({item.cost}g)
                  </button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text3)', fontStyle: 'italic' }}>
              Note: Business owners have personalized inventories based on what they can craft or trade for. Trades are limited to 1-time purchases; crafts require materials and time.
            </div>
          </div>

          {/* Persistent Inventory Hub */}
          <div className="card">
            <div className="card-title">Inventory</div>
            <div className="row" style={{ marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
              <span className="pill pill-gld">Gold: <span id="dispGold">{inventory.gold}</span></span>
              <span className="pill pill-xp">XP: <span id="dispXP">{inventory.xp}</span></span>
            </div>
            <div id="invList" style={{ fontSize: '13px', color: 'var(--text2, #e4e4e7)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              Vendor node setup channels active. Adjust currency properties via the Admin portal parameters to test transaction limits.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}