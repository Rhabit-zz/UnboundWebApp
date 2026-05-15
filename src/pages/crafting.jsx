// src/main.jsx (snippet)
import React from "react";

export default function CraftingPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Crafting</h1>
      <p className="text-purple-200">Craft items and equipment.</p>
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

<div id="crafting" class="panel">
  <div class="col2">
    <div>
      <div class="card">
        <div class="card-title">Crafting Workshop</div>
        <div style="margin-bottom:10px">
          <label>Recipe</label>
          <select id="craft-recipe" onchange="updateCraftPreview()" style="width:100%"></select>
        </div>
        <div style="margin-bottom:10px">
          <label>Profession</label>
          <select id="craft-profession" onchange="updateCraftPreview()" style="width:100%"></select>
        </div>
        <div class="row" style="margin-bottom:14px;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-gold" onclick="craftItem()">Craft Item</button>
          <button class="btn" onclick="updateCraftPreview()">Refresh</button>
        </div>
        <div id="craft-details" style="font-size:13px;color:var(--text2);"></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-title">Character Crafting Stats</div>
        <div id="craft-char-stats" style="font-size:13px;color:var(--text2);"></div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-title">Crafted Item Preview</div>
    <div id="craft-output" style="font-size:13px;color:var(--text2);padding:10px;"></div>
  </div>
  <div class="card">
    <div class="card-title">Crafted Item Library</div>
    <div id="crafted-library" style="font-size:13px;color:var(--text2);"></div>
    <div style="margin-top:12px;text-align:center">
      <button class="btn" onclick="saveCraftedEquipment()">Save Library</button>
      <button class="btn" onclick="loadCraftedEquipment()">Load Library</button>
    </div>
  </div>
</div>