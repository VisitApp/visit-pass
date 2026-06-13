"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PaymentDone from "@/icons/PaymentDone.svg";
import { getCartSummary, type SelectedMember } from "@/services";
import s from "./activated.module.scss";

const ageFromDob = (dob: string | null): number | null => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
};

export default function ActivatedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState("OPD Pass Gold");
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [price, setPrice] = useState(2900);
  const [validity, setValidity] = useState("");

  useEffect(() => {
    const valid = new Date();
    valid.setFullYear(valid.getFullYear() + 1);
    setValidity(
      valid.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    );

    (async () => {
      const res = await getCartSummary();
      if (res.unauthorized) {
        router.replace("/login");
        return;
      }
      if (res.ok && res.data) {
        setMembers(res.data.selectedMembers);
        if (res.data.finalCost > 0) setPrice(res.data.finalCost);
        if (res.data.selectedOpdPlan?.name) {
          setPlanName(res.data.selectedOpdPlan.name);
        }
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

        <div className={s.scroll}>
          <section className={s.card}>
            <Image
              className={s.icon}
              src={PaymentDone}
              alt="Activated"
              width={80}
              height={80}
            />
            <h1 className={s.title}>Your OPD Pass is active now</h1>

            <div className={s.passCard}>
              <div className={s.passGlow} aria-hidden="true" />
              <span className={s.goldTag}>GOLD</span>
              <h2 className={s.passTitle}>{planName}</h2>
              <p className={s.passMembers}>{members.length} Members covered</p>
              {price > 0 && (
                <div className={s.priceBlock}>
                  <p className={s.startingAt}>starting at</p>
                  <div className={s.priceRow}>
                    <span className={s.price}>
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                    <span className={s.per}>/year</span>
                  </div>
                  <p className={s.billed}>billed annually</p>
                </div>
              )}
              <div className={s.passFoot}>
                <p className={s.passValidity}>Validity: {validity}</p>
                <span className={s.activeBadge}>Active</span>
              </div>
            </div>

            <div className={s.membersSection}>
              <h3 className={s.membersHeading}>Members covered</h3>
              <div className={s.membersList}>
                {members.map((m, i) => {
                  const age = ageFromDob(m.dob);
                  return (
                    <div className={s.memberRow} key={i}>
                      <span className={s.memberName}>
                        {m.name || "—"}
                        {age != null && (
                          <span className={s.memberAge}> · {age}yrs</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <footer className={s.footer}>
          <button
            type="button"
            className={s.cta}
            onClick={() => router.push("/")}
          >
            Book Health Checkup
          </button>
        </footer>
      </main>
    </div>
  );
}
