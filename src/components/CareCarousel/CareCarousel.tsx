"use client";

import { useEffect, useState } from "react";
import styles from "./CareCarousel.module.scss";

type CareCarouselProps = {
  count?: number;
  /** ms each card holds before advancing */
  interval?: number;
};

export default function CareCarousel({
  count = 4,
  interval = 2600,
}: CareCarouselProps) {
  // duplicate the set so we can step past the end then reset seamlessly
  const list = Array.from({ length: count * 2 });

  const [step, setStep] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  useEffect(() => {
    if (!animate) {
      const r = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimate(true))
      );
      return () => cancelAnimationFrame(r);
    }
  }, [animate]);

  const handleEnd = () => {
    if (step >= count) {
      setAnimate(false);
      setStep(0);
    }
  };

  return (
    <div className={styles.track}>
      <div
        className={styles.row}
        style={{
          transform: `translateX(calc(${-step} * (300px + var(--space-3))))`,
          transition: animate ? "transform 0.7s ease" : "none",
        }}
        onTransitionEnd={handleEnd}
      >
        {list.map((_, i) => (
          <div className={styles.card} key={i} aria-hidden={i >= count} />
        ))}
      </div>
    </div>
  );
}
