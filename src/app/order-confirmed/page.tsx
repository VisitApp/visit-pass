"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Navbar } from "@/components";
import PaymentDone from "@/icons/PaymentDone.svg";
import Receipt from "@/icons/receipt.svg";
import { getCartPricing, getCartSummary } from "@/services";
import { COVER_VARIANT_KEY, MEMBERS_KEY, TOKEN_KEY } from "@/utils/cart";
import s from "./orderConfirmed.module.scss";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function OrderConfirmed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [totalMembers, setTotalMembers] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [validity, setValidity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Payment gateway redirects here with the auth token in the URL.
    // Persist it so AuthGuard and the pricing API can use it.
    const urlToken = searchParams.get("token");
    if (urlToken) {
      sessionStorage.setItem(TOKEN_KEY, urlToken);
    }

    (async () => {
      const summary = await getCartSummary();
      console.log("cart-summary:", summary);

      // Carry the members forward (incl. self) so member-details renders from
      // these instead of refetching.
      if (summary.ok && summary.data) {
        sessionStorage.setItem(
          MEMBERS_KEY,
          JSON.stringify(summary.data.selectedMembers),
        );
      }

      const cv = Number(sessionStorage.getItem(COVER_VARIANT_KEY) || 0);
      if (cv) {
        const res = await getCartPricing(cv);
        if (res.ok && res.data) {
          setTotalMembers(res.data.selectedMembers.length);
          setAmountPaid(res.data.finalCost);
        }
      }
      setLoading(false);
    })();

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
  }, [searchParams]);

  return (
    <div className={s.page}>
      <main className={s.main}>
        {loading && (
          <div className={s.loaderOverlay}>
            <span className={s.spinner} aria-label="Loading" role="status" />
          </div>
        )}
        <div className={s.scroll}>
          <section className={s.successCard}>
            <Image
              className={s.checkCircle}
              src={PaymentDone}
              alt="Payment successful"
              width={80}
              height={80}
            />
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
                <Image
                  className={s.summaryIcon}
                  src={Receipt}
                  alt=""
                  width={20}
                  height={20}
                />
                <h3 className={s.summaryTitle}>Order Summary</h3>
              </div>
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

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <OrderConfirmed />
    </Suspense>
  );
}
