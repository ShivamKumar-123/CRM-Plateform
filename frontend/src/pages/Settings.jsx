import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  ArrowLeft,
  Trash2,
  Save,
  Crown,
} from "lucide-react";

/* Scroll Animation Variant */
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

function Settings() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Floating Glow Effect */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 space-y-20">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 via-white to-sky-300 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-gray-400 mt-3">
              Manage your profile, security, notifications, and system preferences.
            </p>
          </div>

          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.08, x: -6 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl 
                       bg-gradient-to-r from-yellow-400 to-sky-500 
                       text-black font-semibold shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(250,204,21,0.4)" }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </motion.button>
        </motion.div>

        {/* Account Summary Card */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-sky-500 flex items-center justify-center shadow-lg">
              <Crown size={26} className="text-black" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                Premium Account
              </h3>
              <p className="text-gray-400 text-sm">
                You are subscribed to the Pro CRM Plan.
              </p>
            </div>
          </div>

          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:scale-105 transition">
            Upgrade Plan
          </button>
        </motion.div>

        {/* Sections */}
        <SectionCard
          icon={User}
          title="Profile Information"
          description="Update your personal information and contact details."
        >
          <Input label="Full Name" placeholder="John Doe" />
          <Input label="Email Address" placeholder="john@example.com" />
          <Input label="Phone Number" placeholder="+1 234 567 890" />
        </SectionCard>

        <SectionCard
          icon={Lock}
          title="Security Settings"
          description="Update your password and manage account security."
        >
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm Password" type="password" />
        </SectionCard>

        <SectionCard
          icon={Bell}
          title="Notification Preferences"
          description="Manage how you receive notifications."
        >
          <Toggle label="Email Notifications" />
          <Toggle label="SMS Notifications" />
          <Toggle label="Push Notifications" />
        </SectionCard>

        <SectionCard
          icon={Palette}
          title="Appearance"
          description="Customize system appearance."
        >
          <Toggle label="Dark Mode" />
          <Toggle label="Enable Animations" />
        </SectionCard>

        <SectionCard
          icon={Shield}
          title="Privacy & Data"
          description="Manage data access and privacy controls."
        >
          <Toggle label="Two-Factor Authentication" />
          <Toggle label="Data Sharing Preferences" />
        </SectionCard>

        {/* Danger Zone */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="bg-red-500/10 backdrop-blur-md p-8 rounded-2xl border border-red-500/30 shadow-xl space-y-6"
        >
          <h2 className="text-xl font-semibold text-red-400">
            Danger Zone
          </h2>
          <p className="text-gray-400 text-sm">
            Permanently delete your account and all associated data.
          </p>

          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold hover:scale-105 transition">
            <Trash2 size={16} />
            Delete Account
          </button>
        </motion.div>

      </div>

      {/* Floating Save Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 rounded-full 
                   bg-gradient-to-r from-yellow-400 to-amber-500 text-black 
                   font-semibold shadow-2xl z-50"
      >
        <Save size={16} />
        Save All
      </motion.button>

    </div>
  );
}

/* Reusable Section Card */
function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl space-y-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={fadeInUp}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-sky-500 flex items-center justify-center shadow-lg">
          <Icon size={22} className="text-black" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

/* Input Component */
function Input({ label, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-300">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
      />
    </div>
  );
}

/* Toggle Component */
function Toggle({ label }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <input
        type="checkbox"
        className="w-5 h-5 accent-yellow-400 cursor-pointer"
      />
    </div>
  );
}

export default Settings;
