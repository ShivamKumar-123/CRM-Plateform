// Industry preset registry — each preset describes vocabulary, pipeline stages,
// sources, accent color, icon name (Lucide), and a generator for seeded demo data.
//
// All five presets are pure, side-effect-free data. Live switching is handled
// by the IndustryContext, which calls db.set() to swap the active dataset.

const SOLAR = {
  id: "solar",
  label: "Solar CRM",
  tagline: "Rooftop, commercial, and utility-scale solar pipelines.",
  iconName: "Sun",
  accent: "from-yellow-400 to-amber-500",
  ring: "ring-yellow-400/40",
  hex: "#facc15",
  vocabulary: {
    leadNoun: "Installation lead",
    dealNoun: "Quote",
    customerNoun: "Site owner",
  },
  leadStages: ["New", "Site Survey", "Quoted", "Approved", "Lost"],
  dealStages: ["Qualification", "Proposal", "Negotiation", "Won", "Lost"],
  sources: ["Website", "Referral", "Door-to-door", "Facebook Ads", "Event"],
  sampleProducts: ["5 kW Rooftop", "10 kW Hybrid", "50 kW Commercial", "100 kW Net-Metering"],
  reps: ["Aarav Khanna", "Meera Joshi", "Karan Bedi", "Sanya Rao"],
  cities: ["Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Bengaluru", "Chennai"],
  firstNames: ["Rohit", "Priya", "Arjun", "Neha", "Vikram", "Ananya", "Suresh", "Anjali"],
  lastNames: ["Sharma", "Mehta", "Patel", "Kapoor", "Singh", "Iyer", "Verma", "Nair"],
  companySuffix: ["Industries", "Realty", "Constructions", "Hospitals", "Schools", "Farms"],
};

const REAL_ESTATE = {
  id: "real_estate",
  label: "Real Estate CRM",
  tagline: "Buyer enquiries, site visits, and broker pipelines.",
  iconName: "Building2",
  accent: "from-sky-400 to-blue-500",
  ring: "ring-sky-400/40",
  hex: "#38bdf8",
  vocabulary: {
    leadNoun: "Buyer enquiry",
    dealNoun: "Booking",
    customerNoun: "Owner",
  },
  leadStages: ["Enquiry", "Site Visit", "Negotiation", "Token Paid", "Lost"],
  dealStages: ["Shortlist", "Site Visit", "Offer", "Won", "Lost"],
  sources: ["99acres", "MagicBricks", "Walk-in", "Broker", "Instagram"],
  sampleProducts: ["2 BHK Apartment", "3 BHK Penthouse", "Commercial Office", "Plot 1200 sqft"],
  reps: ["Rahul Mehra", "Pooja Shah", "Imran Khan", "Divya Pillai"],
  cities: ["Mumbai", "Gurgaon", "Bengaluru", "Pune", "Noida", "Kolkata"],
  firstNames: ["Aakash", "Sneha", "Yash", "Riya", "Manish", "Tanvi", "Aditya", "Kavya"],
  lastNames: ["Gupta", "Bansal", "Chopra", "Malhotra", "Saxena", "Bhatia", "Kapadia", "Pillai"],
  companySuffix: ["Estates", "Properties", "Realty", "Builders", "Developers", "Group"],
};

const HEALTHCARE = {
  id: "healthcare",
  label: "Healthcare CRM",
  tagline: "Patient appointments, follow-ups, and clinic operations.",
  iconName: "HeartPulse",
  accent: "from-rose-400 to-pink-500",
  ring: "ring-rose-400/40",
  hex: "#fb7185",
  vocabulary: {
    leadNoun: "Patient enquiry",
    dealNoun: "Treatment plan",
    customerNoun: "Patient",
  },
  leadStages: ["New", "Consulted", "Diagnosed", "Treatment", "Discharged"],
  dealStages: ["Consultation", "Diagnostics", "Plan Proposed", "Won", "Lost"],
  sources: ["Practo", "Walk-in", "Referral", "Insurance", "Camp"],
  sampleProducts: ["Dental Implant", "Cardiac Check-up", "MRI Package", "Physio Sessions"],
  reps: ["Dr. Nidhi", "Dr. Sameer", "Dr. Ritu", "Dr. Aman"],
  cities: ["Delhi", "Chennai", "Bengaluru", "Kolkata", "Hyderabad", "Mumbai"],
  firstNames: ["Asha", "Rakesh", "Sunita", "Vikas", "Lata", "Deepak", "Sarita", "Mohan"],
  lastNames: ["Reddy", "Bose", "Mishra", "Pandey", "Choudhary", "Trivedi", "Goel", "Khan"],
  companySuffix: ["Clinic", "Hospital", "Diagnostics", "Wellness", "Care", "Centre"],
};

const LOGISTICS = {
  id: "logistics",
  label: "Logistics CRM",
  tagline: "Freight enquiries, shipment quotes, and fleet utilization.",
  iconName: "Truck",
  accent: "from-emerald-400 to-green-500",
  ring: "ring-emerald-400/40",
  hex: "#34d399",
  vocabulary: {
    leadNoun: "Shipment enquiry",
    dealNoun: "Freight contract",
    customerNoun: "Shipper",
  },
  leadStages: ["Enquiry", "Quoted", "Booked", "In-transit", "Delivered"],
  dealStages: ["Quote Sent", "Negotiation", "Contract", "Won", "Lost"],
  sources: ["Website", "Cold Call", "LinkedIn", "Referral", "Trade Show"],
  sampleProducts: ["FTL Pan-India", "LTL Express", "Cold-chain", "Bonded Warehouse"],
  reps: ["Arpit Jain", "Sneha Iyer", "Mohit Bansal", "Ritika Sen"],
  cities: ["Mumbai", "Chennai", "Kolkata", "Delhi", "Bengaluru", "Ahmedabad"],
  firstNames: ["Sandeep", "Geeta", "Naveen", "Ishita", "Tarun", "Madhu", "Hemant", "Lalita"],
  lastNames: ["Yadav", "Rao", "Desai", "Gowda", "Naidu", "Pawar", "Bhandari", "Roy"],
  companySuffix: ["Logistics", "Movers", "Cargo", "Supply Co", "Freight", "Transport"],
};

const INSURANCE = {
  id: "insurance",
  label: "Insurance CRM",
  tagline: "Policy renewals, agent leads, and claims management.",
  iconName: "ShieldCheck",
  accent: "from-violet-400 to-purple-500",
  ring: "ring-violet-400/40",
  hex: "#a78bfa",
  vocabulary: {
    leadNoun: "Policy enquiry",
    dealNoun: "Policy sale",
    customerNoun: "Policyholder",
  },
  leadStages: ["New", "Documents", "Underwriting", "Issued", "Lapsed"],
  dealStages: ["Lead", "Quote", "Documents", "Won", "Lost"],
  sources: ["Aggregator", "Agent", "Referral", "Website", "Tele-calling"],
  sampleProducts: ["Term Plan 1 Cr", "Family Health 10 L", "Motor Comprehensive", "Travel Cover"],
  reps: ["Rohan Kapoor", "Aastha Verma", "Dev Patil", "Nikita Sehgal"],
  cities: ["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Indore", "Lucknow"],
  firstNames: ["Manoj", "Pallavi", "Akshay", "Tejas", "Bhavna", "Rohini", "Vishal", "Sneha"],
  lastNames: ["Agarwal", "Bhatt", "Sinha", "Kulkarni", "Menon", "Saini", "Tiwari", "Dey"],
  companySuffix: ["Assurance", "Insure", "Securities", "Family", "Group", "Plans"],
};

export const INDUSTRIES = [SOLAR, REAL_ESTATE, HEALTHCARE, LOGISTICS, INSURANCE];

export function getIndustry(id) {
  return INDUSTRIES.find((i) => i.id === id) || SOLAR;
}
