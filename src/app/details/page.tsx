"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GoldCard, Navbar } from "@/components";
import { addToCart, getAvailableTopups, type Plan } from "@/services";
import { COVER_VARIANT_KEY, TOKEN_KEY } from "@/utils/cart";
import s from "./details.module.scss";

const formatCost = (cost: string) => `₹${Math.round(parseFloat(cost))}`;

export default function DetailsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fetched = useRef(false);

  async function handleContinue() {
    if (selectedId == null || submitting) return;
    setSubmitting(true);
    setError("");
    const result = await addToCart(selectedId);
    setSubmitting(false);
    if (result.unauthorized) {
      router.replace("/login");
      return;
    }
    if (!result.ok) {
      setError(result.error || "Couldn't add to cart");
      return;
    }
    sessionStorage.setItem(COVER_VARIANT_KEY, String(selectedId));
    router.push("/add-dependents");
  }

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    if (!sessionStorage.getItem(TOKEN_KEY)) {
      router.replace("/login");
      return;
    }
    (async () => {
      const res = await getAvailableTopups();
      if (res.unauthorized) {
        router.replace("/login");
        return;
      }
      if (res.ok) {
        setPlans(res.plans ?? []);
        setSelectedId(res.selectedCoverVariantId ?? null);
      } else {
        setError(res.error || "Couldn't load plans. Please try again.");
      }
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className={s.page}>
      <main className={s.main}>
        <Navbar title="OPD Pass Membership" />

        <div className={s.scroll}>
          {loading && <p className={s.state}>Loading plans…</p>}

          {!loading &&
            plans.map((plan) => (
              <GoldCard
                key={plan.coverVariantId}
                name={plan.name}
                badge={plan.description}
                price={formatCost(plan.cost)}
                selected={selectedId === plan.coverVariantId}
                onClick={() => setSelectedId(plan.coverVariantId)}
              />
            ))}
        </div>

        <footer className={s.footer}>
          {error && <p className={s.footerError}>{error}</p>}
          <button
            type="button"
            className={s.cta}
            disabled={selectedId == null || submitting}
            onClick={handleContinue}
          >
            {submitting ? "Adding…" : "Continue"}
          </button>
        </footer>
      </main>
    </div>
  );
}
