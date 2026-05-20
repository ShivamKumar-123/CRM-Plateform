import { useEffect, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { LayoutDashboard, Plus, Save, Trash2 } from "lucide-react";
import { api } from "../../lib/api.js";
import { Panel, ErrorBanner, Empty } from "./_shared.jsx";

const ResponsiveGrid = WidthProvider(Responsive);

const WIDGET_TYPES = [
  { id: "kpi", label: "KPI card" },
  { id: "chart", label: "Chart" },
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Activity feed" },
  { id: "pipeline", label: "Pipeline" },
  { id: "leaderboard", label: "Leaderboard" },
];

const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

export default function AdminDashboardBuilder() {
  const [layouts, setLayouts] = useState([]);
  const [active, setActive] = useState(null);
  const [err, setErr] = useState(null);

  function load() {
    api.getDashboardLayouts()
      .then((data) => {
        setLayouts(data);
        if (data.length && !active) setActive(data[0]);
      })
      .catch((e) => setErr(e.message));
  }
  useEffect(load, []);

  async function createBlank() {
    const layout = await api.createDashboardLayout({
      name: "New layout " + (layouts.length + 1),
      layout: [],
      widgets: [],
    });
    setLayouts([layout, ...layouts]);
    setActive(layout);
  }

  function addWidget(type) {
    if (!active) return;
    const id = `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const widgets = [...(active.widgets || []), { id, type, config: {} }];
    const layout = [...(active.layout || []), { i: id, x: 0, y: Infinity, w: 4, h: 2 }];
    setActive({ ...active, widgets, layout });
  }

  function removeWidget(id) {
    const widgets = (active.widgets || []).filter((w) => w.id !== id);
    const layout = (active.layout || []).filter((l) => l.i !== id);
    setActive({ ...active, widgets, layout });
  }

  function onLayoutChange(_, all) {
    if (!active) return;
    setActive({ ...active, layout: all.lg || all.md || all.sm || [] });
  }

  async function save() {
    if (!active) return;
    try {
      const updated = await api.updateDashboardLayout(active.id, {
        name: active.name,
        layout: active.layout,
        widgets: active.widgets,
      });
      setLayouts(layouts.map((l) => (l.id === updated.id ? updated : l)));
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-yellow-400" /> Dashboard builder
          </h1>
          <p className="text-sm text-gray-400 mt-1">Drag, drop, resize. Save layouts per user or role.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={createBlank} className="px-3 py-2 text-xs rounded bg-white/5 text-yellow-300">
            <Plus size={12} className="inline" /> New layout
          </button>
          {active && (
            <button onClick={save} className="px-4 py-2 text-xs rounded bg-yellow-400 text-black font-bold">
              <Save size={12} className="inline" /> Save
            </button>
          )}
        </div>
      </header>

      {err && <ErrorBanner msg={err} />}

      <div className="grid lg:grid-cols-4 gap-4">
        <div>
          <Panel title="Layouts" accent="text-sky-300">
            {layouts.length === 0 ? <Empty msg="Create your first." /> : (
              <ul className="space-y-1">
                {layouts.map((l) => (
                  <li key={l.id}>
                    <button onClick={() => setActive(l)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded ${active?.id === l.id ? "bg-yellow-400 text-black font-bold" : "text-gray-300 hover:bg-white/5"}`}>
                      {l.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="h-4" />

          <Panel title="Add widget" accent="text-emerald-300">
            <div className="flex flex-col gap-1">
              {WIDGET_TYPES.map((w) => (
                <button key={w.id} onClick={() => addWidget(w.id)}
                  className="text-left text-xs px-2 py-1.5 rounded text-gray-300 hover:bg-white/5">
                  <Plus size={11} className="inline" /> {w.label}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-3">
          {!active ? <Empty msg="Pick or create a layout." /> : (
            <Panel title={
              <input value={active.name} onChange={(e) => setActive({ ...active, name: e.target.value })}
                className="bg-transparent border-b border-white/10 text-yellow-300 font-bold uppercase text-xs px-1" />
            } accent="text-yellow-300">
              {(active.widgets || []).length === 0 ? <Empty msg="Empty layout. Click 'Add widget'." /> : (
                <ResponsiveGrid
                  className="layout"
                  layouts={{ lg: active.layout || [] }}
                  cols={COLS}
                  rowHeight={50}
                  onLayoutChange={onLayoutChange}
                  draggableHandle=".widget-drag"
                >
                  {(active.widgets || []).map((w) => (
                    <div key={w.id} className="bg-white/5 border border-white/10 rounded-lg p-2 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <span className="widget-drag text-[10px] uppercase tracking-wider text-yellow-300 cursor-move">{w.type}</span>
                        <button onClick={() => removeWidget(w.id)} className="text-red-300"><Trash2 size={10} /></button>
                      </div>
                      <div className="text-xs text-gray-500">Widget · {w.id.slice(-6)}</div>
                    </div>
                  ))}
                </ResponsiveGrid>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
