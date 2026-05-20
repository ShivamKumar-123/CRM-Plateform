import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun, Home as HomeIcon, Stethoscope, Shield, Truck, GraduationCap,
  Building2, ArrowRight, Check,
} from "lucide-react";
import { PageHero, SectionHeading, CTABanner } from "./_components.jsx";

const industries = [
  {
    slug: "solar",
    icon: Sun,
    name: "Solar / Renewables",
    tagline: "Built by solar people, for solar people.",
    pipeline: ["New Inquiry", "Site Visit", "Quotation Sent", "Negotiation", "Installation", "Lost"],
    fields: ["Watt Capacity", "Roof Type", "Brand", "Subsidy Eligible"],
    useCases: [
      "Rooftop solar installers tracking KW × brand × subsidy eligibility",
      "EPC contractors managing multiple installation sites + payment milestones",
      "Channel partners earning commission per kW closed",
    ],
    tint: "from-yellow-400 to-amber-500",
    accent: "yellow",
  },
  {
    slug: "real-estate",
    icon: HomeIcon,
    name: "Real Estate",
    tagline: "From inquiry to possession, one pipeline.",
    pipeline: ["New Inquiry", "Property Visit", "Offer Made", "Negotiation", "Booked", "Lost"],
    fields: ["Property Type", "BHK", "Carpet Area", "Budget (₹ lakhs)", "Possession Date"],
    useCases: [
      "Developers tracking site visits + booking → registration funnel",
      "Brokerages with multi-city teams managing buyer + seller inquiries",
      "Property management firms handling lease renewals + tenant onboarding",
    ],
    tint: "from-sky-400 to-blue-500",
    accent: "sky",
  },
  {
    slug: "healthcare",
    icon: Stethoscope,
    name: "Healthcare / Clinics",
    tagline: "Patients flow, paperwork doesn't.",
    pipeline: ["Inquiry", "Consultation", "Diagnosis", "Treatment Plan", "Under Treatment", "Discharged"],
    fields: ["Patient ID", "Age", "Specialty", "Insurance Provider", "Emergency Flag"],
    useCases: [
      "Multi-branch clinic chains with tenant isolation per location",
      "Dental / cosmetic / IVF clinics tracking patient journeys + follow-ups",
      "Diagnostic centres managing appointment → report → billing flow",
    ],
    tint: "from-emerald-400 to-green-500",
    accent: "emerald",
  },
  {
    slug: "insurance",
    icon: Shield,
    name: "Insurance",
    tagline: "Policy quote to issuance — never lose a renewal.",
    pipeline: ["New Lead", "Needs Analysis", "Quote Sent", "Underwriting", "Policy Issued", "Lost"],
    fields: ["Policy Type", "Sum Assured", "Premium", "Renewal Date", "Nominee Name"],
    useCases: [
      "Insurance brokers tracking quote requests across Life / Health / Vehicle policies",
      "Independent agents managing renewal calendars + commission payouts",
      "Corporate group-insurance accounts with multi-stakeholder approvals",
    ],
    tint: "from-violet-400 to-purple-500",
    accent: "violet",
  },
  {
    slug: "logistics",
    icon: Truck,
    name: "Logistics / Transport",
    tagline: "Quote, book, track, deliver.",
    pipeline: ["New Inquiry", "Quote Requested", "Quote Sent", "Booked", "In Transit", "Delivered"],
    fields: ["Origin", "Destination", "Weight (kg)", "Cargo Type", "Pickup Date"],
    useCases: [
      "Freight forwarders quoting FTL / LTL across multiple lanes",
      "Last-mile delivery companies tracking pickup → POD",
      "Customs brokers managing documents + clearance milestones",
    ],
    tint: "from-orange-400 to-red-500",
    accent: "orange",
  },
  {
    slug: "education",
    icon: GraduationCap,
    name: "Education / Coaching",
    tagline: "Inquiry to enrolment, with parents in the loop.",
    pipeline: ["Inquiry", "Counselling", "Demo Booked", "Demo Attended", "Fee Quoted", "Enrolled"],
    fields: ["Course", "Preferred Batch", "Student Age", "Class / Grade", "Parent Name"],
    useCases: [
      "Coaching institutes with multi-batch + multi-subject inquiry funnels",
      "EdTech companies handling demo booking → free trial → paid conversion",
      "Universities + colleges managing admission inquiries by program",
    ],
    tint: "from-pink-400 to-rose-500",
    accent: "pink",
  },
  {
    slug: "general",
    icon: Building2,
    name: "General Business",
    tagline: "Don't see your industry? Build your own.",
    pipeline: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"],
    fields: ["(define your own with the Custom Fields engine)"],
    useCases: [
      "Marketing agencies managing client retainers + project pipelines",
      "Manufacturing sales teams tracking RFQ → PO → delivery",
      "B2B SaaS teams running outbound + inbound sales together",
    ],
    tint: "from-cyan-400 to-blue-500",
    accent: "cyan",
  },
];

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries we serve"
        title="Solar, real estate, healthcare,"
        accent="and many more."
        subtitle="One platform, configurable for any sales-driven business. Each industry gets its own pipeline, custom fields, and scoring rules — applied with one click via templates."
      />

      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto space-y-10">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="rounded-3xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-yellow-400/30 transition-colors"
            >
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Left col — icon + name + tagline + use cases */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ind.tint} flex items-center justify-center mb-5 shadow-lg`}>
                    <ind.icon size={28} className="text-black" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                    {ind.name}
                  </h2>
                  <p className={`text-lg text-${ind.accent}-300 font-medium mb-6`}>
                    {ind.tagline}
                  </p>

                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
                    Common use cases
                  </p>
                  <ul className="space-y-2 mb-6">
                    {ind.useCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check size={14} className={`text-${ind.accent}-400 mt-1 flex-shrink-0`} />
                        <span>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right col — pipeline + custom fields preview */}
                <div className={`p-8 md:p-10 bg-gradient-to-br from-${ind.accent}-500/5 via-transparent to-${ind.accent}-500/5 border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col justify-center`}>
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
                    Default pipeline
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {ind.pipeline.map((stage, j) => (
                      <div key={stage} className="flex items-center gap-1.5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] border border-white/10 text-gray-200`}>
                          {stage}
                        </span>
                        {j < ind.pipeline.length - 1 && (
                          <ArrowRight size={12} className="text-gray-600" />
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-3">
                    Pre-configured custom fields
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ind.fields.map((field) => (
                      <span key={field} className={`px-3 py-1 rounded-full text-xs bg-${ind.accent}-400/10 border border-${ind.accent}-400/30 text-${ind.accent}-200`}>
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── "What if my industry isn't here" callout ── */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-yellow-500/10 to-sky-500/10 border border-yellow-400/20 p-10 md:p-14 text-center backdrop-blur"
        >
          <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-3">
            Don't see your industry?
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Build your own preset in{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              5 minutes.
            </span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Define your own pipeline stages with drag-drop, add custom fields (11 types), set scoring rules.
            No code, no migrations. Save it as an industry template and reuse across orgs.
          </p>
          <Link
            to="/features"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold shadow-lg hover:scale-105 transition-transform"
          >
            See how it works <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <CTABanner />
    </>
  );
}
