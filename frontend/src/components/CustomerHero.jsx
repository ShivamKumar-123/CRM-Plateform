import { motion } from "framer-motion";
import { Users, UserCheck, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";

/* Animation Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

function CustomerHero() {
  return (
    <div
      className="relative min-h-[60vh] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg')",
      }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8">

        {/* Heading */}
        <motion.div variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent pb-4 mt-5">
            Customer Management
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Organize, track, and manage all your customers efficiently with
            powerful insights and real-time updates.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <StatCard
            icon={Users}
            value={150000}
            label="Total Customers"
            suffix="+"
          />

          <StatCard
            icon={UserCheck}
            value={5000}
            label="Active Clients"
            suffix="+"
          />

          <StatCard
            icon={TrendingUp}
            value={50}
            label="Growth Rate"
            suffix="+%"
          />
        </motion.div>

      </div>
    </div>
  );
}

export default CustomerHero;
