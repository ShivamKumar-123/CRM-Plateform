import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { customersData } from "../../assets/data.js";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

/* Animation Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const containerVariant = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

function Lead() {
  const [input, setInput] = useState("");
  const [customerData, setCustomerData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCustomerData(customersData);
  }, []);

  /* Filter Logic */
  const filteredData = useMemo(() => {
    if (!input) return customerData;

    return customerData.filter(
      (item) =>
        item.id === Number(input) ||
        item.Phone?.includes(input)
    );
  }, [input, customerData]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariant}
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
          whileInView="show"
          initial="hidden"
          viewport={{ once: true }}
        >
          <h1 className="text-3xl font-bold text-white">
            Customer Contact
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your leads and customers efficiently
          </p>
        </motion.div>

        {/* Search + Buttons */}
        <motion.div
          variants={fadeUp}
          whileInView="show"
          initial="hidden"
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Search */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-1/2"
          >
            <input
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search by ID or Phone..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-yellow-400/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </form>

          {/* Buttons */}
          <div className="flex gap-3">

            {/* Add Customer */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-lg"
            >
              <UserPlus size={16} />
              Add Customer
            </motion.button>

            {/* Deal */}
            <motion.button
              onClick={() => navigate("/deals")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg"
            >
              Deal
            </motion.button>

          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={fadeUp}
          whileInView="show"
          initial="hidden"
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="overflow-x-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-xl"
        >
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
              {filteredData.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{customer.Name}</td>
                  <td className="px-6 py-4">{customer.Phone}</td>
                  <td className="px-6 py-4">{customer["Handle By"]}</td>
                  <td className="px-6 py-4">{customer.purpose}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-black
                        ${
                          customer.status?.toLowerCase() === "pending"
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : customer.status?.toLowerCase() === "assigned"
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : customer.status?.toLowerCase() === "confirmed"
                            ? "bg-gradient-to-r from-green-400 to-emerald-600"
                            : "bg-gray-400"
                        }
                      `}
                    >
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-semibold"
                    >
                      Edit
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No matching records found.
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}

export default Lead;
