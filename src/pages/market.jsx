import React from "react";

export default function MarketPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Market</h1>
      <p className="text-purple-200">Buy and sell items with vendors.</p>
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

<div id="market" class="panel">
  <div class="col2">
    <div class="card">
      <div class="card-title">Shop — Vendor Stock</div>
      <div id="shopList"></div>
      <div style="margin-top:12px;font-size:12px;color:var(--text3);font-style:italic">
        Note: Business owners have personalized inventories based on what they can craft or trade for. Trades are limited to 1-time purchases; crafts require materials and time.
      </div>
    </div>
    <div class="card">
      <div class="card-title">Inventory</div>
      <div class="row" style="margin-bottom:12px;gap:8px;flex-wrap:wrap;">
        <span class="pill pill-gld">Gold: <span id="dispGold">50</span></span>
        <span class="pill pill-xp">XP: <span id="dispXP">10</span></span>
      </div>
      <div id="invList"></div>
    </div>
  </div>
</div>