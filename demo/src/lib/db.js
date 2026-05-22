// Tiny localStorage-backed "database" for the demo.
// All collections are stored under a single namespaced root, so the
// "Reset Demo" button can wipe everything in one shot.

const ROOT_KEY = "crm_demo_v1";

function loadRoot() {
  try {
    const raw = localStorage.getItem(ROOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveRoot(state) {
  localStorage.setItem(ROOT_KEY, JSON.stringify(state));
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Seed data ────────────────────────────────────────────────────
function seed() {
  const now = Date.now();
  const day = 86_400_000;

  const hour = 3_600_000;
  return {
    users: [
      { id: "u_demo",   name: "Demo User",     email: "demo@demo.com",         password: "demo123", company: "Acme Solar", role: "OWNER",   avatar: "DU", status: "Active",   createdAt: now - 30 * day, lastLogin: now - 1 * hour },
      { id: "u_priya",  name: "Priya Sharma",  email: "priya@acmesolar.in",                          company: "Acme Solar", role: "ADMIN",   avatar: "PS", status: "Active",   createdAt: now - 25 * day, lastLogin: now - 2 * day },
      { id: "u_aarav",  name: "Aarav Khanna",  email: "aarav@acmesolar.in",                          company: "Acme Solar", role: "MANAGER", avatar: "AK", status: "Active",   createdAt: now - 18 * day, lastLogin: now - 1 * day },
      { id: "u_meera",  name: "Meera Joshi",   email: "meera@acmesolar.in",                          company: "Acme Solar", role: "SALES",   avatar: "MJ", status: "Active",   createdAt: now - 12 * day, lastLogin: now - 4 * hour },
      { id: "u_karan",  name: "Karan Bedi",    email: "karan@acmesolar.in",                          company: "Acme Solar", role: "SALES",   avatar: "KB", status: "Active",   createdAt: now - 8 * day,  lastLogin: now - 2 * hour },
      { id: "u_sanya",  name: "Sanya Rao",     email: "sanya@acmesolar.in",                          company: "Acme Solar", role: "SALES",   avatar: "SR", status: "Inactive", createdAt: now - 5 * day,  lastLogin: now - 9 * day },
      { id: "u_rohan",  name: "Rohan Verma",   email: "rohan@acmesolar.in",                          company: "Acme Solar", role: "SUPPORT", avatar: "RV", status: "Active",   createdAt: now - 14 * day, lastLogin: now - 1 * hour },
    ],
    pipelineStages: {
      lead: [
        { id: "ls1", slug: "NEW",            label: "New",            color: "#38bdf8", order: 1 },
        { id: "ls2", slug: "CONTACTED",      label: "Contacted",      color: "#60a5fa", order: 2 },
        { id: "ls3", slug: "QUALIFIED",      label: "Qualified",      color: "#a78bfa", order: 3 },
        { id: "ls4", slug: "PROPOSAL_SENT",  label: "Proposal Sent",  color: "#facc15", order: 4 },
        { id: "ls5", slug: "NEGOTIATION",    label: "Negotiation",    color: "#f59e0b", order: 5 },
        { id: "ls6", slug: "WON",            label: "Won",            color: "#22c55e", order: 6 },
        { id: "ls7", slug: "LOST",           label: "Lost",           color: "#ef4444", order: 7 },
      ],
      deal: [
        { id: "ds1", slug: "QUALIFICATION", label: "Qualification", color: "#a78bfa", order: 1 },
        { id: "ds2", slug: "PROPOSAL",      label: "Proposal",      color: "#facc15", order: 2 },
        { id: "ds3", slug: "NEGOTIATION",   label: "Negotiation",   color: "#f59e0b", order: 3 },
        { id: "ds4", slug: "WON",           label: "Won",           color: "#22c55e", order: 4 },
        { id: "ds5", slug: "LOST",          label: "Lost",          color: "#ef4444", order: 5 },
      ],
    },
    customFields: [
      { id: uid("cf"), module: "lead", label: "Roof Type",     slug: "roof_type",     type: "select", options: ["Concrete", "Metal Sheet", "Tile", "Asbestos"], required: false, createdAt: now - 20 * day },
      { id: uid("cf"), module: "lead", label: "Property Area (sq ft)", slug: "area",  type: "number", required: true,  createdAt: now - 18 * day },
      { id: uid("cf"), module: "lead", label: "Backup Required",      slug: "backup", type: "boolean", required: false, createdAt: now - 14 * day },
      { id: uid("cf"), module: "deal", label: "Net Metering",         slug: "net_meter", type: "boolean", required: true, createdAt: now - 12 * day },
      { id: uid("cf"), module: "deal", label: "GST Number",           slug: "gstin",  type: "text", required: false, createdAt: now - 10 * day },
      { id: uid("cf"), module: "deal", label: "Subsidy Eligible",     slug: "subsidy", type: "select", options: ["Yes — Residential", "Yes — Commercial", "No"], required: false, createdAt: now - 8 * day },
    ],
    automationRules: [
      { id: uid("ar"), name: "Auto-assign hot leads",  trigger: "Lead score ≥ 70",            action: "Assign to senior sales rep + send WhatsApp",     enabled: true,  runs: 142, lastRun: now - 1 * hour },
      { id: uid("ar"), name: "Welcome new leads",      trigger: "Lead created",               action: "Send WhatsApp template 'welcome_v2'",            enabled: true,  runs: 318, lastRun: now - 30 * 60_000 },
      { id: uid("ar"), name: "Stale deal reminder",    trigger: "Deal idle for 7 days",       action: "Notify assignee + create follow-up task",        enabled: true,  runs: 64,  lastRun: now - 6 * hour },
      { id: uid("ar"), name: "Lost-deal feedback",     trigger: "Deal moved to Lost",         action: "Send feedback form to customer email",           enabled: false, runs: 12,  lastRun: now - 4 * day },
      { id: uid("ar"), name: "High-value deal alert",  trigger: "Deal value ≥ ₹10,00,000",    action: "Notify all managers + add to executive review", enabled: true,  runs: 8,   lastRun: now - 12 * hour },
      { id: uid("ar"), name: "Payment reminder",       trigger: "Invoice unpaid 7 days past", action: "Send WhatsApp + email reminder",                 enabled: true,  runs: 47,  lastRun: now - 2 * hour },
    ],
    auditLogs: [
      { id: uid("au"), at: now - 1 * hour,       actor: "Priya Sharma",  actorAvatar: "PS", action: "UPDATED", entity: "Lead",     target: "Mehta Industries",                changes: "stage: Contacted → Qualified" },
      { id: uid("au"), at: now - 2 * hour,       actor: "Aarav Khanna",  actorAvatar: "AK", action: "CREATED", entity: "Deal",     target: "Patel Hospitals — Net-Metering",  changes: "value: ₹18,50,000, status: Proposal" },
      { id: uid("au"), at: now - 4 * hour,       actor: "Meera Joshi",   actorAvatar: "MJ", action: "UPDATED", entity: "Lead",     target: "Rohit Sharma",                    changes: "owner: unassigned → Meera Joshi" },
      { id: uid("au"), at: now - 6 * hour,       actor: "Demo User",     actorAvatar: "DU", action: "INVITED", entity: "User",     target: "rohan@acmesolar.in",              changes: "role: SUPPORT" },
      { id: uid("au"), at: now - 8 * hour,       actor: "Karan Bedi",    actorAvatar: "KB", action: "DELETED", entity: "Document", target: "Aadhaar — Rohit Sharma",          changes: "manually removed" },
      { id: uid("au"), at: now - 12 * hour,      actor: "System",        actorAvatar: "SY", action: "RAN",     entity: "Automation", target: "Welcome new leads",             changes: "3 leads matched, 3 WhatsApp sent" },
      { id: uid("au"), at: now - 18 * hour,      actor: "Priya Sharma",  actorAvatar: "PS", action: "UPDATED", entity: "Pipeline", target: "Lead pipeline",                   changes: "added stage 'PROPOSAL_SENT'" },
      { id: uid("au"), at: now - 22 * hour,      actor: "Demo User",     actorAvatar: "DU", action: "EXPORTED", entity: "Report",  target: "Sales by Source — Q4",            changes: "CSV download by Demo User" },
      { id: uid("au"), at: now - 1 * day,        actor: "Aarav Khanna",  actorAvatar: "AK", action: "CREATED", entity: "Deal",     target: "Reddy Constructions — Phase 2",   changes: "value: ₹7,20,000" },
      { id: uid("au"), at: now - 1.5 * day,      actor: "System",        actorAvatar: "SY", action: "FAILED",  entity: "Automation", target: "Payment reminder",              changes: "WhatsApp API rate limit hit" },
      { id: uid("au"), at: now - 2 * day,        actor: "Meera Joshi",   actorAvatar: "MJ", action: "UPDATED", entity: "Lead",     target: "Neha Kapoor",                     changes: "stage: Qualified → Proposal Sent" },
      { id: uid("au"), at: now - 3 * day,        actor: "Demo User",     actorAvatar: "DU", action: "ENABLED", entity: "2FA",      target: "Demo User account",               changes: "TOTP authenticator activated" },
    ],
    leads: [
      { id: uid("ld"), name: "Rohit Sharma", company: "Sunrise Realty", email: "rohit@sunrise.in", phone: "+91 98765 12340", source: "Website", stage: "New", score: 72, value: 240000, owner: "Demo User", createdAt: now - 2 * day, notes: "Interested in 5kW residential setup." },
      { id: uid("ld"), name: "Priya Mehta", company: "Mehta Industries", email: "priya@mehtaind.com", phone: "+91 98220 11122", source: "Referral", stage: "Contacted", score: 84, value: 950000, owner: "Demo User", createdAt: now - 5 * day, notes: "Factory rooftop, 50kW commercial." },
      { id: uid("ld"), name: "Arjun Patel", company: "Patel Hospitals", email: "arjun@patelhospitals.com", phone: "+91 99876 55443", source: "Cold Call", stage: "Qualified", score: 91, value: 1850000, owner: "Demo User", createdAt: now - 8 * day, notes: "Hospital with backup priority. Net-metering required." },
      { id: uid("ld"), name: "Neha Kapoor", company: "Greenfield Schools", email: "neha@greenfield.edu", phone: "+91 90123 44556", source: "Event", stage: "Proposal", score: 65, value: 620000, owner: "Demo User", createdAt: now - 12 * day, notes: "Three school buildings, 30kW total." },
      { id: uid("ld"), name: "Vikram Singh", company: "Singh Farms", email: "vikram@singhfarms.in", phone: "+91 97001 22334", source: "Website", stage: "New", score: 48, value: 180000, owner: "Demo User", createdAt: now - 1 * day, notes: "Irrigation pump solarization." },
      { id: uid("ld"), name: "Ananya Iyer", company: "Iyer & Co", email: "ananya@iyerco.in", phone: "+91 90909 30303", source: "LinkedIn", stage: "Contacted", score: 76, value: 410000, owner: "Demo User", createdAt: now - 3 * day, notes: "Office building, premium installation." },
    ],
    customers: [
      { id: uid("cu"), name: "Mahesh Reddy", company: "Reddy Constructions", email: "mahesh@reddyc.in", phone: "+91 98800 12121", city: "Hyderabad", status: "Active", lifetime: 2150000, since: now - 220 * day },
      { id: uid("cu"), name: "Kavita Joshi", company: "Joshi Textiles", email: "kavita@joshitex.com", phone: "+91 98980 22332", city: "Surat", status: "Active", lifetime: 5400000, since: now - 410 * day },
      { id: uid("cu"), name: "Sandeep Rao", company: "Rao Logistics", email: "sandeep@raolog.com", phone: "+91 98765 99887", city: "Bengaluru", status: "Churned", lifetime: 320000, since: now - 800 * day },
      { id: uid("cu"), name: "Pooja Nair", company: "Nair Foods", email: "pooja@nairfoods.in", phone: "+91 97720 30303", city: "Kochi", status: "Active", lifetime: 1280000, since: now - 95 * day },
    ],
    deals: [
      { id: uid("dl"), title: "Mehta Industries — 50kW Rooftop", customer: "Mehta Industries", value: 950000, stage: "Negotiation", probability: 70, expectedClose: now + 14 * day, owner: "Demo User", createdAt: now - 5 * day },
      { id: uid("dl"), title: "Patel Hospitals — Net-Metering 100kW", customer: "Patel Hospitals", value: 1850000, stage: "Proposal", probability: 55, expectedClose: now + 30 * day, owner: "Demo User", createdAt: now - 8 * day },
      { id: uid("dl"), title: "Reddy Constructions — Phase 2", customer: "Reddy Constructions", value: 720000, stage: "Won", probability: 100, expectedClose: now - 7 * day, owner: "Demo User", createdAt: now - 60 * day },
      { id: uid("dl"), title: "Greenfield Schools — Campus Solar", customer: "Greenfield Schools", value: 620000, stage: "Qualification", probability: 35, expectedClose: now + 45 * day, owner: "Demo User", createdAt: now - 12 * day },
      { id: uid("dl"), title: "Joshi Textiles — Annual Maintenance", customer: "Joshi Textiles", value: 180000, stage: "Won", probability: 100, expectedClose: now - 20 * day, owner: "Demo User", createdAt: now - 90 * day },
      { id: uid("dl"), title: "Nair Foods — Cold Storage Solar", customer: "Nair Foods", value: 540000, stage: "Lost", probability: 0, expectedClose: now - 40 * day, owner: "Demo User", createdAt: now - 110 * day },
    ],
    activities: [
      { id: uid("ac"), type: "call", title: "Discovery call with Priya Mehta", at: now - 4 * day, owner: "Demo User" },
      { id: uid("ac"), type: "email", title: "Proposal sent to Greenfield Schools", at: now - 2 * day, owner: "Demo User" },
      { id: uid("ac"), type: "meeting", title: "Site visit — Patel Hospitals", at: now - 1 * day, owner: "Demo User" },
      { id: uid("ac"), type: "task", title: "Follow up with Rohit Sharma", at: now + 1 * day, owner: "Demo User" },
    ],
    reps: [
      { id: "rp_1", name: "Aarav Khanna", avatar: "AK", dealsWon: 18, revenue: 9_80_00_000, conversion: 64, rank: 1 },
      { id: "rp_2", name: "Meera Joshi", avatar: "MJ", dealsWon: 14, revenue: 7_20_00_000, conversion: 58, rank: 2 },
      { id: "rp_3", name: "Karan Bedi", avatar: "KB", dealsWon: 11, revenue: 5_60_00_000, conversion: 49, rank: 3 },
      { id: "rp_4", name: "Sanya Rao", avatar: "SR", dealsWon: 8, revenue: 3_90_00_000, conversion: 41, rank: 4 },
    ],
    notifications: [],
    session: { userId: null },          // current logged-in user
    industry: "solar",                  // active industry preset id
    preferences: {                       // user-tweakable demo prefs
      notificationsEnabled: true,
      soundEnabled: false,
      assistantDismissed: false,
    },
  };
}

// ── Public API ───────────────────────────────────────────────────
export const db = {
  init() {
    if (!loadRoot()) saveRoot(seed());
  },

  reset() {
    saveRoot(seed());
  },

  raw() {
    return loadRoot() || (saveRoot(seed()), loadRoot());
  },

  get(collection) {
    const root = this.raw();
    return root[collection] ?? [];
  },

  set(collection, value) {
    const root = this.raw();
    root[collection] = value;
    saveRoot(root);
  },

  insert(collection, item) {
    const root = this.raw();
    const record = { id: item.id || uid(collection.slice(0, 2)), createdAt: Date.now(), ...item };
    root[collection] = [record, ...(root[collection] || [])];
    saveRoot(root);
    return record;
  },

  update(collection, id, patch) {
    const root = this.raw();
    const list = root[collection] || [];
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    root[collection] = list;
    saveRoot(root);
    return list[idx];
  },

  remove(collection, id) {
    const root = this.raw();
    root[collection] = (root[collection] || []).filter((r) => r.id !== id);
    saveRoot(root);
  },

  // Merge multiple collections at once (used by industry switcher).
  merge(patch) {
    const root = this.raw();
    saveRoot({ ...root, ...patch });
  },

  // Prepend an item without timestamp injection (for notifications).
  prepend(collection, item) {
    const root = this.raw();
    root[collection] = [item, ...(root[collection] || [])];
    saveRoot(root);
    return item;
  },

  session: {
    get() {
      const root = db.raw();
      return root.session || { userId: null };
    },
    set(patch) {
      const root = db.raw();
      root.session = { ...root.session, ...patch };
      saveRoot(root);
    },
    clear() {
      const root = db.raw();
      root.session = { userId: null };
      saveRoot(root);
    },
  },

  preferences: {
    get() {
      const root = db.raw();
      return root.preferences || { notificationsEnabled: true, soundEnabled: false, assistantDismissed: false };
    },
    set(patch) {
      const root = db.raw();
      root.preferences = { ...root.preferences, ...patch };
      saveRoot(root);
    },
  },

  industry: {
    get() { return db.raw().industry || "solar"; },
    set(id) {
      const root = db.raw();
      root.industry = id;
      saveRoot(root);
    },
  },
};

export { uid };
