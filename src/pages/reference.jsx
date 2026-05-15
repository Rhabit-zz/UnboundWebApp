import React from "react";

export default function ReferencePage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">References</h1>
      <p className="text-purple-200">Game reference materials and guides.</p>
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

<div id="reference" class="panel">
  <div class="col2">
    <div>
      <div class="card">
        <div class="card-title">Status Effects</div>
        <div style="margin-bottom:10px">
          <select id="se-category" onchange="renderStatusEffects()" style="width:100%"></select>
        </div>
        <div id="se-list"></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-title">Skill Reference</div>
        <div style="margin-bottom:10px">
          <select id="skill-cat-ref" onchange="renderSkillRef()" style="width:100%"></select>
        </div>
        <div id="skill-ref-list"></div>
      </div>
      <div class="card">
        <div class="card-title">Affinity Quick Reference</div>
        <div style="margin-bottom:8px">
          <select id="aff-ref-domain" onchange="renderAffRef()" style="width:100%">
            <option value="emotional">Emotional</option>
            <option value="primal">Primal Elemental (Tier 1)</option>
            <option value="arcane">Arcane</option>
          </select>
        </div>
        <div id="aff-ref-list"></div>
      </div>
    </div>
  </div>
</div>