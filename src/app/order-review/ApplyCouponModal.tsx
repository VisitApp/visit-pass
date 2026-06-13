"use client";

import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Navbar } from "@/components";
import { applyUserCoupon, type Coupon, removeUserCoupon } from "@/services";
import { clsx } from "@/utils/helpers";
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
  const [closing, setClosing] = useState(false);

  const offLabel = `${Math.round(discountPercent)}% OFF`;

  // play the slide-down, then unmount when it finishes
  const requestClose = () => setClosing(true);

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
    requestClose();
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
    <div
      className={clsx(s.overlay, closing && s.closing)}
      onAnimationEnd={() => {
        if (closing) onClose();
      }}
    >
      <Navbar title="Apply Coupon" onBack={requestClose} />

      <div className={s.body}>
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
