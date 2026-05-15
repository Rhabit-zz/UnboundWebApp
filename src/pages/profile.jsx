import React from "react";
import { useGame } from "../context/GameContext"; // Connect the data hook

export default function ProfilePage() {
  const { inventory } = useGame(); // Pull live data stream

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Character Hub</h1>
      <p className="text-purple-200">Current Gold: {inventory.gold} | XP: {inventory.xp}</p>
    </section>
  );
}