"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { HERO_SLIDES } from "@/constants";
import Navbar from "../../common/Navbar/Navbar";
import s from "./Hero.module.scss";

/** ms each hero image stays before crossfading to the next */
const SLIDE_INTERVAL = 2000;

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      SLIDE_INTERVAL,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className={s.heroWrap}>
      <section className={s.hero}>
        <Navbar logoSrc="/images/VisitLogo.webp" />
        <div className={s.heroBody}>
          <div className={s.heroGroup}>
            <div className={s.slides}>
              {HERO_SLIDES.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="300px"
                  priority={i === 0}
                  className={`${s.slide} ${i === active ? s.active : ""}`}
                />
              ))}
            </div>
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
