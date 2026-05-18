import { useEffect, useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GitBranch, GripVertical, Check } from "lucide-react";
import { api } from "../../lib/api.js";
import { ErrorBanner, Panel } from "./_shared.jsx";
import { Header } from "./AdminUsers.jsx";

export default function AdminPipelines() {
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.getLeadPipeline().catch(() => []),
      api.getDealPipeline().catch(() => []),
    ]).then(([lead, deal]) => setPipelines([...(lead || []), ...(deal || [])]))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-6 md:p-8 space-y-5">
      <Header
        title="Pipelines"
        subtitle={`${pipelines.length} pipeline(s) — drag stages to reorder`}
        onRefresh={load}
        refreshing={loading}
        accent={GitBranch}
      />

      {error && <ErrorBanner msg={error} onRetry={load} />}

      <div className="space-y-5">
        {pipelines.map((p) => (
          <PipelineCard key={p.id} pipeline={p} onChange={load} />
        ))}
      </div>
    </div>
  );
}

function PipelineCard({ pipeline, onChange }) {
  const [stages, setStages] = useState(pipeline.stages || []);
  const [saving, setSaving] = useState(false);
  const [originalIds] = useState(() => (pipeline.stages || []).map((s) => s.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStages((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const dirty = stages.map((s) => s.id).join(",") !== originalIds.join(",");

  const save = async () => {
    setSaving(true);
    try {
      await api.reorderPipelineStages(
        pipeline.id,
        stages.map((s, i) => ({ id: s.id, order: i })),
      );
      onChange();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel full>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white">
            {pipeline.module.toUpperCase()} · {pipeline.name}
            {pipeline.is_default && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px]">
                DEFAULT
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stages.length} stage{stages.length !== 1 ? "s" : ""} — grab the handle and drag
          </p>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold text-sm inline-flex items-center gap-2"
          >
            <Check size={14} /> {saving ? "Saving…" : "Save order"}
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map((s) => (
              <SortableStage key={s.id} stage={s} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </Panel>
  );
}

function SortableStage({ stage }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        isDragging
          ? "bg-yellow-400/10 border-yellow-400/40"
          : "bg-white/5 border-white/10"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-yellow-400 flex-shrink-0"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{stage.name}</p>
        <p className="text-[10px] text-gray-500 font-mono">{stage.slug}</p>
      </div>
      {stage.is_closed_won && (
        <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-400/20 text-emerald-300">CLOSED WON</span>
      )}
      {stage.is_closed_lost && (
        <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-400/20 text-red-300">CLOSED LOST</span>
      )}
    </div>
  );
}
