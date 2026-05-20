// localStorage-backed mock API. Returns promises so call-sites mimic
// real HTTP usage and we can swap in a real backend later if needed.

import { db } from "./db.js";
import { generateBundle } from "./fakeData.js";
import { getIndustry } from "./industries.js";

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function pub(user) {
  if (!user) return null;
  const { password, ...rest } = user; // never leak password
  return rest;
}

export const api = {
  // ── Auth ───────────────────────────────────────────────────────
  async signup({ name, email, password, company }) {
    await delay();
    const users = db.get("users");
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("An account with that email already exists.");

    const user = db.insert("users", {
      id: `u_${Date.now()}`,
      name,
      email,
      password, // demo only — never store plaintext in real apps
      company: company || "",
      role: "admin",
      avatar: name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    });
    db.session.set({ userId: user.id });
    return pub(user);
  },

  async login({ email, password }) {
    await delay();
    const users = db.get("users");
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!user) throw new Error("Invalid email or password.");
    db.session.set({ userId: user.id });
    return pub(user);
  },

  logout() {
    db.session.clear();
  },

  me() {
    const { userId } = db.session.get();
    if (!userId) return null;
    return pub(db.get("users").find((u) => u.id === userId));
  },

  // ── Leads ──────────────────────────────────────────────────────
  listLeads() { return db.get("leads"); },
  createLead(data) { return db.insert("leads", { stage: "New", score: 50, ...data }); },
  updateLead(id, patch) { return db.update("leads", id, patch); },
  deleteLead(id) { db.remove("leads", id); },

  // ── Customers ──────────────────────────────────────────────────
  listCustomers() { return db.get("customers"); },
  createCustomer(data) { return db.insert("customers", { status: "Active", lifetime: 0, since: Date.now(), ...data }); },
  updateCustomer(id, patch) { return db.update("customers", id, patch); },
  deleteCustomer(id) { db.remove("customers", id); },

  // ── Deals ──────────────────────────────────────────────────────
  listDeals() { return db.get("deals"); },
  createDeal(data) { return db.insert("deals", { stage: "Qualification", probability: 30, ...data }); },
  updateDeal(id, patch) { return db.update("deals", id, patch); },
  deleteDeal(id) { db.remove("deals", id); },

  // ── Activities ─────────────────────────────────────────────────
  listActivities() { return db.get("activities"); },
  createActivity(data) { return db.insert("activities", { at: Date.now(), ...data }); },

  // ── Reps / Leaderboard ─────────────────────────────────────────
  listReps() { return db.get("reps"); },

  // ── Notifications ──────────────────────────────────────────────
  listNotifications() { return db.get("notifications"); },
  pushNotification(n) { return db.prepend("notifications", n); },
  markNotificationRead(id) {
    const list = db.get("notifications").map((n) => (n.id === id ? { ...n, read: true } : n));
    db.set("notifications", list);
  },
  markAllNotificationsRead() {
    db.set("notifications", db.get("notifications").map((n) => ({ ...n, read: true })));
  },
  clearNotifications() { db.set("notifications", []); },
  unreadNotificationCount() {
    return db.get("notifications").filter((n) => !n.read).length;
  },

  // ── Industry switching ─────────────────────────────────────────
  getIndustryId() { return db.industry.get(); },
  switchIndustry(id) {
    const ind = getIndustry(id);
    const bundle = generateBundle(ind);
    db.industry.set(id);
    db.merge(bundle);
    db.set("notifications", []);
    return ind;
  },
  regenerateData() {
    return this.switchIndustry(this.getIndustryId());
  },

  // ── Preferences ────────────────────────────────────────────────
  getPreferences() { return db.preferences.get(); },
  setPreferences(patch) { db.preferences.set(patch); return db.preferences.get(); },

  // ── Dashboard stats (computed) ────────────────────────────────
  dashboard() {
    const leads = db.get("leads");
    const customers = db.get("customers");
    const deals = db.get("deals");

    const open = deals.filter((d) => !["Won", "Lost"].includes(d.stage));
    const won = deals.filter((d) => d.stage === "Won");
    const pipelineValue = open.reduce((s, d) => s + (d.value || 0), 0);
    const wonValue = won.reduce((s, d) => s + (d.value || 0), 0);

    return {
      leads: leads.length,
      customers: customers.filter((c) => c.status === "Active").length,
      openDeals: open.length,
      pipelineValue,
      wonValue,
      winRate: deals.length ? Math.round((won.length / deals.length) * 100) : 0,
    };
  },
};
