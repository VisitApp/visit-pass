import Image from "next/image";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiPlus,
  FiStar,
} from "react-icons/fi";
import {
  CareCarousel,
  FAQ,
  HeroSlides,
  Navbar,
  ScanCarousel,
  TestimonialCarousel,
} from "@/components";
import { clsx } from "@/utils/helpers";
import Calendar from "@/icons/Calendar.svg";
import Clock from "@/icons/Clock.svg";
import Discount from "@/icons/Discount.svg";
import {
  benefits,
  careImages,
  clinicFeatures,
  doctors,
  faqs,
  products,
  testimonials,
  tests,
} from "@/constants";

const clinicIcons = {
  card: FiCreditCard,
  check: FiCheckCircle,
  pin: FiMapPin,
  clock: FiClock,
} as const;

const benefitIcons = [Clock, Calendar, Discount];
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

        <section className={s.clinicSection}>
          <h2 className={s.title}>Access to Visit Clinic</h2>
          <Image
            src="./images/VisitClinic.png"
            height={240}
            width={335}
            alt={""}
          />
          <div className={s.benefitList}>
            {benefits.map((b, i) => (
              <div className={s.benefitCard} key={b.title}>
                {benefitIcons[i] && (
                  <Image
                    className={s.benefitIcon}
                    src={benefitIcons[i]}
                    alt=""
                    width={32}
                    height={32}
                  />
                )}
                <div className={s.benefitText}>
                  <h3 className={s.benefitTitle}>{b.title}</h3>
                  {b.subtitle && (
                    <p className={s.benefitSubtitle}>{b.subtitle}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <h2 className={s.titleBottom}>
            No waiting, no billing,
            <br /> no hassles
          </h2>
        </section>

        <section className={s.savings}>
          <h2 className={s.sectionTitle}>Smarter Savings on Medicines</h2>
          <p className={s.sectionSubtitle}>
            Enjoy a minimum of 20% off on every order — delivered to you,
            effortlessly.
          </p>

          <div className={s.diagonals}>
            <div className={s.diagBanner}>20% off on all medicines</div>
            <span className={clsx(s.glow, s.glowTL)} aria-hidden="true" />
            <span className={clsx(s.glow, s.glowTR)} aria-hidden="true" />
            <span className={clsx(s.glow, s.glowBL)} aria-hidden="true" />
            <span className={clsx(s.glow, s.glowBR)} aria-hidden="true" />
            {[s.diagTrackA, s.diagTrackB].map((track, t) => (
              <div className={clsx(s.diagTrack, track)} key={t}>
                <div className={s.diagRow}>
                  {[0, 1, 2, 3].map((copy) => (
                    <div
                      className={s.diagGroup}
                      key={copy}
                      aria-hidden={copy !== 0}
                    >
                      {products.map((p) => (
                        <article className={s.productCard} key={p.name}>
                          <div className={s.productThumb}>
                            <span className={s.productAdd}>
                              <FiPlus aria-hidden="true" />
                            </span>
                          </div>
                          <div className={s.productInfo}>
                            <h3 className={s.productName}>{p.name}</h3>
                            <div className={s.productPrice}>
                              <strong>{p.price}</strong>
                              <span className={s.productMrp}>{p.mrp}</span>
                            </div>
                          </div>
                          <span className={s.productBadge}>{p.off} OFF</span>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

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
