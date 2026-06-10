import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
} from "react-icons/fi";
import {
  CareCarousel,
  ClinicSection,
  Doctors,
  FAQ,
  Hero,
  Membership,
  MedicineSavings,
  ScanCarousel,
  TestimonialCarousel,
} from "@/components";
import { clsx } from "@/utils/helpers";
import { careImages, faqs, testimonials, tests } from "@/constants";

const clinicIcons = {
  card: FiCreditCard,
  check: FiCheckCircle,
  pin: FiMapPin,
  clock: FiClock,
} as const;
import s from "./page.module.scss";

export default function Home() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <Hero />

        <Doctors />

        <section className={s.savings}>
          <h2 className={s.sectionTitle}>
            All tests and Scans are covered for you
          </h2>
          <p className={s.sectionSubtitle}>
            Your OPD Pass will cover all tests and radiology scans prescribed by
            our doctors, including MRIs, XRAYs and more.
          </p>

          <ScanCarousel items={tests} />
        </section>

        <MedicineSavings />

        <ClinicSection />

        <section className={s.savings}>
          <h2 className={s.sectionTitle}>
            Care that goes
            <br />
            beyond the consult
          </h2>
          <p className={s.sectionSubtitle}>
            Set the goal. Take the action. Watch the risk. Care that
            doesn&apos;t pause when your consult ends.
          </p>

          <CareCarousel images={careImages} />
        </section>

        <Membership />

        <section className={clsx(s.savings, s.faqSection)}>
          <h2 className={s.sectionTitle}>Testimonials</h2>
          <p className={s.sectionSubtitle}>
            Better care, lower costs proven by the people who matter most
          </p>

          <TestimonialCarousel items={testimonials} />
        </section>

        <section className={clsx(s.savings, s.faqSection)}>
          <h2 className={s.sectionTitle}>Frequently asked questions</h2>
          <p className={s.sectionSubtitle}>
            For any unanswered questions, reach out to our support team via
            email
          </p>

          <FAQ items={faqs} />
        </section>
      </main>
    </div>
  );
}
