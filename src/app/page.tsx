import {
  Care,
  Clinic,
  Doctors,
  FAQSection,
  Hero,
  Membership,
  Medicines,
  Testimonials,
  TestsAndScans,
} from "@/components";
import s from "./page.module.scss";

export default function Home() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <Hero />
        <Doctors />
        <TestsAndScans />
        <Medicines />
        <Clinic />
        <Care />
        <Membership />
        <Testimonials />
        <FAQSection />
      </main>
    </div>
  );
}
