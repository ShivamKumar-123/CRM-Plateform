import React from "react";
import { CustomerHero, CustomerTable } from "../components/index.js";

function Customers() {
  return (
    <div className="bg-black">

      {/* Hero Section */}
      <CustomerHero />

      {/* 🌊 Premium Gradient Wave Separator */}
      <div className="relative -mt-1">
        <svg
          viewBox="0 0 1440 200"
          className="w-full h-28 md:h-36"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="waveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#facc15" />   {/* yellow */}
              <stop offset="50%" stopColor="#0ea5e9" />  {/* sky blue */}
              <stop offset="100%" stopColor="#facc15" /> {/* yellow */}
            </linearGradient>
          </defs>

          <path
            d="
              M0,120
              C300,200 600,0 900,120
              C1200,200 1350,60 1440,120
              L1440,200
              L0,200
              Z
            "
            fill="url(#waveGradient)"
            opacity="0.15"
          />
        </svg>
      </div>

      {/* Table Section */}
      <div className="relative z-10 px-6 pb-16 bg-black">
        <CustomerTable />
      </div>

    </div>
  );
}

export default Customers;
