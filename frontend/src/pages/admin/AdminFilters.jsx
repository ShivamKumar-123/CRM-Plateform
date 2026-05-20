import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Play, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../../lib/api.js";
import { modalInput, ErrorBanner, Empty, Panel } from "./_shared.jsx";

const MODULES = [
  { id: "lead", label: "Leads" },
  { id: "deal", label: "Deals" },
  { id: "customer", label: "Customers" },
  { id: "task", label: "Tasks" },
];

const DEFAULT_AST = {
  op: "AND",
  children: [{ field: "status", op: "equals", value: "NEW" }],
};

/**
 * Visual filter builder.
 *
 * Tree state is the AST itself — `{op: "AND" | "OR" | "NOT", children: []}` for
 * groups, or `{field, op, value}` for leaves. Mutations walk a path array to
 * apply changes; this keeps things simple without a state library.
 */
export default function AdminFilters() {
  const [module, setModule] = useState("lead");
  const [meta, setMeta] = useState({ fields: [], operators_by_field: {} });
  const [ast, setAst] = useState(DEFAULT_AST);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.getFilterMeta(module).then(setMeta).catch(() => setMeta({ fields: [], operators_by_field: {} }));
    setResults(null);
  }, [module]);

  function run() {
    setRunning(true);
    setErr(null);
    api.runFilterQuery(module, ast, 200)
      .then(setResults)
      .catch((e) => setErr(e.message || "Query failed"))
      .finally(() => setRunning(false));
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Filter className="text-yellow-400" /> Advanced filter builder
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Nested AND / OR / NOT groups with 12 operators. Saves can be wired to Saved Views.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className={`${modalInput} max-w-[160px]`}
          >
            {MODULES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold disabled:opacity-50"
          >
            <Play size={14} /> {running ? "Running…" : "Run filter"}
          </button>
        </div>
      </header>

      {err && <ErrorBanner msg={err} onRetry={run} />}

      <Panel title="Filter tree" accent="text-yellow-300">
        <FilterNode
          node={ast}
          path={[]}
          fields={meta.fields}
          operatorsByField={meta.operators_by_field}
          onChange={(next) => setAst(next)}
          isRoot
        />
        <div className="text-[11px] text-gray-500 mt-4 font-mono break-all bg-black/40 border border-white/5 rounded-lg p-3">
          {JSON.stringify(ast)}
        </div>
      </Panel>

      <div className="h-6" />

      <Panel title={`Results${results ? ` (${results.count} matched)` : ""}`} accent="text-sky-300">
        {!results && <Empty msg="Run the filter to see results." />}
        {results && results.results.length === 0 && <Empty msg="No rows match this filter." />}
        {results && results.results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-3 py-2">#</th>
                  {previewCols(module).map((c) => (
                    <th key={c} className="text-left px-3 py-2">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={r.id} className="border-t border-white/5">
                    <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                    {previewCols(module).map((c) => (
                      <td key={c} className="px-3 py-2 text-gray-200 max-w-[200px] truncate">
                        {String(r[c] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function previewCols(module) {
  if (module === "lead" || module === "customer")
    return ["id", "name", "phone", "status", "score", "city"];
  if (module === "deal") return ["id", "status", "deal_value", "expected_close_date"];
  return ["id", "title", "status", "priority"];
}

function FilterNode({ node, path, fields, operatorsByField, onChange, isRoot }) {
  const isGroup = node?.op && ["AND", "OR", "NOT", "and", "or", "not"].includes(String(node.op));

  function patch(updater) {
    const next = JSON.parse(JSON.stringify(node));
    updater(next);
    onChange(next);
  }

  if (isGroup) return (
    <GroupNode
      node={node}
      path={path}
      fields={fields}
      operatorsByField={operatorsByField}
      onChange={onChange}
      isRoot={isRoot}
    />
  );

  return (
    <LeafNode
      node={node}
      fields={fields}
      operatorsByField={operatorsByField}
      onChange={(next) => patch(() => Object.assign(node, next))}
    />
  );
}

function GroupNode({ node, fields, operatorsByField, onChange, isRoot }) {
  const op = String(node.op || "AND").toUpperCase();
  const accent = op === "OR" ? "border-fuchsia-400/30 bg-fuchsia-400/[0.04]"
    : op === "NOT" ? "border-rose-400/30 bg-rose-400/[0.04]"
    : "border-yellow-400/30 bg-yellow-400/[0.04]";

  const setChild = (idx, next) => {
    const children = [...(node.children || [])];
    children[idx] = next;
    onChange({ ...node, children });
  };
  const removeChild = (idx) => {
    const children = [...(node.children || [])];
    children.splice(idx, 1);
    onChange({ ...node, children });
  };
  const addLeaf = () => {
    const f = fields[0] || "status";
    onChange({ ...node, children: [...(node.children || []), { field: f, op: "equals", value: "" }] });
  };
  const addGroup = () => {
    onChange({ ...node, children: [...(node.children || []), { op: "AND", children: [] }] });
  };

  return (
    <div className={`rounded-xl border ${accent} p-3 mb-2`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {["AND", "OR", "NOT"].map((g) => (
            <button
              key={g}
              onClick={() => onChange({ ...node, op: g })}
              className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                op === g ? "bg-yellow-400 text-black" : "bg-white/5 text-gray-300"
              }`}
            >
              {g}
            </button>
          ))}
          <span className="text-[10px] text-gray-500 ml-2">{(node.children || []).length} condition(s)</span>
        </div>
        <div className="flex gap-1">
          <button onClick={addLeaf} className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1">
            <Plus size={11} /> Condition
          </button>
          <button onClick={addGroup} className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 flex items-center gap-1">
            <Plus size={11} /> Group
          </button>
        </div>
      </div>
      <div className="space-y-2 pl-3 border-l border-white/10">
        {(node.children || []).map((child, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <FilterNode
                node={child}
                path={[...node.children, idx]}
                fields={fields}
                operatorsByField={operatorsByField}
                onChange={(next) => setChild(idx, next)}
              />
            </div>
            {!isRoot || (node.children || []).length > 1 ? (
              <button
                onClick={() => removeChild(idx)}
                className="text-gray-500 hover:text-red-400 mt-1.5"
                title="Remove"
              >
                <Trash2 size={14} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function LeafNode({ node, fields, operatorsByField, onChange }) {
  const ops = operatorsByField?.[node.field] || ["equals", "contains", "in", "not_in", "is_empty", "not_empty"];
  const showValue = !["is_empty", "not_empty"].includes(node.op);
  const isListOp = ["in", "not_in", "between"].includes(node.op);

  return (
    <div className="grid grid-cols-12 gap-2 items-center bg-black/30 border border-white/5 rounded-lg p-2">
      <select
        value={node.field || ""}
        onChange={(e) => onChange({ ...node, field: e.target.value })}
        className={`${modalInput} col-span-4`}
      >
        {fields.map((f) => <option key={f} value={f}>{f}</option>)}
      </select>
      <select
        value={node.op || "equals"}
        onChange={(e) => onChange({ ...node, op: e.target.value })}
        className={`${modalInput} col-span-3`}
      >
        {ops.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
      </select>
      {showValue ? (
        <input
          value={isListOp && Array.isArray(node.value) ? node.value.join(", ") : (node.value ?? "")}
          onChange={(e) => {
            const raw = e.target.value;
            const v = isListOp ? raw.split(",").map((s) => s.trim()).filter(Boolean) : raw;
            onChange({ ...node, value: v });
          }}
          placeholder={isListOp ? "comma, separated, values" : "value"}
          className={`${modalInput} col-span-5`}
        />
      ) : (
        <div className="col-span-5 text-xs text-gray-500 italic px-2">no value</div>
      )}
    </div>
  );
}
