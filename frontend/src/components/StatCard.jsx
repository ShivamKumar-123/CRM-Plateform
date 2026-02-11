import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function StatCard({ icon: Icon, value, label, suffix }) {
  const count = useMotionValue(0);
  const spring = useSpring(count, {
    stiffness: 60,
    damping: 20,
  });

  const display = useTransform(spring, (latest) => {
    if (value >= 100000) {
      return (latest / 100000).toFixed(1) + " Lakh" + (suffix || "");
    }
    return Math.floor(latest).toLocaleString() + (suffix || "");
  });

  useEffect(() => {
    count.set(value);
  }, [count, value]);

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-sky-500 flex items-center justify-center shadow-lg">
          <Icon size={22} className="text-black" />
        </div>

        <motion.h3 className="text-2xl font-bold text-white">
          {display}
        </motion.h3>

        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </motion.div>
  );
}

export default StatCard;
