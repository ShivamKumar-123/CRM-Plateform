import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Folder, Edit3, Trash2, Eye, ThumbsUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../../lib/api.js";
import { modalInput, Field, ModalShell, ErrorBanner, Empty, Panel, StatusBadge } from "./_shared.jsx";

const STATUS_PALETTE = {
  DRAFT: "bg-gray-500 text-white",
  PUBLISHED: "bg-emerald-400 text-black",
  ARCHIVED: "bg-amber-500 text-black",
};

export default function AdminKnowledgeBase() {
  const [tab, setTab] = useState("articles");
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="text-yellow-400" /> Knowledge base
          </h1>
          <p className="text-sm text-gray-400 mt-1">Articles, guides, and FAQs for your customers + team.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
          {["articles", "categories"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs rounded ${tab === t ? "bg-yellow-400 text-black font-bold" : "text-gray-300"}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </header>
      {tab === "articles" ? <Articles /> : <Categories />}
    </div>
  );
}

function Articles() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState(null);
  const [err, setErr] = useState(null);
  const [search, setSearch] = useState("");

  function load() {
    api.getKbArticles(search).then(setItems).catch((e) => setErr(e.message));
    api.getKbCategories().then(setCategories).catch(() => {});
  }
  useEffect(load, [search]);

  function remove(id) {
    if (!confirm("Delete this article?")) return;
    api.deleteKbArticle(id).then(load).catch((e) => setErr(e.message));
  }

  return (
    <>
      {err && <ErrorBanner msg={err} />}
      <Panel
        title={
          <div className="flex items-center justify-between gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…"
              className={`${modalInput} text-xs max-w-xs`} />
            <button onClick={() => setCreating(true)}
              className="px-3 py-1.5 text-xs rounded bg-yellow-400 text-black font-bold">
              <Plus size={12} className="inline" /> New article
            </button>
          </div>
        }
        accent="text-yellow-300"
      >
        {items.length === 0 ? <Empty msg="No articles yet." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-white/5 border border-white/10 group relative">
                <StatusBadge status={a.status} palette={STATUS_PALETTE} />
                <div className="text-sm font-semibold mt-2 mb-1 line-clamp-2">{a.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-3">{a.excerpt || "—"}</div>
                <div className="text-[10px] text-gray-500 flex gap-3">
                  <span className="flex items-center gap-1"><Eye size={9} /> {a.view_count}</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={9} /> {a.helpful_count}</span>
                  <span>{a.category_name || "—"}</span>
                </div>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setPreview(a)} className="text-sky-300"><Eye size={12} /></button>
                  <button onClick={() => setEditing(a)} className="text-yellow-300"><Edit3 size={12} /></button>
                  <button onClick={() => remove(a.id)} className="text-red-300"><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <AnimatePresence>
        {(creating || editing) && (
          <ArticleModal
            article={editing}
            categories={categories}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); load(); }}
          />
        )}
        {preview && <PreviewModal article={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </>
  );
}

function ArticleModal({ article, categories, onClose, onSaved }) {
  const isEdit = !!article;
  const [form, setForm] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    body: article?.body || "",
    tags: article?.tags || "",
    category: article?.category || "",
    status: article?.status || "DRAFT",
    is_public: article?.is_public ?? true,
    is_featured: article?.is_featured ?? false,
  });
  const [err, setErr] = useState(null);
  const [tab, setTab] = useState("edit");

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const body = { ...form };
      if (!body.category) delete body.category;
      if (isEdit) await api.updateKbArticle(article.id, body);
      else await api.createKbArticle(body);
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }

  return (
    <ModalShell title={isEdit ? "Edit article" : "New article"} onClose={onClose} size="lg">
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <Field label="Title">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={modalInput} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={modalInput}>
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={modalInput}>
              {["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Tags (comma-separated)">
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={modalInput} />
          </Field>
        </div>
        <Field label="Excerpt (1-2 lines)">
          <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={modalInput} />
        </Field>
        <div className="flex gap-1 mb-2">
          {["edit", "preview"].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-3 py-1 text-xs rounded ${tab === t ? "bg-yellow-400 text-black font-bold" : "bg-white/5 text-gray-300"}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === "edit" ? (
          <textarea rows={14} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="# Markdown supported"
            className={`${modalInput} font-mono text-sm`} />
        ) : (
          <div className="prose-invert max-h-72 overflow-y-auto p-3 bg-black/30 rounded-lg border border-white/10 text-sm">
            <ReactMarkdown>{form.body || "_Nothing to preview._"}</ReactMarkdown>
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={form.is_public} onChange={(e) => setForm({ ...form, is_public: e.target.checked })} /> Public
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">{isEdit ? "Save" : "Create"}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function PreviewModal({ article, onClose }) {
  return (
    <ModalShell title={article.title} onClose={onClose} size="lg">
      <div className="prose-invert text-sm max-h-[70vh] overflow-y-auto">
        <ReactMarkdown>{article.body || ""}</ReactMarkdown>
      </div>
    </ModalShell>
  );
}

function Categories() {
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState(null);

  function load() { api.getKbCategories().then(setItems).catch((e) => setErr(e.message)); }
  useEffect(load, []);

  return (
    <>
      {err && <ErrorBanner msg={err} />}
      <Panel
        title={<div className="flex items-center justify-between"><span>Categories</span>
          <button onClick={() => setCreating(true)} className="px-2 py-1 text-xs rounded bg-yellow-400 text-black font-bold">
            <Plus size={12} className="inline" /> Add
          </button>
        </div>}
        accent="text-yellow-300"
      >
        {items.length === 0 ? <Empty msg="No categories yet." /> : (
          <div className="grid sm:grid-cols-3 gap-3">
            {items.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Folder size={16} className="text-yellow-400 mb-2" />
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-gray-500 mt-1">{c.article_count} article(s)</div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <AnimatePresence>
        {creating && <CategoryModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
      </AnimatePresence>
    </>
  );
}

function CategoryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [err, setErr] = useState(null);
  async function submit(e) {
    e.preventDefault(); setErr(null);
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await api.createKbCategory({ ...form, slug });
      onSaved();
    } catch (ex) { setErr(ex.message); }
  }
  return (
    <ModalShell title="New category" onClose={onClose}>
      {err && <ErrorBanner msg={err} />}
      <form onSubmit={submit} className="space-y-3">
        <Field label="Name"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={modalInput} /></Field>
        <Field label="Slug (auto if blank)"><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={modalInput} /></Field>
        <Field label="Description"><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={modalInput} /></Field>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm rounded bg-white/5">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-sm rounded bg-yellow-400 text-black font-bold">Create</button>
        </div>
      </form>
    </ModalShell>
  );
}
