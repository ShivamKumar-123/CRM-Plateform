import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { customersData } from "../assets/data.js";
import { Edit, Trash2, Search } from "lucide-react";

/* Animation */
const tableVariant = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const rowVariant = {
  hidden: { opacity: 0 },
  show: (i) => ({
    opacity: 1,
    transition: { delay: i * 0.05 },
  }),
};

/* Status Color Helper */
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "from-red-400 to-red-600";
    case "assigned":
      return "from-yellow-400 to-amber-500";
    case "confirmed":
      return "from-green-400 to-emerald-600";
    default:
      return "from-gray-400 to-gray-500";
  }
};

function CustomerTable() {
  const [search, setSearch] = useState("");

  /* Filtered Data */
  const filteredData = useMemo(() => {
    if (!search) return customersData;

    return customersData.filter((customer) =>
      customer.Name.toLowerCase().includes(search.toLowerCase()) ||
      customer.Phone.includes(search) ||
      customer.status.toLowerCase().includes(search.toLowerCase()) ||
      customer["Handle By"].toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <motion.div
      variants={tableVariant}
      initial="hidden"
      animate="show"
      className="relative space-y-6"
    >

      {/* 🔍 Search Bar */}
      <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
        <h2 className="text-xl font-semibold text-white">
          Customer List
        </h2>

        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, phone, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
          />
        </div>
      </div>

      {/* 📋 Table */}
      <div className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-white/5 text-yellow-300">
            <tr>
              <th className="px-6 py-4">S.No</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Handle By</th>
              <th className="px-6 py-4">Purpose</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((customer, index) => (
                <motion.tr
                  key={customer.id || index}
                  custom={index}
                  variants={rowVariant}
                  initial="hidden"
                  animate="show"
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="border-b border-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>

                  <td className="px-6 py-4 font-medium text-white">
                    {customer.Name}
                  </td>

                  <td className="px-6 py-4">{customer.Phone}</td>

                  <td className="px-6 py-4">
                    {customer["Handle By"]}
                  </td>

                  <td className="px-6 py-4">{customer.purpose}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-black bg-gradient-to-r ${getStatusColor(
                        customer.status
                      )}`}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 flex gap-3">
                    <button className="p-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-105 transition">
                      <Edit size={14} />
                    </button>

                    <button className="p-2 rounded-lg bg-gradient-to-r from-red-400 to-red-600 text-white hover:scale-105 transition">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-gray-400"
                >
                  No customers found.
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
