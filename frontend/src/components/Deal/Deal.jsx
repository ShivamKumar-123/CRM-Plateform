import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, RefreshCw } from "lucide-react";
import { api } from "../../lib/api.js";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const statusStyle = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "OPEN") return "bg-gradient-to-r from-sky-400 to-blue-500";
  if (s === "WON") return "bg-gradient-to-r from-green-400 to-emerald-600";
  if (s === "CANCELLED") return "bg-gradient-to-r from-red-400 to-red-600";
  return "bg-gray-400";
};

const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function Deal() {
  const [input, setInput] = useState("");
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    api.getDeals()
      .then((data) => {
        setDeals(data?.deals || []);
        setStats(data?.stats || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredDeals = useMemo(() => {
    if (!input) return deals;
    const q = input.toLowerCase();
    return deals.filter(
      (d) =>
        String(d.id) === input ||
        d.phone?.includes(input) ||
        d.name?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
    );
  }, [input, deals]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative z-10 p-6 space-y-10">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-3xl font-bold text-white">Deal Management</h1>
          <p className="text-gray-400 mt-1">Track, manage and close deals effectively.</p>
        </motion.div>

        {stats && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatPill label="Total" value={stats.total_deals} />
            <StatPill label="Open" value={stats.open_deals} color="text-sky-400" />
            <StatPill label="Won" value={stats.won_deals} color="text-emerald-400" />
            <StatPill label="Cancelled" value={stats.cancelled_deals} color="text-red-400" />
          </motion.div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full md:w-1/2">
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by name, phone, city, or ID..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </form>

          <div className="flex gap-3">
            <motion.button
              onClick={load}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-black font-semibold shadow-lg"
            >
              Create Deal
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
          className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-sky-300">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Deal Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeals.map((deal, index) => (
                <motion.tr
                  key={deal.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.03, 0.4) }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{deal.name}</td>
                  <td className="px-6 py-4">{deal.phone}</td>
                  <td className="px-6 py-4">{deal.city}</td>
                  <td className="px-6 py-4">{deal.brand_name}</td>
                  <td className="px-6 py-4">{formatINR(deal.deal_value)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-black ${statusStyle(deal.status)}`}>
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button className="p-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 text-black hover:scale-105 transition">
                      <Eye size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredDeals.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              {deals.length === 0 ? "No deals yet." : "No matching deals found."}
            </div>
          )}
          {loading && (
            <div className="text-center py-6 text-gray-400">Loading…</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color = "text-white" }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
    </div>
  );
}

export default Deal;
