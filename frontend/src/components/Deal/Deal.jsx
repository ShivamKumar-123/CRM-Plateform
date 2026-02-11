import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { customersData } from "../../assets/data.js";
import { Eye, Edit, Trash2 } from "lucide-react";

/* Scroll Animation Variant */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function Deal() {
  const [input, setInput] = useState("");
  const [dealData, setDealData] = useState([]);

  useEffect(() => {
    setDealData(customersData);
  }, []);

  /* Filter Logic */
  const filteredDeals = useMemo(() => {
    if (!input) return dealData;

    return dealData.filter(
      (item) =>
        item.id === Number(input) ||
        item.Phone?.includes(input)
    );
  }, [input, dealData]);

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>

      <div className="relative z-10 p-6 space-y-10">

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h1 className="text-3xl font-bold text-white">
            Deal Management
          </h1>
          <p className="text-gray-400 mt-1">
            Track, manage and close deals effectively.
          </p>
        </motion.div>

        {/* Search + Create Deal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-1/2"
          >
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search Deal by ID or Phone..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </form>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-black font-semibold shadow-lg"
          >
            Create Deal
          </motion.button>
        </motion.div>

        {/* Deals Table */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl"
        >
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="text-xs uppercase bg-white/5 text-sky-300">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Deal Owner</th>
                <th className="px-6 py-4">Deal Purpose</th>
                <th className="px-6 py-4">Deal Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeals.map((deal, index) => (
                <motion.tr
                  key={deal.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{deal.Name}</td>
                  <td className="px-6 py-4">{deal.Phone}</td>
                  <td className="px-6 py-4">{deal["Handle By"]}</td>
                  <td className="px-6 py-4">{deal.purpose}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-black
                        ${
                          deal.status?.toLowerCase() === "pending"
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : deal.status?.toLowerCase() === "assigned"
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : deal.status?.toLowerCase() === "confirmed"
                            ? "bg-gradient-to-r from-green-400 to-emerald-600"
                            : "bg-gray-400"
                        }
                      `}
                    >
                      {deal.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 flex gap-3">
                    <button className="p-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 text-black hover:scale-105 transition">
                      <Eye size={14} />
                    </button>

                    <button className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-105 transition">
                      <Edit size={14} />
                    </button>

                    <button className="p-2 rounded-lg bg-gradient-to-r from-red-400 to-red-600 text-white hover:scale-105 transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredDeals.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No matching deals found.
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default Deal;
