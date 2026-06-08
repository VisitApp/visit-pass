import type { TestCardData } from "@/components/TestCard/TestCard";

/** Static content / data constants shared across the app. */

export const testimonials = [
  {
    quote:
      "Everything I need in one place. Booking a teleconsultation was quick, and I got my medicines delivered the same day. The wellness content is a nice bonus too.",
    name: "Dhruv Singhal",
    role: "Project Manager • EY",
    savings: "saved ₹2500 on medicines & consultation",
  },
  {
    quote:
      "I added my parents to the family plan and the savings on their regular lab tests alone paid for the membership. No paperwork, no claims — just instant discounts.",
    name: "Ananya Rao",
    role: "Senior Designer • Swiggy",
    savings: "saved ₹4200 on lab tests",
  },
  {
    quote:
      "Unlimited consults meant I stopped putting off small health issues. The doctors are responsive and the in-clinic discount is real.",
    name: "Karan Malhotra",
    role: "Founder • Loop Labs",
    savings: "saved ₹3100 on consultations",
  },
  {
    quote:
      "The pharmacy discount adds up fast for a family of four. Genuinely the easiest healthcare spend I've made all year.",
    name: "Priya Nair",
    role: "Analyst • Deloitte",
    savings: "saved ₹2800 on medicines",
  },
];

export const faqs = [
  {
    question: "What is OPD Pass Gold, and what does ₹2,900 actually get me?",
    answer:
      "OPD Pass Gold is a one-year membership that gives you unlimited tele-consults, 50% off in-clinic doctor visits, 50% off prescribed labs and scans, and 25% off pharmacy purchases.",
  },
  {
    question: "Is this health insurance?",
    answer:
      "No. Insurance pays for hospitalisation, while OPD Pass covers everyday healthcare expenses outside the hospital, including consultations, lab tests, scans, and prescriptions. Most families benefit from having both.",
  },
  {
    question: "How do I actually use it at a clinic?",
    answer:
      "You receive a digital membership card in the Visit app immediately after payment. Simply visit any clinic in the Visit network, show the card at reception, and pay the discounted amount directly at the counter. No claim forms, reimbursements, or paperwork are required.",
  },
  {
    question: "Can I add my family, including my parents?",
    answer:
      "Yes. The 4-life plan (₹4,475/year) covers self, spouse, and 2 parents (or any combination of parents and in-laws). The 6-life plan (₹6,525/year) includes 2 additional parents. Children under 18 are included at no extra cost in any family plan, offering around 37% savings per person compared to individual plans.",
  },
];

export const careImages = [
  "/images/care/1.png",
  "/images/care/2.png",
  "/images/care/3.png",
  "/images/care/4.png",
  "/images/care/5.png",
  "/images/care/6.png",
];

export const tests: TestCardData[] = [
  {
    title: "HbA1c (Glycated Hemoglobin)",
    testsIncluded: 1,
    price: 375,
    mrp: 750,
    discountLabel: "50% off",
    frequentlyBookedWith: "CBC",
  },
  {
    title: "Complete Blood Count (CBC)",
    testsIncluded: 1,
    price: 199,
    mrp: 400,
    discountLabel: "50% off",
    frequentlyBookedWith: "Lipid Profile",
  },
  {
    title: "Lipid Profile",
    testsIncluded: 8,
    price: 449,
    mrp: 900,
    discountLabel: "50% off",
    frequentlyBookedWith: "HbA1c",
  },
  {
    title: "Thyroid Profile (T3 T4 TSH)",
    testsIncluded: 3,
    price: 299,
    mrp: 650,
    discountLabel: "54% off",
    frequentlyBookedWith: "CBC",
  },
  {
    title: "Vitamin D (25-OH)",
    testsIncluded: 1,
    price: 699,
    mrp: 1400,
    discountLabel: "50% off",
    frequentlyBookedWith: "Vitamin B12",
  },
  {
    title: "Liver Function Test (LFT)",
    testsIncluded: 11,
    price: 399,
    mrp: 850,
    discountLabel: "53% off",
    frequentlyBookedWith: "KFT",
  },
];

export const products = [
  { name: "Paracetamol 500mg", price: "₹40", mrp: "₹50", off: "20%" },
  { name: "Vitamin D3", price: "₹180", mrp: "₹240", off: "25%" },
  { name: "Cough Syrup", price: "₹95", mrp: "₹120", off: "21%" },
  { name: "Multivitamin", price: "₹320", mrp: "₹420", off: "24%" },
  { name: "Pain Relief Gel", price: "₹110", mrp: "₹140", off: "21%" },
];

export const doctors = [
  {
    name: "Dr. Aisha Khan",
    specialty: "Cardiologist",
    experience: "12 yrs exp",
    rating: "4.9",
    initials: "AK",
  },
  {
    name: "Dr. Rohan Mehta",
    specialty: "Dermatologist",
    experience: "9 yrs exp",
    rating: "4.8",
    initials: "RM",
  },
  {
    name: "Dr. Sara Iyer",
    specialty: "Pediatrician",
    experience: "15 yrs exp",
    rating: "4.9",
    initials: "SI",
  },
];

export const HERO_SLIDES = [
  "/images/people/pic1.png",
  "/images/people/pic2.png",
  "/images/people/pic3.png",
];

export const benefits = [
  {
    title: "Get Unlimited access with OPD Pass",
    subtitle: "Go cashless & pay using your OPD Pass.",
  },
  {
    title: "Book same day appointment",
    subtitle: "Instant confirmation guaranteed.",
  },
  {
    title: "Zero Wait Time",
    subtitle: "Going the extra mile to deliver care",
  },
];

export const clinicFeatures = [
  {
    icon: "card",
    title: "50% off in-clinic visits",
    description:
      "Walk into any Visit network clinic and pay half the consultation fee at the counter.",
  },
  {
    icon: "check",
    title: "No paperwork or claims",
    description:
      "Show your digital membership card at reception — no forms, no reimbursements, no waiting.",
  },
  {
    icon: "pin",
    title: "Clinics across your city",
    description:
      "Access a growing network of partner clinics, so quality care is always close by.",
  },
  {
    icon: "clock",
    title: "Same-day appointments",
    description:
      "Book in-clinic slots through the Visit app and get seen by a doctor the same day.",
  },
] as const;
