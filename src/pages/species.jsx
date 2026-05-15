import React from "react";

export default function SpeciesPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Species</h1>
      <p className="text-purple-200">Explore and manage game species.</p>
    </section>
  );
}

const qc = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/reflections", element: <Reflections /> },
  { path: "/reflections/new", element: <NewReflection /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

<div id="speciesbuilder" class="panel">
  <div class="col2">

    <div>
      <div class="card">
        <div class="card-title">New Species</div>
        <div style="margin-bottom:10px"><label>Species name</label>
          <input> type="text" id="sb-name" value="New Species" style="font-family:var(--font-display);font-size:16px;color:var(--gold);"</input>
        </div>
        <div class="col2" style="margin-bottom:10px">
          <div><label>Biology type</label>
            <select id="sb-biology" onchange="updateSpeciesPreview()"></select>
          </div>
          <div><label>Morphotype</label>
            <select id="sb-morpho" onchange="updateSpeciesPreview()"></select>
          </div>
        </div>
        <div class="col2" style="margin-bottom:10px">
          <div><label>Size</label>
            <select id="sb-size" onchange="updateSpeciesPreview()">
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
            </select>
          </div>
          <div><label>Diet</label>
            <select id="sb-diet">
              <option value="omnivore">Omnivore</option>
              <option value="herbivore">Herbivore</option>
              <option value="carnivore">Carnivore</option>
              <option value="photosynthetic">Photosynthetic</option>
              <option value="parasitic">Parasitic</option>
            </select>
          </div>
        </div>
        <div><label>Lore / description</label>
          <textarea id="sb-lore" rows="3" style="width:100%;resize:vertical;" placeholder="Optional lore text..."></textarea>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Core Traits (from biology type)</div>
        <div id="sb-core-traits" style="font-size:13px;color:var(--text3);font-style:italic;"></div>
      </div>

      <div class="card">
        <div class="card-title">Additional Traits</div>
        <div id="sb-trait-picker" style="line-height:2.4;"></div>
      </div>
    </div>

    <div>
      <div class="card">
        <div class="card-title">Equipment Slots (from morphotype)</div>
        <div id="sb-slots" style="font-size:13px;"></div>
      </div>

      <div class="card">
        <div class="card-title">Species Preview</div>
        <div id="sb-preview" style="font-size:13px;color:var(--text2);"></div>
        <div style="margin-top:14px">
          <button class="btn btn-gold" onclick="exportSpecies()">Export JSON</button>
          <button class="btn" onclick="saveSpeciesAsPreset()">Save as preset</button>
        </div>
        <pre id="sb-json" style="display:none;margin-top:12px;font-size:11px;font-family:var(--font-mono);color:var(--text3);background:var(--ink);padding:12px;border-radius:var(--radius);border:1px solid var(--border);overflow-x:auto;white-space:pre-wrap;"></pre>
      </div>

      <div class="card">
        <div class="card-title">Existing Species — browse</div>
        <div id="existing-species-grid" class="species-grid"></div>
      </div>
    </div>
  </div>
</div>