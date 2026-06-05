"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ScanCarousel.module.scss";

type ScanItem = { label: string };

type ScanCarouselProps = {
  items: ScanItem[];
  /** ms between steps (hold + scroll) */
  interval?: number;
};

const CARD_WIDTH = 120;
const GAP = 20; // sides tuck behind the center yet bleed a bit off the edges
const PITCH = CARD_WIDTH + GAP;
const COPIES = 3;

export default function ScanCarousel({
  items,
  interval = 2600,
}: ScanCarouselProps) {
  const n = items.length;
  const list = Array.from({ length: COPIES }).flatMap(() => items);

  const [step, setStep] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [vw, setVw] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  // track viewport width so the active card stays centered
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setVw(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // advance one item per interval
  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), interval);
    return () => clearInterval(id);
  }, [interval]);

  // re-enable transition the frame after an instant reset
  useEffect(() => {
    if (!animate) {
      const r = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimate(true))
      );
      return () => cancelAnimationFrame(r);
    }
  }, [animate]);

  const handleEnd = () => {
    if (step >= n) {
      setAnimate(false);
      setStep(0);
    }
  };

  // center the active card (kept in the middle copy so items flank both sides)
  const activeIndex = n + step;
  const translate = vw / 2 - (activeIndex * PITCH + CARD_WIDTH / 2);

  return (
    <div className={styles.viewport} ref={viewportRef}>
      <div
        className={`${styles.row} ${animate ? "" : styles.instant}`}
        style={{
          transform: `translateX(${translate}px)`,
          transition: animate ? "transform 0.9s ease" : "none",
        }}
        onTransitionEnd={handleEnd}
      >
        {list.map((_, i) => (
          <div
            key={i}
            className={`${styles.card} ${i === activeIndex ? styles.active : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
