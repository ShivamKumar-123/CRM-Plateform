// Industry-aware fake-data generators. Pure functions — given an industry
// preset, they return collections (leads/customers/deals/activities/reps)
// suitable for db.set(). No randomness leaks outside these helpers.

const day = 86_400_000;
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function fullName(ind) { return `${pick(ind.firstNames)} ${pick(ind.lastNames)}`; }
function companyName(ind) { return `${pick(ind.lastNames)} ${pick(ind.companySuffix)}`; }
function phone() { return `+91 ${rand(70, 99)}${rand(100, 999)} ${rand(10000, 99999)}`; }
function emailFor(name, company) {
  const first = name.split(" ")[0].toLowerCase();
  const dom = company.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
  return `${first}@${dom || "example"}.in`;
}

export function generateLeads(industry, count = 8) {
  const now = Date.now();
  const out = [];
  for (let i = 0; i < count; i++) {
    const name = fullName(industry);
    const company = companyName(industry);
    out.push({
      id: uid("ld"),
      name,
      company,
      email: emailFor(name, company),
      phone: phone(),
      source: pick(industry.sources),
      stage: pick(industry.leadStages),
      score: rand(35, 95),
      value: rand(80_000, 25_00_000),
      owner: pick(industry.reps),
      product: pick(industry.sampleProducts),
      city: pick(industry.cities),
      createdAt: now - rand(0, 30) * day,
      notes: `${industry.vocabulary.leadNoun} for ${pick(industry.sampleProducts)}.`,
    });
  }
  return out;
}

export function generateCustomers(industry, count = 6) {
  const now = Date.now();
  const out = [];
  for (let i = 0; i < count; i++) {
    const name = fullName(industry);
    const company = companyName(industry);
    out.push({
      id: uid("cu"),
      name,
      company,
      email: emailFor(name, company),
      phone: phone(),
      city: pick(industry.cities),
      status: Math.random() < 0.85 ? "Active" : "Churned",
      lifetime: rand(2_00_000, 65_00_000),
      since: now - rand(60, 800) * day,
    });
  }
  return out;
}

export function generateDeals(industry, count = 8) {
  const now = Date.now();
  const out = [];
  for (let i = 0; i < count; i++) {
    const stage = pick(industry.dealStages);
    const product = pick(industry.sampleProducts);
    const value = rand(1_50_000, 30_00_000);
    out.push({
      id: uid("dl"),
      title: `${companyName(industry)} — ${product}`,
      customer: companyName(industry),
      value,
      stage,
      probability: stage === "Won" ? 100 : stage === "Lost" ? 0 : rand(20, 80),
      expectedClose: now + rand(-30, 60) * day,
      owner: pick(industry.reps),
      createdAt: now - rand(0, 90) * day,
    });
  }
  return out;
}

export function generateActivities(industry, count = 8) {
  const now = Date.now();
  const types = ["call", "email", "meeting", "task"];
  const out = [];
  for (let i = 0; i < count; i++) {
    const type = pick(types);
    const who = fullName(industry);
    const label =
      type === "call" ? `Discovery call with ${who}` :
      type === "email" ? `Proposal sent to ${companyName(industry)}` :
      type === "meeting" ? `${industry.vocabulary.leadNoun.toLowerCase()} review — ${who}` :
      `Follow up with ${who}`;
    out.push({
      id: uid("ac"),
      type,
      title: label,
      at: now - rand(0, 15) * day - rand(0, 12) * 3_600_000,
      owner: pick(industry.reps),
    });
  }
  return out.sort((a, b) => b.at - a.at);
}

// Sales-rep performance ledger used by the leaderboard widget.
export function generateReps(industry) {
  return industry.reps.map((name, i) => ({
    id: uid("rp"),
    name,
    avatar: name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(),
    dealsWon: rand(4, 22),
    revenue: rand(15_00_000, 1_20_00_000),
    conversion: rand(28, 78),
    rank: i + 1,
  })).sort((a, b) => b.revenue - a.revenue).map((r, i) => ({ ...r, rank: i + 1 }));
}

// One-shot dataset bundle for industry switching.
export function generateBundle(industry) {
  return {
    leads: generateLeads(industry, 9),
    customers: generateCustomers(industry, 6),
    deals: generateDeals(industry, 9),
    activities: generateActivities(industry, 10),
    reps: generateReps(industry),
  };
}

// Live-event generator for the floating ticker + fake notifications.
export function randomLiveEvent(industry) {
  const events = [
    () => `+ New ${industry.vocabulary.leadNoun.toLowerCase()} from ${pick(industry.sources)}`,
    () => `+ ${industry.vocabulary.dealNoun} worth ₹${rand(2, 28)}L moved to ${pick(industry.dealStages.filter((s) => s !== "Lost"))}`,
    () => `+ ${fullName(industry)} signed up as ${industry.vocabulary.customerNoun}`,
    () => `+ Meeting scheduled with ${fullName(industry)}`,
    () => `+ Payment of ₹${rand(50, 950)}k received from ${companyName(industry)}`,
    () => `+ ${pick(industry.reps)} closed a deal`,
  ];
  return pick(events)();
}

export function randomNotification(industry) {
  const variants = [
    { type: "lead", title: `New ${industry.vocabulary.leadNoun.toLowerCase()} assigned`, body: `${fullName(industry)} interested in ${pick(industry.sampleProducts)}` },
    { type: "deal", title: `${industry.vocabulary.dealNoun} moved to WON`, body: `${companyName(industry)} — ₹${rand(2, 35)}L closed` },
    { type: "meeting", title: "Meeting scheduled", body: `Site visit with ${fullName(industry)} tomorrow` },
    { type: "payment", title: "Payment received", body: `₹${rand(50, 950)}k from ${companyName(industry)}` },
    { type: "customer", title: `${industry.vocabulary.customerNoun} created`, body: `${fullName(industry)} onboarded successfully` },
    { type: "task", title: "Task assigned", body: `Follow-up call with ${fullName(industry)}` },
  ];
  const v = pick(variants);
  return { id: uid("nt"), at: Date.now(), read: false, ...v };
}
