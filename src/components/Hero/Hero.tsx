import Image from "next/image";
import { FiChevronDown } from "react-icons/fi";
import HeroSlides from "../HeroSlides/HeroSlides";
import Navbar from "../Navbar/Navbar";
import s from "./Hero.module.scss";

export default function Hero() {
  return (
    <div className={s.heroWrap}>
      <section className={s.hero}>
        <Navbar logoSrc="/images/VisitLogo.webp" />
        <div className={s.heroBody}>
          <div className={s.heroGroup}>
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
        </div>
        <div className={s.scrollCue} aria-hidden="true">
          <p className={s.scrollText}>
            Your complete
            <br />
            health, covered.
          </p>
          <FiChevronDown className={s.chevron} />
          <FiChevronDown className={s.chevron} />
          <FiChevronDown className={s.chevron} />
        </div>
      </section>
      <div className={s.marquee}>
        <div className={s.marqueeTrack}>
          {Array.from({ length: 2 }).map((_, copy) => (
            <ul className={s.marqueeGroup} key={copy} aria-hidden={copy === 1}>
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
    </div>
  );
}
