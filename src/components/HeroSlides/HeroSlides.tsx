"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./HeroSlides.module.scss";

const SLIDES = ["/pic1.png", "/pic2.png", "/pic3.png"];

type HeroSlidesProps = {
  /** ms each image stays before crossfading to the next */
  interval?: number;
};

export default function HeroSlides({ interval = 2000 }: HeroSlidesProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((i) => (i + 1) % SLIDES.length),
      interval
    );
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className={styles.slides}>
      {SLIDES.map((src, i) => (
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
