import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { api } from "../lib/api.js";

const tableVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const rowVariant = {
  hidden: { opacity: 0 },
  show: (i) => ({ opacity: 1, transition: { delay: Math.min(i * 0.03, 0.4) } }),
};

const statusStyle = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "NEW" || s === "CONTACTED") return "from-sky-400 to-blue-500";
  if (s === "SITE_VISIT" || s === "QUOTATION_SENT") return "from-yellow-400 to-amber-500";
  if (s === "DEALED") return "from-green-400 to-emerald-600";
  if (s === "CANCELLED") return "from-red-400 to-red-600";
  return "from-gray-400 to-gray-500";
};

function CustomerTable() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(search) ||
        c.status?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.assigned_to_username?.toLowerCase().includes(q)
    );
  }, [search, leads]);

  return (
    <motion.div
      variants={tableVariant}
      initial="hidden"
      animate="show"
      className="relative space-y-6"
    >
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <h2 className="text-xl font-semibold text-white">Customer List</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by name, phone, status, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
            />
          </div>
          <button
            onClick={load}
            className="p-2 rounded-xl bg-white/10 border border-white/10 text-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-white/5 text-yellow-300">
            <tr>
              <th className="px-6 py-4">S.No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Handled By</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filteredData.length > 0 ? (
              filteredData.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  custom={index}
                  variants={rowVariant}
                  initial="hidden"
                  animate="show"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="border-b border-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.city}</td>
                  <td className="px-6 py-4">{customer.assigned_to_username || "—"}</td>
                  <td className="px-6 py-4">{customer.leads_source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-black bg-gradient-to-r ${statusStyle(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-400">
                  {loading ? "Loading…" : "No customers found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default CustomerTable;
