import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const IMG_PADDING = 12;

export const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{ opacity }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl text-yellow-300/90 md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-black tracking-tight md:text-7xl">
        {heading}
      </p>
    </motion.div>
  );
};

/* ── CRM-themed reusable copy block ── */
export const ParallaxCopyBlock = ({ title, body, secondaryBody, ctaHref = "/features", ctaLabel = "Learn more" }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-black tracking-tight md:col-span-4 bg-gradient-to-br from-yellow-300 via-amber-400 to-sky-400 bg-clip-text text-transparent">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-gray-400 md:text-2xl leading-relaxed">{body}</p>
      {secondaryBody && (
        <p className="mb-8 text-xl text-gray-400 md:text-2xl leading-relaxed">{secondaryBody}</p>
      )}
      <Link
        to={ctaHref}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 px-8 py-4 text-base font-bold text-black transition-all hover:shadow-[0_12px_40px_rgba(250,204,21,0.6)] md:text-lg"
      >
        {ctaLabel} <ArrowUpRight size={18} />
      </Link>
    </div>
  </div>
);

/* ── 3-section CRM parallax story ── */
export const TextParallaxContentExample = () => {
  return (
    <div className="bg-transparent">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"
        subheading="Collaborate"
        heading="Built for your team."
      >
        <ParallaxCopyBlock
          title="One pipeline. Every rep. Zero chaos."
          body="Lead capture, qualification, deal-close and payment tracking — your whole sales team works in the same configurable pipeline. No more WhatsApp screenshots, no more orphaned Excel sheets, no more deals walking out the door when a rep quits."
          secondaryBody="Role-based access, audit logs on every change, and notifications that keep managers and reps aligned without a single status-update meeting."
          ctaHref="/features"
          ctaLabel="See collaboration features"
        />
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2840&auto=format&fit=crop"
        subheading="Quality"
        heading="Data you can trust."
      >
        <ParallaxCopyBlock
          title="Multi-tenant. Audited. India-hosted."
          body="Every record is org-scoped at the database layer — not just hidden in the UI. JWT auth, TOTP 2FA, rotating refresh tokens, and an audit log entry on every CREATE / UPDATE / DELETE with full before-and-after diffs."
          secondaryBody="Data hosted in Mumbai (AWS ap-south-1), DPDP Act compliant, with export-anytime guarantees. You own your data, always."
          ctaHref="/about"
          ctaLabel="Read our security model"
        />
      </TextParallaxContent>

      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2832&auto=format&fit=crop"
        subheading="Modern"
        heading="Made for India."
      >
        <ParallaxCopyBlock
          title="₹, GSTIN, UPI — out of the box."
          body="Native ₹ formatting, GSTIN/PAN/Aadhaar fields ready-made, UPI payment links, Hindi + 8 regional languages. We don't retrofit a US tool — we build for Indian SMBs from day one."
          secondaryBody="Solar installers in Rajasthan, real-estate brokers in Bengaluru, dental clinics in Delhi — 500+ Indian businesses already run on CRM Suite."
          ctaHref="/industries"
          ctaLabel="Browse industries"
        />
      </TextParallaxContent>
    </div>
  );
};

export default TextParallaxContentExample;
