"use client";

import { useState } from "react";
import { FiCheck, FiChevronLeft } from "react-icons/fi";
import { applyUserCoupon, type Coupon, removeUserCoupon } from "@/services";
import s from "./ApplyCouponModal.module.scss";

type Props = {
  coupons: Coupon[];
  appliedCode: string | null;
  discountPercent: number;
  onClose: () => void;
  /** refresh the cart summary after a change */
  onChanged: () => Promise<void> | void;
};

export default function ApplyCouponModal({
  coupons,
  appliedCode,
  discountPercent,
  onClose,
  onChanged,
}: Props) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const offLabel = `${Math.round(discountPercent)}% OFF`;

  async function apply(value: string) {
    const trimmed = value.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError("");
    const res = await applyUserCoupon(trimmed);
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Couldn't apply coupon");
      return;
    }
    await onChanged();
    onClose();
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await removeUserCoupon();
    setBusy(false);
    if (!res.ok) {
      setError(res.error || "Couldn't remove coupon");
      return;
    }
    await onChanged();
  }

  return (
    <div className={s.overlay}>
      <header className={s.header}>
        <button
          type="button"
          className={s.back}
          onClick={onClose}
          aria-label="Close"
        >
          <FiChevronLeft size={24} aria-hidden="true" />
        </button>
        <h1 className={s.title}>Apply Coupon</h1>
      </header>

      <div className={s.body}>
        <div className={s.inputWrap}>
          <input
            className={s.input}
            type="text"
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply(code)}
          />
          <button
            type="button"
            className={s.applyBtn}
            onClick={() => apply(code)}
            disabled={!code.trim() || busy}
          >
            APPLY
          </button>
        </div>

        {error && <p className={s.error}>{error}</p>}

        <h2 className={s.sectionTitle}>Available Coupons</h2>
        <div className={s.list}>
          {coupons.map((c) => {
            const isApplied = appliedCode === c.couponName;
            const off = c.couponDiscount ? `${c.couponDiscount} OFF` : offLabel;
            return (
              <article className={s.card} key={c.couponName}>
                <div className={s.stub}>
                  <span className={s.off}>{off}</span>
                </div>
                <div className={s.content}>
                  <div className={s.cardTop}>
                    <div>
                      <h3 className={s.code}>{c.couponName}</h3>
                      {c.subHeading && (
                        <p className={s.couponDesc}>{c.subHeading}</p>
                      )}
                    </div>
                    {isApplied ? (
                      <button
                        type="button"
                        className={s.cardAction}
                        onClick={remove}
                        disabled={busy}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={s.cardAction}
                        onClick={() => apply(c.couponName)}
                        disabled={busy}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  <p className={s.detail}>
                    {isApplied ? (
                      <span className={s.applied}>
                        <FiCheck aria-hidden="true" /> Applied
                      </span>
                    ) : (
                      c.description
                    )}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
