"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Navbar, ProgressBar } from "@/components";
import { addToCart, getAvailableTopups, type Plan } from "@/services";
import { clsx } from "@/utils/helpers";
import { TOKEN_KEY } from "@/utils/cart";
import s from "./details.module.scss";

const formatCost = (cost: string) => `₹${Math.round(parseFloat(cost))}`;

// wrap any "NN% off" in the subheading with a highlight span
const renderSubHeading = (text: string) => {
  const parts = text.split(/(\d+%\s*off)/gi);
  return parts.map((part, i) =>
    /\d+%\s*off/i.test(part) ? (
      <span className={s.highlight} key={i}>
        {part}
      </span>
    ) : (
      part
    ),
  );
};

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
    router.push(`/add-dependents?cover=${selectedId}`);
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
      } else {
        setError(res.error || "Couldn't load plans. Please try again.");
      }
      setLoading(false);
    })();
  }, [router]);

  return (
    <div className={s.page}>
      <main className={s.main}>
        {loading && (
          <div className={s.loaderOverlay}>
            <span className={s.spinner} aria-label="Loading" role="status" />
          </div>
        )}
        <Navbar title="OPD Pass Membership" />

        <ProgressBar value={20} className={s.progress} />

        <div className={s.scroll}>
          {!loading &&
            plans.map((plan) => {
              const selected = selectedId === plan.coverVariantId;
              return (
                <div
                  key={plan.coverVariantId}
                  className={clsx(s.outerBorder, selected && s.selected)}
                  onClick={() => setSelectedId(plan.coverVariantId)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={s.badge}>Top family pick</div>
                  <div className={s.card}>
                    <div className={s.content}>
                      <header className={s.header}>
                        <div className={s.headerInner}>
                          <div className={s.titleRow}>
                            <h1 className={s.title}>{plan.name}</h1>
                            <span className={s.goldTag}>
                              {plan.description}
                            </span>
                          </div>
                          <div className={s.priceBlock}>
                            <p className={s.startingAt}>starting at</p>
                            <div className={s.priceRow}>
                              <span className={s.price}>
                                {formatCost(plan.cost)}
                              </span>
                              <span className={s.per}>/year</span>
                            </div>
                          </div>
                        </div>
                      </header>

                      <div className={s.divider}>
                        <span className={s.dividerLabel}>
                          WHAT&apos;S INCLUDED
                        </span>
                        <span className={s.dividerLine} />
                      </div>

                      <section className={s.benefits}>
                        {plan.standardPlanDescription?.map((b) => (
                          <div className={s.benefit} key={b.heading}>
                            <div className={s.iconBox}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className={s.icon}
                                src={b.imgUrl}
                                alt=""
                                width={24}
                                height={24}
                              />
                            </div>
                            <div>
                              <h3 className={s.benefitTitle}>{b.heading}</h3>
                              <p className={s.benefitSubtitle}>
                                {renderSubHeading(b.subHeading)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </section>
                    </div>
                  </div>
                </div>
              );
            })}
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
