"use client";

import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { clsx } from "@/utils/helpers";
import styles from "./FAQ.module.scss";

type FaqItem = { question: string; answer: string };

type FAQProps = {
  items: FaqItem[];
};

export default function FAQ({ items }: FAQProps) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className={styles.list}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        return (
          <div className={clsx(styles.item, isOpen && styles.itemOpen)} key={i}>
            <button
              type="button"
              className={styles.question}
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
            >
              <span>{item.question}</span>
              {isOpen ? (
                <FiMinus className={styles.icon} aria-hidden="true" />
              ) : (
                <FiPlus className={styles.icon} aria-hidden="true" />
              )}
            </button>
            <div className={styles.answerWrap} hidden={!isOpen}>
              <p className={styles.answer}>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
