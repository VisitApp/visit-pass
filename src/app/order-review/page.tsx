"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCheck, FiChevronRight, FiPercent } from "react-icons/fi";
import { Navbar } from "@/components";
import {
  type CartSummary,
  getCartSummary,
  saveCart,
  transactUrl,
} from "@/services";
import { COVER_VARIANT_KEY, keyForMember, RELATION_META } from "@/utils/cart";
import ApplyCouponModal from "./ApplyCouponModal";
import s from "./orderReview.module.scss";

const ORDER = [
  "self",
  "spouse",
  "son",
  "daughter",
  "father",
  "mother",
  "fatherInLaw",
  "motherInLaw",
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function OrderReviewPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const loadSummary = async () => {
    const res = await getCartSummary();
    if (res.unauthorized) {
      router.replace("/login");
      return;
    }
    if (res.ok && res.data) setSummary(res.data);
  };

  useEffect(() => {
    if (!sessionStorage.getItem(COVER_VARIANT_KEY)) {
      router.replace("/details");
      return;
    }
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const couponApplied = (summary?.couponApplied ?? 0) === 1;
  const couponCode = summary?.coupons?.[0]?.couponName ?? "";
  const discountPercent = parseFloat(summary?.discountPrecent ?? "0");

  async function handlePay() {
    if (paying) return;
    setPaying(true);
    setPayError("");
    const res = await saveCart();
    if (res.unauthorized) {
      router.replace("/login");
      return;
    }
    if (!res.ok || !res.cartId) {
      setPaying(false);
      setPayError(res.error || "Couldn't start payment");
      return;
    }
    const userId = summary?.usersDetails?.userId;
    if (!userId) {
      router.replace("/login");
      return;
    }
    // full-page navigation to the Cashfree checkout page
    window.location.href = transactUrl(userId, res.cartId);
  }

  // counts per member key, derived from the cart summary
  const counts: Record<string, number> = {};
  for (const m of summary?.selectedMembers ?? []) {
    const key = keyForMember(m.relationId);
    if (key) counts[key] = (counts[key] ?? 0) + 1;
  }

  const covered = ORDER.filter((k) => (counts[k] ?? 0) > 0).map((k) => {
    const count = counts[k] ?? 0;
    const meta = RELATION_META[k];
    return {
      key: k,
      img: meta.img,
      label: count > 1 ? `${meta.label}(${count})` : meta.label,
    };
  });

  const totalMembers = summary?.selectedMembers.length ?? 0;
  const planName = summary?.selectedOpdPlan?.name ?? "OPD Pass";
  const planBadge = summary?.selectedOpdPlan?.description ?? "GOLD";
  const subtotal = summary?.cost ?? 0;
  const youPay = summary?.finalCost ?? 0;
  const discount = summary?.discount ?? subtotal - youPay;

  return (
    <div className={s.page}>
      <main className={s.main}>
        <Navbar title="Order Review" />

        <div className={s.progress}>
          <span className={s.progressFill} />
        </div>

        <div className={s.scroll}>
          <h2 className={s.sectionTitle}>Pass Details</h2>

          <div className={s.passWrap}>
            <div className={s.passCard}>
              <div className={s.passGlow} aria-hidden="true" />
              <div className={s.passInner}>
                <span className={s.goldTag}>{planBadge}</span>
                <h3 className={s.passTitle}>{planName}</h3>
                <p className={s.passMembers}>{totalMembers} Members covered</p>
                <div className={s.passPriceRow}>
                  <span className={s.passPrice}>{inr(youPay)}</span>
                  <span className={s.passPer}>/year</span>
                </div>
                <p className={s.passBilled}>billed annually</p>
              </div>
            </div>

            <p className={s.coveredLabel}>Members covered</p>
            <div className={s.chips}>
              {covered.map((m) => (
                <span className={s.chip} key={m.key}>
                  <Image
                    className={s.chipAvatar}
                    src={m.img}
                    alt=""
                    width={24}
                    height={24}
                  />
                  <span className={s.chipLabel}>{m.label}</span>
                </span>
              ))}
            </div>
          </div>

          <h2 className={s.sectionTitle}>Coupon &amp; Offers</h2>
          <button
            type="button"
            className={s.coupon}
            onClick={() => setShowCoupon(true)}
          >
            <span className={s.couponIcon}>
              <FiPercent aria-hidden="true" />
            </span>
            <span className={s.couponBody}>
              <span className={s.couponTitle}>
                {couponApplied ? `${couponCode} applied` : "Apply Coupon"}
              </span>
              <span className={s.couponSub}>
                {couponApplied
                  ? "Coupon discount applied"
                  : "Extra discount up to 20%"}
              </span>
            </span>
            <FiChevronRight className={s.couponChevron} aria-hidden="true" />
          </button>

          <div className={s.divider} />

          <div className={s.priceRow}>
            <span>
              {planName} {planBadge} x {totalMembers} members
            </span>
            <span>{inr(subtotal)}</span>
          </div>
          <div className={`${s.priceRow} ${s.priceRowDiscount}`}>
            <span>Discount</span>
            <span>-{inr(discount)}</span>
          </div>
          <div className={`${s.priceRow} ${s.priceRowTotal}`}>
            <span className={s.priceRowLabelMuted}>Total Cost</span>
            <span>{inr(youPay)}</span>
          </div>
          <div className={`${s.priceRow} ${s.priceRowTotal}`}>
            <span>You Pay</span>
            <span>{inr(youPay)}</span>
          </div>
        </div>

        {discount > 0 && (
          <div className={s.savingsBanner}>
            <FiCheck className={s.savingsIcon} aria-hidden="true" />
            You are saving <strong>{inr(discount)}</strong> on this order
          </div>
        )}

        <footer className={s.footer}>
          {payError && <p className={s.footerError}>{payError}</p>}
          <button
            type="button"
            className={s.cta}
            onClick={handlePay}
            disabled={paying}
          >
            {paying ? "Processing…" : `Confirm & Pay ${inr(youPay)}`}
          </button>
        </footer>

        {showCoupon && (
          <ApplyCouponModal
            coupons={summary?.coupons ?? []}
            appliedCode={couponApplied ? couponCode : null}
            discountPercent={discountPercent}
            onClose={() => setShowCoupon(false)}
            onChanged={loadSummary}
          />
        )}
      </main>
    </div>
  );
}
