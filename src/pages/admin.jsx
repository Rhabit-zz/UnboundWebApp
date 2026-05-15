import React from "react";

export default function AdminPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Admin</h1>
      <p className="text-purple-200">Administrative controls and settings.</p>
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


<div id="admin" class="panel">
  <div class="col2">
    <div class="card">
      <div class="card-title">Resource Injection</div>
      <div class="row" style="margin-bottom:12px;">
        <div><label>Gold</label><input type="number" id="addGold" value="100" min="0"></input></div>
        <button class="btn" onclick="addResource('gold')">Add gold</button>
        <div><label>XP</label><input type="number" id="addXP" value="10" min="0"></input></div>
        <button class="btn" onclick="addResource('xp')">Add XP</button>
      </div>
      <div class="divider">Add Item</div>
      <div class="row" style="margin-bottom:12px;flex-wrap:wrap;">
        <select id="adminItem" style="flex:1;min-width:150px;">
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
        <div><label>Qty</label><input type="number" id="adminQty" value="1" min="1" max="99"></input></div>
        <button class="btn btn-gold" onclick="adminAddItem()">Add</button>
      </div>
      <div class="divider">Base Pools</div>
      <div class="col3" style="margin-bottom:12px;">
        <div><label>Base HP</label><input type="number" id="adminHP" value="8" min="1" onchange="applyAdminStats()"></input></div>
        <div><label>Base SP</label><input type="number" id="adminSP" value="8" min="1" onchange="applyAdminStats()"></input></div>
        <div><label>Base MP</label><input type="number" id="adminMP" value="8" min="1" onchange="applyAdminStats()"></input></div>
      </div>
      <div class="row">
        <button class="btn btn-blood" onclick="clearInventory()">Clear inventory</button>
        <button class="btn" onclick="resetAll()">Full reset</button>
      </div>
    </div>
    <div class="card">
      <div class="card-title">State Snapshot</div>
      <pre id="adminState" style="font-size:12px;font-family:var(--font-mono);color:var(--text3);line-height:1.9;white-space:pre-wrap;"></pre>
    </div>
  </div>
</div>