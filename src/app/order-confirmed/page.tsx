"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCheck, FiDownload, FiFileText } from "react-icons/fi";
import { Navbar } from "@/components";
import { getCartPricing } from "@/services";
import { COVER_VARIANT_KEY } from "@/utils/cart";
import s from "./orderConfirmed.module.scss";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function OrderConfirmedPage() {
  const router = useRouter();
  const [totalMembers, setTotalMembers] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [validity, setValidity] = useState("");

  useEffect(() => {
    const cv = Number(sessionStorage.getItem(COVER_VARIANT_KEY) || 0);
    if (cv) {
      (async () => {
        const res = await getCartPricing(cv);
        if (res.ok && res.data) {
          setTotalMembers(res.data.selectedMembers.length);
          setAmountPaid(res.data.finalCost);
        }
      })();
    }
    const now = new Date();
    const valid = new Date(now);
    valid.setFullYear(valid.getFullYear() + 1);
    setPurchaseDate(
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );
    setValidity(
      valid.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <div className={s.page}>
      <main className={s.main}>
        <Navbar title="Booking Confirmation" />
        <div className={s.scroll}>
          <section className={s.successCard}>
            <span className={s.checkCircle}>
              <FiCheck aria-hidden="true" />
            </span>
            <h1 className={s.successTitle}>Payment Successful!</h1>
            <p className={s.successText}>
              Your <strong>OPD Pass</strong> is almost ready, fill the members
              details to activate it.
            </p>

            <div className={s.passCard}>
              <div className={s.passGlow} aria-hidden="true" />
              <div className={s.passInner}>
                <span className={s.goldTag}>GOLD</span>
                <h2 className={s.passTitle}>OPD Pass</h2>
                <p className={s.passMembers}>{totalMembers} Members covered</p>
                <p className={s.passValidity}>Validity: {validity}</p>
              </div>
            </div>
          </section>

          <section className={s.summaryCard}>
            <div className={s.summaryHead}>
              <div className={s.summaryHeadLeft}>
                <FiFileText className={s.summaryIcon} aria-hidden="true" />
                <h3 className={s.summaryTitle}>Order Summary</h3>
              </div>
              <button type="button" className={s.invoice}>
                Download Invoice
                <FiDownload aria-hidden="true" />
              </button>
            </div>

            <div className={s.rows}>
              <div className={s.row}>
                <span className={s.rowLabel}>Item</span>
                <span className={s.rowValue}>OPD Pass Gold</span>
              </div>
              <div className={s.row}>
                <span className={s.rowLabel}>Date</span>
                <span className={s.rowValue}>{purchaseDate}</span>
              </div>
              <div className={s.row}>
                <span className={s.rowLabel}>Payment Method</span>
                <span className={`${s.rowValue} ${s.rowValueUpper}`}>UPI</span>
              </div>
            </div>

            <div className={s.amountRow}>
              <span className={s.amountLabel}>Amount Paid</span>
              <span className={s.amountValue}>{inr(amountPaid)}</span>
            </div>
          </section>
        </div>

        <footer className={s.footer}>
          <button
            type="button"
            className={s.cta}
            onClick={() => router.push("/member-details")}
          >
            Add Member Details
          </button>
        </footer>
      </main>
    </div>
  );
}
