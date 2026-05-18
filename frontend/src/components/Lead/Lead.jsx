import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, RefreshCw } from "lucide-react";
import { api } from "../../lib/api.js";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const containerVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const statusStyle = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "NEW" || s === "CONTACTED") return "bg-gradient-to-r from-sky-400 to-blue-500";
  if (s === "SITE_VISIT" || s === "QUOTATION_SENT") return "bg-gradient-to-r from-yellow-400 to-amber-500";
  if (s === "DEALED") return "bg-gradient-to-r from-green-400 to-emerald-600";
  if (s === "CANCELLED") return "bg-gradient-to-r from-red-400 to-red-600";
  return "bg-gray-400";
};

function Lead() {
  const [input, setInput] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    api.getLeads()
      .then((data) => setLeads(data?.leads || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredData = useMemo(() => {
    if (!input) return leads;
    const q = input.toLowerCase();
    return leads.filter(
      (item) =>
        String(item.id) === input ||
        item.phone?.includes(input) ||
        item.name?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q)
    );
  }, [input, leads]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariant}
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative z-10 p-6 space-y-10">
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 mt-1">Manage your leads and prospects efficiently</p>
        </motion.div>

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
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg"
            >
              <UserPlus size={16} />
              Add Lead
            </motion.button>

            <motion.button
              onClick={() => navigate("/app/deals")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg"
            >
              Deals
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
            <thead className="text-xs uppercase bg-white/5 text-yellow-300">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Assigned</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.4) }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{lead.name}</td>
                  <td className="px-6 py-4">{lead.phone}</td>
                  <td className="px-6 py-4">{lead.city}</td>
                  <td className="px-6 py-4">{lead.brand_name}</td>
                  <td className="px-6 py-4">{lead.watt_capacity}</td>
                  <td className="px-6 py-4">{lead.assigned_to_username || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-black ${statusStyle(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredData.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              {leads.length === 0 ? "No leads yet." : "No matching records found."}
            </div>
          )}
          {loading && (
            <div className="text-center py-6 text-gray-400">Loading…</div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Lead;
