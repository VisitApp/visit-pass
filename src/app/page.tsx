import Image from "next/image";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiStar,
} from "react-icons/fi";
import {
  CareCarousel,
  ClinicSection,
  FAQ,
  HeroSlides,
  MedicineSavings,
  Navbar,
  ScanCarousel,
  TestimonialCarousel,
} from "@/components";
import { clsx } from "@/utils/helpers";
import {
  careImages,
  clinicFeatures,
  doctors,
  faqs,
  testimonials,
  tests,
} from "@/constants";

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
        <section className={s.hero}>
          <Navbar logoSrc="/images/VisitLogo.webp" />
          <div className={s.heroBody}>
            <HeroSlides />
            <Image
              className={s.heroBadge}
              src="/images/offer.png"
              alt="OPD Pass Membership"
              width={276}
              height={48}
              priority
            />
          </div>
        </section>
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>
            {Array.from({ length: 2 }).map((_, copy) => (
              <ul
                className={s.marqueeGroup}
                key={copy}
                aria-hidden={copy === 1}
              >
                {["Consultation", "Lab Test", "Visit Clinic", "Cashless"].map(
                  (item) => (
                    <li key={item} className={s.marqueeItem}>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            ))}
          </div>
        </div>
        <section className={s.doctors}>
          <h2 className={s.doctorsTitle}>
            Meet our Doctors as many times as you need
          </h2>
          <p className={s.doctorsSubtitle}>
            Unlock free unlimited doctor consultations and thorough lab tests
            for the whole year
          </p>

          <div className={s.cardStack}>
            {doctors.map((doc) => (
              <article className={s.card} key={doc.name}>
                <div className={s.cardTop}>
                  <span className={s.avatar}>{doc.initials}</span>
                  <div className={s.cardRating}>
                    <FiStar aria-hidden="true" /> {doc.rating}
                  </div>
                </div>
                <div className={s.cardBody}>
                  <h3 className={s.cardName}>{doc.name}</h3>
                  <p className={s.cardSpecialty}>
                    {doc.specialty} · {doc.experience}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ClinicSection />

        <MedicineSavings />

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
