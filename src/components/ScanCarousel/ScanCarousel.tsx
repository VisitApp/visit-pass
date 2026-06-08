"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { clsx } from "@/utils/helpers";
import TestCard, { type TestCardData } from "../TestCard/TestCard";
import styles from "./ScanCarousel.module.scss";

type ScanCarouselProps = {
  items: TestCardData[];
  /** ms between steps (hold + scroll) */
  interval?: number;
};

const CARD_WIDTH = 120;
const GAP = 20; // neighbours tuck behind the scaled-up active card
const PITCH = CARD_WIDTH + GAP;
const STEP_DURATION = 0.9; // s

export default function ScanCarousel({
  items,
  interval = 2600,
}: ScanCarouselProps) {
  const n = items.length;
  const half = Math.floor(n / 2);

  const [step, setStep] = useState(0);
  const [vw, setVw] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  // signed distance each card held on the previous render — used to spot the
  // card that wraps edge-to-edge so it teleports instead of sliding across.
  const prevDist = useRef<number[]>([]);

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

  const active = ((step % n) + n) % n;

  // ring distance of card i from the active card, folded into [-half, +half]
  const signedDist = (i: number): number => {
    const d = (((i - active) % n) + n) % n; // 0 … n-1
    return d > half ? d - n : d; // negative on the left side
  };

  const dists = Array.from({ length: n }, (_, i) => signedDist(i));

  // remember this render's layout so the next one can detect the wrap
  useEffect(() => {
    prevDist.current = dists;
  });

  return (
    <div className={styles.viewport} ref={viewportRef}>
      {dists.map((d, i) => {
        const x = vw / 2 - CARD_WIDTH / 2 + d * PITCH;
        const prev = prevDist.current[i];
        // a normal step moves a card by one pitch; a bigger jump means it just
        // wrapped from one edge to the other — snap it instantly.
        const wrapped = prev !== undefined && Math.abs(d - prev) > 1;
        return (
          <motion.div
            key={i}
            className={clsx(styles.slot, d === 0 && styles.slotActive)}
            style={{ width: CARD_WIDTH, y: "-50%" }}
            initial={false}
            animate={{ x }}
            transition={
              wrapped
                ? { duration: 0 }
                : { duration: STEP_DURATION, ease: "easeInOut" }
            }
          >
            <TestCard
              {...items[i]}
              className={clsx(styles.card, d === 0 && styles.cardActive)}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
