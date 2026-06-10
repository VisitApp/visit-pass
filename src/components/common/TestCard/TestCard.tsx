"use client";

import { FiPlus, FiTrendingUp } from "react-icons/fi";
import { clsx } from "@/utils/helpers";
import styles from "./TestCard.module.scss";

export type TestCardData = {
  title: string;
  /** number of tests bundled, e.g. "1 test included" */
  testsIncluded?: number;
  price: number;
  /** original/struck-through price */
  mrp?: number;
  /** badge text, e.g. "50% OFF" */
  discountLabel?: string;
  /** name shown in the "Frequently booked with …" header */
  frequentlyBookedWith?: string;
};

type TestCardProps = TestCardData & {
  className?: string;
  onAdd?: () => void;
};

const inr = (n: number) => `₹${n}`;

export default function TestCard({
  title,
  testsIncluded,
  price,
  mrp,
  discountLabel,
  frequentlyBookedWith,
  className,
  onAdd,
}: TestCardProps) {
  return (
    <article className={clsx(styles.card, className)}>
      {frequentlyBookedWith && (
        <header className={styles.header}>
          <FiTrendingUp className={styles.trendIcon} aria-hidden="true" />
          <span className={styles.headerText}>
            Frequently booked with {frequentlyBookedWith}
          </span>
        </header>
      )}

      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>

        {testsIncluded != null && (
          <p className={styles.included}>
            {testsIncluded} test{testsIncluded === 1 ? "" : "s"} included
          </p>
        )}

        <div className={styles.footer}>
          <div className={styles.pricing}>
            <div className={styles.priceRow}>
              <span className={styles.price}>{inr(price)}</span>
              {mrp != null && <span className={styles.mrp}>{inr(mrp)}</span>}
            </div>
            {discountLabel && (
              <div className={styles.discount}>{discountLabel}</div>
            )}
          </div>

          <button
            type="button"
            aria-label={`Add ${title} to cart`}
            className={styles.add}
            onClick={onAdd}
          >
            <FiPlus aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.bottomStrip} aria-hidden="true" />
    </article>
  );
}
