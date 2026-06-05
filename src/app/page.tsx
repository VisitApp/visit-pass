import Image from "next/image";
import { FiPlus, FiStar } from "react-icons/fi";
import { CareCarousel, HeroSlides, Navbar, ScanCarousel } from "@/components";
import styles from "./page.module.scss";

const scans = [
  { label: "MRI" },
  { label: "X-Ray" },
  { label: "CT Scan" },
  { label: "Blood Test" },
  { label: "Ultrasound" },
  { label: "ECG" },
];

const products = [
  { name: "Paracetamol 500mg", price: "₹40", mrp: "₹50", off: "20%" },
  { name: "Vitamin D3", price: "₹180", mrp: "₹240", off: "25%" },
  { name: "Cough Syrup", price: "₹95", mrp: "₹120", off: "21%" },
  { name: "Multivitamin", price: "₹320", mrp: "₹420", off: "24%" },
  { name: "Pain Relief Gel", price: "₹110", mrp: "₹140", off: "21%" },
];

const doctors = [
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

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <Navbar logoSrc="/VisitLogo.webp" />
          <div className={styles.heroBody}>
            <HeroSlides />
            <Image
              className={styles.heroBadge}
              src="/offer.png"
              alt="OPD Pass Membership"
              width={276}
              height={48}
              priority
            />
          </div>
        </section>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {Array.from({ length: 2 }).map((_, copy) => (
              <ul className={styles.marqueeGroup} key={copy} aria-hidden={copy === 1}>
                {["Consultation", "Lab Test", "Visit Clinic", "Cashless"].map(
                  (item) => (
                    <li key={item} className={styles.marqueeItem}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            ))}
          </div>
        </div>
        <section className={styles.doctors}>
          <h2 className={styles.doctorsTitle}>
            Meet our Doctors as many times as you need
          </h2>
          <p className={styles.doctorsSubtitle}>
            Unlock free unlimited doctor consultations and thorough lab tests
            for the whole year
          </p>

          <div className={styles.cardStack}>
            {doctors.map((doc) => (
              <article className={styles.card} key={doc.name}>
                <div className={styles.cardTop}>
                  <span className={styles.avatar}>{doc.initials}</span>
                  <div className={styles.cardRating}>
                    <FiStar aria-hidden="true" /> {doc.rating}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardName}>{doc.name}</h3>
                  <p className={styles.cardSpecialty}>
                    {doc.specialty} · {doc.experience}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.savings}>
          <h2 className={styles.sectionTitle}>Smarter Savings on Medicines</h2>
          <p className={styles.sectionSubtitle}>
            Enjoy a minimum of 20% off on every order — delivered to you,
            effortlessly.
          </p>

          <div className={styles.diagonals}>
            <div className={styles.diagBanner}>20% off on all medicines</div>
            <span className={`${styles.glow} ${styles.glowTL}`} aria-hidden="true" />
            <span className={`${styles.glow} ${styles.glowTR}`} aria-hidden="true" />
            <span className={`${styles.glow} ${styles.glowBL}`} aria-hidden="true" />
            <span className={`${styles.glow} ${styles.glowBR}`} aria-hidden="true" />
            {[styles.diagTrackA, styles.diagTrackB].map((track, t) => (
              <div className={`${styles.diagTrack} ${track}`} key={t}>
                <div className={styles.diagRow}>
                  {[0, 1, 2, 3].map((copy) => (
                    <div
                      className={styles.diagGroup}
                      key={copy}
                      aria-hidden={copy !== 0}
                    >
                      {products.map((p) => (
                        <article className={styles.productCard} key={p.name}>
                          <div className={styles.productThumb}>
                            <span className={styles.productAdd}>
                              <FiPlus aria-hidden="true" />
                            </span>
                          </div>
                          <div className={styles.productInfo}>
                            <h3 className={styles.productName}>{p.name}</h3>
                            <div className={styles.productPrice}>
                              <strong>{p.price}</strong>
                              <span className={styles.productMrp}>{p.mrp}</span>
                            </div>
                          </div>
                          <span className={styles.productBadge}>{p.off} OFF</span>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.savings}>
          <h2 className={styles.sectionTitle}>
            All tests and Scans are covered for you
          </h2>
          <p className={styles.sectionSubtitle}>
            Your OPD Pass will cover all tests and radiology scans prescribed by
            our doctors, including MRIs, XRAYs and more.
          </p>

          <ScanCarousel items={scans} />
        </section>

        <section className={styles.savings}>
          <h2 className={styles.sectionTitle}>
            Care that goes
            <br />
            beyond the consult
          </h2>
          <p className={styles.sectionSubtitle}>
            Set the goal. Take the action. Watch the risk. Care that doesn&apos;t
            pause when your consult ends.
          </p>

          <CareCarousel count={4} />
        </section>
      </main>
    </div>
  );
}
