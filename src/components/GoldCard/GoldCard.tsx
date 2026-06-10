import Image from "next/image";
import Dental from "@/icons/Dental.svg";
import Hospital from "@/icons/Hospital.svg";
import PharmacyDiscount from "@/icons/PharmacyDiscount.svg";
import Test from "@/icons/Test.svg";
import User from "@/icons/User.svg";

type Benefit = {
  icon: string;
  title: string;
  highlight?: string;
  subtitle: string;
};

const benefits: Benefit[] = [
  {
    icon: User,
    title: "Unlimited Teleconsults",
    subtitle: "with MD internal medicine",
  },
  {
    icon: Hospital,
    title: "In-clinic Consultation",
    highlight: "50% off",
    subtitle: "on in-clinic specialist",
  },
  {
    icon: Test,
    title: "Labs & Diagnostics",
    highlight: "50% off",
    subtitle: "on all prescribed tests & scans",
  },
  {
    icon: PharmacyDiscount,
    title: "Pharmacy Discount",
    highlight: "20% off",
    subtitle: "on prescribed pharmacy",
  },
  {
    icon: Dental,
    title: "Dental Discount",
    highlight: "20% off",
    subtitle: "on dental consults, checkups & procedures",
  },
];

import s from "./GoldCard.module.scss";

export default function GoldCard() {
  return (
    <div className={s.outerBorder}>
      <div className={s.badge}>Top family pick</div>
      <div className={s.card}>
        <div className={s.content}>
          <header className={s.header}>
            <div className={s.headerGlow} aria-hidden="true" />
            <div className={s.headerInner}>
              <div className={s.titleRow}>
                <h1 className={s.title}>OPD PASS</h1>
                <span className={s.goldTag}>GOLD</span>
              </div>
              <p className={s.tagline}>Consultation • Lab Test • Pharmacy</p>
              <div className={s.priceBlock}>
                <p className={s.startingAt}>starting at</p>
                <div className={s.priceRow}>
                  <span className={s.price}>₹2900</span>
                  <span className={s.per}>/year</span>
                </div>
                <p className={s.billed}>billed annually</p>
              </div>
            </div>
          </header>

          <div className={s.divider}>
            <span className={s.dividerLabel}>WHAT&apos;S INCLUDED</span>
            <span className={s.dividerLine} />
          </div>

          <section className={s.benefits}>
            {benefits.map((b) => {
              return (
                <div className={s.benefit} key={b.title}>
                  <div className={s.iconBox}>
                    <Image
                      className={s.icon}
                      src={b.icon}
                      alt=""
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <h3 className={s.benefitTitle}>{b.title}</h3>
                    <p className={s.benefitSubtitle}>
                      {b.highlight && (
                        <span className={s.highlight}>{b.highlight} </span>
                      )}
                      {b.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
