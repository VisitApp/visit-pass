"use client";

import { useEffect, useRef, useState } from "react";
import s from "./DateWheel.module.scss";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ITEM_H = 40;

const daysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate();

const pad = (n: number) => String(n).padStart(2, "0");

type Props = {
  /** current value as YYYY-MM-DD, or "" */
  value: string;
  /** earliest selectable year (default 1925) */
  minYear?: number;
  /** latest selectable year (default current year) */
  maxYear: number;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

type ColumnProps = {
  items: (string | number)[];
  index: number;
  onChange: (i: number) => void;
};

function Column({ items, index, onChange }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);

  // align to the selected index on mount / external change
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = index * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      const i = Math.max(
        0,
        Math.min(items.length - 1, Math.round(el.scrollTop / ITEM_H)),
      );
      el.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
      if (i !== index) onChange(i);
    }, 80);
  };

  return (
    <div className={s.column} ref={ref} onScroll={handleScroll}>
      <div className={s.pad} />
      {items.map((it, i) => (
        <div
          key={it}
          className={`${s.item} ${i === index ? s.itemActive : ""}`}
          onClick={() => {
            ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
            onChange(i);
          }}
        >
          {it}
        </div>
      ))}
      <div className={s.pad} />
    </div>
  );
}

export default function DateWheel({
  value,
  minYear = 1925,
  maxYear,
  onConfirm,
  onClose,
}: Props) {
  const init = value ? new Date(value) : new Date(maxYear - 25, 0, 1);
  const [day, setDay] = useState(init.getDate() - 1);
  const [month, setMonth] = useState(init.getMonth());
  const [year, setYear] = useState(
    Math.min(Math.max(init.getFullYear(), minYear), maxYear) - minYear,
  );
  const [closing, setClosing] = useState(false);

  // today's boundary — no future dates
  const now = new Date();
  const selectedYear = minYear + year;
  const isMaxYear = selectedYear === now.getFullYear();
  const maxMonth = isMaxYear ? now.getMonth() : 11;
  const isMaxMonth = isMaxYear && month === maxMonth;

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    String(minYear + i),
  );
  const months = MONTHS.slice(0, maxMonth + 1);
  const monthDays = daysInMonth(month, selectedYear);
  const dim = isMaxMonth ? Math.min(monthDays, now.getDate()) : monthDays;
  const days = Array.from({ length: dim }, (_, i) => pad(i + 1));

  // clamp month/day when a future selection would otherwise be possible
  useEffect(() => {
    if (month > maxMonth) setMonth(maxMonth);
  }, [maxMonth, month]);
  useEffect(() => {
    if (day > dim - 1) setDay(dim - 1);
  }, [dim, day]);

  const requestClose = () => setClosing(true);

  const confirm = () => {
    const y = minYear + year;
    onConfirm(`${y}-${pad(month + 1)}-${pad(Math.min(day, dim - 1) + 1)}`);
    requestClose();
  };

  return (
    <div
      className={`${s.overlay} ${closing ? s.closing : ""}`}
      onClick={requestClose}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <div className={s.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={s.head}>
          <button type="button" className={s.cancel} onClick={requestClose}>
            Cancel
          </button>
          <span className={s.headTitle}>Date of birth</span>
          <button type="button" className={s.done} onClick={confirm}>
            Done
          </button>
        </div>

        <div className={s.wheels}>
          <div className={s.selection} aria-hidden="true" />
          <Column
            key={`d-${month}-${year}`}
            items={days}
            index={day}
            onChange={setDay}
          />
          <Column
            key={`m-${isMaxYear}`}
            items={months}
            index={month}
            onChange={setMonth}
          />
          <Column items={years} index={year} onChange={setYear} />
        </div>
      </div>
    </div>
  );
}
