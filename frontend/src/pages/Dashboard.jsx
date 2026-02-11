import { motion } from "framer-motion";
import { Users, UserPlus, DollarSign, TrendingUp } from "lucide-react";

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  show:   { opacity: 1, x: 0,
    transition: { type: "spring", stiffness: 80, damping: 14, delay: 0.4 },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0,
    transition: { type: "spring", stiffness: 80, damping: 14, delay: 0.5 },
  },
};

/* ── Dashboard ── */
function Dashboard() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg')",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 p-6 space-y-8">

        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back 👋 Here's what's happening today.
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <StatCard title="Total Leads"  value="1,245"   icon={UserPlus}   delay={0} />
          <StatCard title="Customers"    value="892"     icon={Users}      delay={1} />
          <StatCard title="Revenue"      value="$48,210" icon={DollarSign} delay={2} />
          <StatCard title="Growth"       value="+12.4%"  icon={TrendingUp} delay={3} />
        </motion.div>

        {/* ── Bottom Section ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Revenue Panel */}
          <motion.div
            className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-yellow-400/20 shadow-xl"
            variants={slideInLeft}
            initial="hidden"
            animate="show"
          >
            <motion.h2
              className="text-lg font-semibold mb-4 text-yellow-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Monthly Revenue
            </motion.h2>

            {/* Animated bar chart placeholder */}
            <div className="h-48 flex items-end justify-around gap-2 px-2">
              {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 78].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-yellow-500/60 to-sky-400/60"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${h}%`, opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </div>

            <div className="flex justify-between mt-2 px-1">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m) => (
                <span key={m} className="text-[9px] text-gray-500">{m}</span>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-sky-400/20 shadow-xl"
            variants={slideInRight}
            initial="hidden"
            animate="show"
          >
            <h2 className="text-lg font-semibold mb-6 text-sky-300">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <ActionButton label="Add Customer" gradient="from-yellow-400 to-amber-500" delay={0.6} />
              <ActionButton label="Create Lead"  gradient="from-sky-400 to-blue-500"    delay={0.7} />
              <ActionButton label="Add Deal"     gradient="from-pink-400 to-rose-500"   delay={0.8} />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ title, value, icon: Icon }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <motion.h3
            className="text-2xl font-bold text-white mt-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {value}
          </motion.h3>
        </div>
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-sky-500 flex items-center justify-center shadow-lg"
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon size={22} className="text-black" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Action Button ── */
function ActionButton({ label, gradient, delay }) {
  return (
    <motion.button
      className={`w-full cursor-pointer py-3 rounded-xl font-medium text-black bg-gradient-to-r ${gradient} shadow-md`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.04, boxShadow: "0 8px 25px rgba(0,0,0,0.3)" }}
      whileTap={{ scale: 0.97 }}
    >
      {label}
    </motion.button>
  );
}

export default Dashboard;