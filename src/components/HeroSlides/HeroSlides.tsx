"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HERO_SLIDES } from "@/constants";
import styles from "./HeroSlides.module.scss";

type HeroSlidesProps = {
  /** ms each image stays before crossfading to the next */
  interval?: number;
};

export default function HeroSlides({ interval = 2000 }: HeroSlidesProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % HERO_SLIDES.length),
      interval
    );
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className={styles.slides}>
      {HERO_SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="300px"
          priority={i === 0}
          className={`${styles.slide} ${i === active ? styles.active : ""}`}
        />
      ))}
    </div>
  );
}
