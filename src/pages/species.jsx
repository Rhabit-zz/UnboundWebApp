import React from "react";

export default function SpeciesPage() {
  const updateSpeciesPreview = () => {};
  const exportSpecies = () => {};
  const saveSpeciesAsPreset = () => {};

  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Species</h1>
      <p className="text-purple-200 mb-6">Explore and manage game species.</p>

      <div id="speciesbuilder" className="panel grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">New Species</div>
            <div className="mb-3">
              <label className="block text-sm">Species name</label>
              <input type="text" id="sb-name" defaultValue="New Species" className="bg-zinc-700 text-yellow-400 p-2 rounded w-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm">Biology type</label>
                <select id="sb-biology" onChange={updateSpeciesPreview} className="bg-zinc-700 p-2 rounded w-full"></select>
              </div>
              <div>
                <label className="block text-sm">Morphotype</label>
                <select id="sb-morpho" onChange={updateSpeciesPreview} className="bg-zinc-700 p-2 rounded w-full"></select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-sm">Size</label>
                <select id="sb-size" onChange={updateSpeciesPreview} defaultValue="medium" className="bg-zinc-700 p-2 rounded w-full">
                  <option value="tiny">Tiny</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="huge">Huge</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Diet</label>
                <select id="sb-diet" className="bg-zinc-700 p-2 rounded w-full">
                  <option value="omnivore">Omnivore</option>
                  <option value="herbivore">Herbivore</option>
                  <option value="carnivore">Carnivore</option>
                  <option value="photosynthetic">Photosynthetic</option>
                  <option value="parasitic">Parasitic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm">Lore / description</label>
              <textarea id="sb-lore" rows="3" className="w-full bg-zinc-700 p-2 rounded resize-y" placeholder="Optional lore text..."></textarea>
            </div>
          </div>

          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Core Traits (from biology type)</div>
            <div id="sb-core-traits" className="text-sm italic text-zinc-400"></div>
          </div>

          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Additional Traits</div>
            <div id="sb-trait-picker"></div>
          </div>
        </div>

        <div>
          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Equipment Slots (from morphotype)</div>
            <div id="sb-slots" className="text-sm"></div>
          </div>

          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Species Preview</div>
            <div id="sb-preview" className="text-sm text-zinc-300"></div>
            <div className="mt-4 flex gap-2">
              <button className="bg-yellow-600 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500" onClick={exportSpecies}>Export JSON</button>
              <button className="bg-zinc-700 px-4 py-2 rounded hover:bg-zinc-600" onClick={saveSpeciesAsPreset}>Save as preset</button>
            </div>
            <pre id="sb-json" className="hidden mt-3 p-3 bg-black text-xs rounded overflow-x-auto whitespace-pre-wrap"></pre>
          </div>

          <div className="card bg-zinc-800 p-4 rounded mb-4">
            <div className="card-title text-xl font-bold mb-2">Existing Species — browse</div>
            <div id="existing-species-grid" className="species-grid"></div>
          </div>
        </div>
      </div>
    </section>
  );
}