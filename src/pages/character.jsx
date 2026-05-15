import React from "react";

export default function CharacterPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Characters</h1>
      <p className="text-purple-200">Create and manage your characters.</p>
    </section>
  );
}
import { Navigate } from "react-router-dom";

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

<div id="charbuilder" class="panel">
  <div class="col2">

    /* LEFT: identity + stats */
    <div>
      <div class="card">
        <div class="card-title">Identity</div>
        <div style="margin-bottom:10px"><label>Character name</label>
          <input> type="text" id="char-name" value="Unnamed Hero" style="font-family:var(--font-display);font-size:16px;color:var(--gold);" </input>
        </div>
        <div class="col2" style="margin-bottom:10px">
          <div><label>Species</label>
            <select id="char-species" onchange="updateCharSheet()"></select>
          </div>
          <div><label>Persona</label>
            <select id="char-persona" onchange="updateCharSheet()"></select>
          </div>
        </div>
        <div><label>Persona rank (1–5)</label>
          <input> type="number" id="char-persona-rank" value="1" min="1" max="5" onchange="updateCharSheet()"</input>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Core Stats</div>
        <div class="stat-block">
          <div class="stat-box">
            <span class="stat-val" id="cs-bdy">0</span>
            <span class="stat-lbl">BDY</span>
            <input> type="number" id="char-bdy" value="2" min="0" max="10" style="width:50px;margin-top:6px;text-align:center;" onchange="updateCharSheet()"</input>
          </div>
          <div class="stat-box">
            <span class="stat-val" id="cs-spt">0</span>
            <span class="stat-lbl">SPT</span>
            <input> type="number" id="char-spt" value="2" min="0" max="10" style="width:50px;margin-top:6px;text-align:center;" onchange="updateCharSheet()"</input>
          </div>
          <div class="stat-box">
            <span class="stat-val" id="cs-mnd">0</span>
            <span class="stat-lbl">MND</span>
            <input> type="number" id="char-mnd" value="2" min="0" max="10" style="width:50px;margin-top:6px;text-align:center;" onchange="updateCharSheet()"</input >
          </div>
        </div>
        <div id="char-pools" class="row" style="gap:6px;flex-wrap:wrap;"></div>
      </div>

      <div class="card">
        <div class="card-title">Persona Abilities</div>
        <div id="char-persona-detail" style="font-size:13px;color:var(--text2);font-style:italic;"></div>
      </div>

      <div class="card">
        <div class="card-title">Species Traits</div>
        <div id="char-species-traits" style="font-size:13px;"></div>
      </div>
    </div>

    /*RIGHT: skills + affinities */
    <div>
      <div class="card">
        <div class="card-title">Skills
          <span style="float:right;font-family:var(--font-mono);font-size:11px;color:var(--text3)">
            XP spent: <span id="char-xp-spent">0</span>
          </span>
        </div>
        <div style="margin-bottom:10px">
          <label>Available XP</label>
          <input> type="number" id="char-xp" value="15" min="0" max="200" onchange="updateCharSheet()" style="width:70px;"</input>
        </div>
        <div id="skill-list"></div>
      </div>

      <div class="card">
        <div class="card-title">Affinities</div>
        <div class="divider">Emotional</div>
        <div id="aff-emotional" style="line-height:2.2;"></div>
        <div class="divider">Primal Elemental</div>
        <div id="aff-primal" style="line-height:2.2;"></div>
        <div class="divider">Arcane</div>
        <div id="aff-arcane" style="line-height:2.2;"></div>
        <div style="margin-top:12px;font-size:12px;color:var(--text3);font-style:italic;" id="aff-selection-display"></div>
      </div>
    </div>
  </div>
</div>