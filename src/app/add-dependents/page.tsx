"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiMinus, FiPlus, FiX } from "react-icons/fi";
import { Navbar } from "@/components";
import {
  addDependentPricing,
  addToCart,
  getCartPricing,
  type Pricing,
  removeDependentPricing,
  type SelectedMember,
} from "@/services";
import {
  COVER_VARIANT_KEY,
  MEMBER_RELATION_ID,
  RELATION_ID_TO_KEY,
} from "@/utils/cart";
import s from "./addDependents.module.scss";

type MemberType = "single" | "multi";
type Member = { key: string; label: string; img: string; type: MemberType };

const MEMBERS: Member[] = [
  { key: "self", label: "Self", img: "/relations/Self.png", type: "single" },
  {
    key: "spouse",
    label: "Wife",
    img: "/relations/Spouse.png",
    type: "single",
  },
  {
    key: "father",
    label: "Father",
    img: "/relations/Father.png",
    type: "single",
  },
  {
    key: "mother",
    label: "Mother",
    img: "/relations/Mother.png",
    type: "single",
  },
  {
    key: "motherInLaw",
    label: "Mother-in law",
    img: "/relations/Mother.png",
    type: "single",
  },
  {
    key: "fatherInLaw",
    label: "Father-in law",
    img: "/relations/Father.png",
    type: "single",
  },
  { key: "son", label: "Son", img: "/relations/Son.png", type: "multi" },
  {
    key: "daughter",
    label: "Daughter",
    img: "/relations/Daughter.png",
    type: "multi",
  },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** server selectedMembers → per-key counts (Self always 1) */
function countsFromMembers(members: SelectedMember[]): Record<string, number> {
  const next: Record<string, number> = { self: 1 };
  for (const m of members) {
    if (m.relationId == null) continue; // self row
    const key = RELATION_ID_TO_KEY[m.relationId];
    if (key) next[key] = (next[key] ?? 0) + 1;
  }
  return next;
}

export default function AddDependentsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({
    self: 1,
  });

  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const get = (key: string) => counts[key] ?? 0;
  const setCount = (key: string, value: number) =>
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, value) }));

  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);

  /** apply a pricing response: sync members, counts, pricing, storage */
  const applyPricing = (data: Pricing) => {
    setMembers(data.selectedMembers);
    setCounts(countsFromMembers(data.selectedMembers));
    setPricing(data);
  };

  // a plan must be selected first; then load the current cart + base pricing
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const cv = Number(sessionStorage.getItem(COVER_VARIANT_KEY) || 0);
    if (!cv) {
      router.replace("/details");
      return;
    }
    (async () => {
      const res = await getCartPricing(cv);
      if (res.unauthorized) {
        router.replace("/login");
        return;
      }
      if (res.ok && res.data) applyPricing(res.data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  // each "+" tap adds one member server-side and returns updated pricing
  async function addMember(key: string) {
    if (busy) return;
    const coverVariantId = Number(
      sessionStorage.getItem(COVER_VARIANT_KEY) || 0,
    );
    if (!coverVariantId) {
      router.replace("/details");
      return;
    }
    const relationId = MEMBER_RELATION_ID[key];
    if (!relationId) return;

    setBusy(true);
    const res = await addDependentPricing({ coverVariantId, relationId });
    setBusy(false);
    if (res.unauthorized) {
      router.replace("/login");
      return;
    }
    if (!res.ok || !res.data) {
      showToast(res.error || "Couldn't add member");
      return;
    }
    applyPricing(res.data);
  }

  // each "−"/"✕" removes one member of that relation by its dependentId
  async function removeMember(key: string) {
    if (busy) return;
    const coverVariantId = Number(
      sessionStorage.getItem(COVER_VARIANT_KEY) || 0,
    );
    const relIds = key === "spouse" ? [5, 6] : [MEMBER_RELATION_ID[key]];
    const match = members
      .filter((m) => m.dependentId != null && relIds.includes(m.relationId ?? -1))
      .pop();
    if (!coverVariantId || !match?.dependentId) {
      setCount(key, get(key) - 1); // nothing on server to remove
      return;
    }

    setBusy(true);
    const res = await removeDependentPricing({
      coverVariantId,
      dependentId: match.dependentId,
    });
    setBusy(false);
    if (res.unauthorized) {
      router.replace("/login");
      return;
    }
    if (!res.ok || !res.data) {
      showToast(res.error || "Couldn't remove member");
      return;
    }
    applyPricing(res.data);
  }

  async function handleContinue() {
    if (submitting) return;
    const coverVariantId = Number(
      sessionStorage.getItem(COVER_VARIANT_KEY) || 0,
    );

    if (!coverVariantId) {
      router.replace("/details");
      return;
    }

    {
      setSubmitting(true);
      const result = await addToCart(coverVariantId);
      setSubmitting(false);
      if (result.unauthorized) {
        router.replace("/login");
        return;
      }
      if (!result.ok) {
        showToast(result.error || "Couldn't add to cart");
        return;
      }
    }
    router.push("/order-review");
  }

  const totalMembers = Object.values(counts).reduce((a, b) => a + b, 0);
  const totalCost = pricing?.finalCost ?? 0;
  const savings = pricing?.discount ?? 0;

  // at most two children (Son + Daughter combined)
  const MAX_CHILDREN = 2;
  const childrenTotal = MEMBERS.filter((m) => m.type === "multi").reduce(
    (sum, m) => sum + get(m.key),
    0,
  );
  const canAddChild = childrenTotal < MAX_CHILDREN;

  // parents: at most 2, and own-parents can't be mixed with in-laws
  const OWN_PARENTS = ["mother", "father"];
  const INLAW_PARENTS = ["motherInLaw", "fatherInLaw"];
  const PARENTS = [...OWN_PARENTS, ...INLAW_PARENTS];

  // toggle a single member on/off, enforcing parent rules on add
  const toggleSingle = (key: string) => {
    const active = get(key) > 0;
    if (active) {
      removeMember(key);
      return;
    }
    if (PARENTS.includes(key)) {
      const parentsTotal = PARENTS.reduce((sum, k) => sum + get(k), 0);
      if (parentsTotal >= 2) {
        showToast("You can add at most 2 parents");
        return;
      }
      const isOwn = OWN_PARENTS.includes(key);
      const hasOwn = OWN_PARENTS.some((k) => get(k) > 0);
      const hasInlaw = INLAW_PARENTS.some((k) => get(k) > 0);
      if ((isOwn && hasInlaw) || (!isOwn && hasOwn)) {
        showToast("Parents and in-laws can't be combined");
        return;
      }
    }
    addMember(key);
  };

  const renderCard = (m: Member) => {
    const count = get(m.key);
    const active = count > 0;
    const locked = m.key === "self";
    return (
      <button
        type="button"
        key={m.key}
        className={`${s.member} ${active ? s.memberActive : ""}`}
        onClick={
          locked
            ? undefined
            : m.type === "single"
              ? () => toggleSingle(m.key)
              : !active
                ? () =>
                    canAddChild
                      ? addMember(m.key)
                      : showToast("You can add at most 2 children")
                : undefined
        }
      >
        <Image className={s.avatar} src={m.img} alt="" width={32} height={32} />
        <span className={s.memberLabel}>{m.label}</span>

        {m.type === "single" || !active ? (
          <span className={s.action}>
            {locked ? (
              <FiCheck aria-hidden="true" />
            ) : m.type === "single" && active ? (
              <FiX aria-hidden="true" />
            ) : (
              <FiPlus aria-hidden="true" />
            )}
          </span>
        ) : (
          <span className={s.stepper}>
            <span
              role="button"
              tabIndex={0}
              className={s.step}
              aria-label={`Remove one ${m.label}`}
              onClick={(e) => {
                e.stopPropagation();
                removeMember(m.key);
              }}
            >
              <FiMinus aria-hidden="true" />
            </span>
            <span className={s.count}>{count}</span>
            <span
              role="button"
              tabIndex={0}
              className={`${s.step} ${!canAddChild ? s.stepDisabled : ""}`}
              aria-label={`Add one ${m.label}`}
              aria-disabled={!canAddChild}
              onClick={(e) => {
                e.stopPropagation();
                if (canAddChild) addMember(m.key);
                else showToast("You can add at most 2 children");
              }}
            >
              <FiPlus aria-hidden="true" />
            </span>
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={s.page}>
      <main className={s.main}>
        {toast && <div className={s.toast}>{toast}</div>}
        <Navbar title="Add Members" />

        <div className={s.progress}>
          <span className={s.progressFill} />
        </div>

        <div className={s.scroll}>
          <h1 className={s.heading}>Who&apos;s getting covered?</h1>
          <p className={s.lead}>More members = better savings per person</p>

          <div className={s.members}>{MEMBERS.map(renderCard)}</div>
        </div>

        <div className={s.footer}>
          {savings > 0 && (
            <div className={s.savingsBanner}>
              <FiCheck className={s.savingsIcon} aria-hidden="true" />
              You are saving <strong>{inr(savings)}</strong> on this order
            </div>
          )}

          <div className={s.summary}>
            <div className={s.summaryCol}>
              <span className={s.summaryLabel}>Members selected</span>
              <span className={s.summaryValue}>{totalMembers} Members</span>
            </div>
            <div className={`${s.summaryCol} ${s.summaryRight}`}>
              <span className={s.summaryLabel}>Total cost</span>
              <span className={s.summaryCost}>{inr(totalCost)}/yr</span>
            </div>
          </div>

          <button
            type="button"
            className={s.cta}
            disabled={submitting}
            onClick={handleContinue}
          >
            {submitting ? "Adding…" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
