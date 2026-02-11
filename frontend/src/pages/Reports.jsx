import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Download,
} from "lucide-react";

/* Animation Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

function Reports() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 px-6 py-16 max-w-7xl mx-auto space-y-20">

        {/* 🔥 Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Track revenue, monitor customer growth, and analyze business
            performance with real-time insights.
          </p>
        </motion.div>

        {/* 📊 KPI Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <ReportCard icon={DollarSign} title="Total Revenue" value="$245,000" />
          <ReportCard icon={Users} title="New Customers" value="1,250" />
          <ReportCard icon={TrendingUp} title="Conversion Rate" value="32%" />
          <ReportCard icon={BarChart3} title="Monthly Growth" value="+18%" />
        </motion.div>

        {/* 📈 Revenue Chart */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-yellow-300 mb-6">
            Monthly Revenue Overview
          </h2>

          <div className="h-56 flex items-end justify-between gap-3">
            {[40, 65, 55, 75, 60, 85, 70, 95, 80, 68, 90, 78].map(
              (height, index) => (
                <motion.div
                  key={index}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-yellow-400 to-sky-500"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height}%` }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              )
            )}
          </div>

          <div className="flex justify-between mt-4 text-xs text-gray-500">
            {[
              "Jan","Feb","Mar","Apr",
              "May","Jun","Jul","Aug",
              "Sep","Oct","Nov","Dec"
            ].map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </motion.div>

        {/* 📌 Status Overview */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          <StatusCard
            title="Pending Leads"
            value="320"
            gradient="from-red-400 to-red-600"
          />
          <StatusCard
            title="Assigned Leads"
            value="540"
            gradient="from-yellow-400 to-amber-500"
          />
          <StatusCard
            title="Confirmed Leads"
            value="780"
            gradient="from-green-400 to-emerald-600"
          />
        </motion.div>

        {/* 📥 Download Reports */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-xl space-y-6"
        >
          <h2 className="text-xl font-semibold text-yellow-300">
            Download Lead Reports
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            <DownloadButton
              label="Pending Leads Report"
              gradient="from-red-400 to-red-600"
            />
            <DownloadButton
              label="Assigned Leads Report"
              gradient="from-yellow-400 to-amber-500"
            />
            <DownloadButton
              label="Confirmed Leads Report"
              gradient="from-green-400 to-emerald-600"
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

/* KPI Card */
function ReportCard({ icon: Icon, title, value }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-sky-500 flex items-center justify-center shadow-lg">
          <Icon size={22} className="text-black" />
        </div>
      </div>
    </motion.div>
  );
}

/* Status Card */
function StatusCard({ title, value, gradient }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl text-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      <div
        className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
      >
        {value}
      </div>
    </motion.div>
  );
}

/* Download Button */
function DownloadButton({ label, gradient }) {
  const handleDownload = () => {
    const blob = new Blob([`${label} Data`], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${label}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.button
      onClick={handleDownload}
      variants={fadeUp}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-black bg-gradient-to-r ${gradient} shadow-lg`}
    >
      <Download size={18} />
      {label}
    </motion.button>
  );
}

export default Reports;
