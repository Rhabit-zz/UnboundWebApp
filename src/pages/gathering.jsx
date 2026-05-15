// src/main.jsx (snippet)
import React from "react";

export default function GatheringPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Gathering</h1>
      <p className="text-purple-200">Gather resources and materials.</p>
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
<div id="gather" class="panel">
  <div class="card">
    <div class="card-title">Gathering Zone — Ashwood Forest</div>
    <p style="font-size:13px;color:var(--text3);font-style:italic;margin-bottom:14px;">
      Roll SPT dice (+ Foraging skill rank as flat bonus) vs material DC.
    </p>
    <div class="row" style="margin-bottom:14px;">
      <div><label>Gathering action</label>
        <select id="gatherAction">
          <option value="forage">Forage (basic)</option>
        </select>
      </div>
    </div>
    <div id="gatherLog" class="log" style="max-height:180px;"><span class="log-info">Enter the forest...</span></div>
  </div>
  <div class="card">
    <div class="card-title">Zone Materials</div>
    <div id="matList"></div>
  </div>
</div>