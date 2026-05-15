import React from "react";

export default function ArenaPage() {
  return (
    <section className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Arena</h1>
      <p className="text-purple-200">Compete in battles and tournaments.</p>
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

<div id="arena" class="panel active">
  <div class="col2">

    /* C1 */
    <div class="card" id="c1card">
      <div class="card-title">Combatant I</div>
      <input> type="text" id="c1name" value="Kael" style="width:100%;margin-bottom:10px;font-family:var(--font-display);font-size:15px;color:var(--gold);" onchange="initCombat()"</input>
      <div class="col3" style="margin-bottom:10px">
        <div><label>BDY</label><input type="number" class="sm" id="c1bdy" value="3" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>SPT</label><input type="number" class="sm" id="c1spt" value="2" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>MND</label><input type="number" class="sm" id="c1mnd" value="1" min="0" max="10" onchange="initCombat()"></input></div>
      </div>
      <div class="col3" style="margin-bottom:10px">
        <div><label>Skill rank</label><input type="number" class="sm" id="c1sk" value="2" min="0" max="5" onchange="initCombat()"></input></div>
        <div><label>Wpn bonus</label><input type="number" class="sm" id="c1wdmg" value="2" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>Armor DR</label><input type="number" class="sm" id="c1dr" value="2" min="0" max="20"></input></div>
      </div>
      <div class="col3" style="margin-bottom:12px">
        <div><label>Defense</label>
          <select id="c1def">
            <option value="bdy">Block (BDY)</option>
            <option value="spt">Dodge (SPT)</option>
            <option value="mnd">Deflect (MND)</option>
          </select>
        </div>
        <div><label>Wpn weight</label>
          <select id="c1wtype">
            <option value="2">Medium (+2)</option>
            <option value="1">Light (+1)</option>
            <option value="4">Heavy (+4)</option>
            <option value="3">Reach (+3)</option>
          </select>
        </div>
        <div><label>Attack type</label>
          <select id="c1atype">
            <option>Slash</option><option>Stab</option><option>Bash</option><option>Throw</option>
          </select>
        </div>
      </div>
      <div id="c1bars"></div>
    </div>

    /* C2 */
    <div class="card" id="c2card">
      <div class="card-title">Combatant II</div>
      <input> type="text" id="c2name" value="Nyssa" style="width:100%;margin-bottom:10px;font-family:var(--font-display);font-size:15px;color:var(--gold);" onchange="initCombat()"</input>
      <div class="col3" style="margin-bottom:10px">
        <div><label>BDY</label><input type="number" class="sm" id="c2bdy" value="2" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>SPT</label><input type="number" class="sm" id="c2spt" value="3" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>MND</label><input type="number" class="sm" id="c2mnd" value="2" min="0" max="10" onchange="initCombat()"></input></div>
      </div>
      <div class="col3" style="margin-bottom:10px">
        <div><label>Skill rank</label><input type="number" class="sm" id="c2sk" value="1" min="0" max="5" onchange="initCombat()"></input></div>
        <div><label>Wpn bonus</label><input type="number" class="sm" id="c2wdmg" value="1" min="0" max="10" onchange="initCombat()"></input></div>
        <div><label>Armor DR</label><input type="number" class="sm" id="c2dr" value="1" min="0" max="20"></input></div>
      </div>
      <div class="col3" style="margin-bottom:12px">
        <div><label>Defense</label>
          <select id="c2def">
            <option value="spt">Dodge (SPT)</option>
            <option value="bdy">Block (BDY)</option>
            <option value="mnd">Deflect (MND)</option>
          </select>
        </div>
        <div><label>Wpn weight</label>
          <select id="c2wtype">
            <option value="1">Light (+1)</option>
            <option value="2">Medium (+2)</option>
            <option value="4">Heavy (+4)</option>
            <option value="3">Reach (+3)</option>
          </select>
        </div>
        <div><label>Attack type</label>
          <select id="c2atype">
            <option>Stab</option><option>Slash</option><option>Bash</option><option>Throw</option>
          </select>
        </div>
      </div>
      <div id="c2bars"></div>
    </div>
  </div>

  <div class="card">
    <div class="row" style="margin-bottom:12px">
      <span id="turnBadge">Round 1</span>
      <div class="flex1"></div>
      <button class="btn btn-gold" onclick="initCombat()">Reset</button>
      <button class="btn" onclick="stepTurn()">Next action</button>
      <button class="btn" onclick="simulate100()">Simulate ×100</button>
    </div>
    <div id="combatLog" class="log"><span class="log-info">Press Reset to initialise, then Next Action to step through combat.</span></div>
  </div>

  <div id="simResults" style="display:none">
    <div class="card">
      <div class="card-title">Simulation — 100 fights</div>
      <div class="col3" id="simOut"></div>
    </div>
  </div>
</div>