"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components";
import {
  getCartPricing,
  type SelectedMember,
  updateDependentDetails,
} from "@/services";
import { COVER_VARIANT_KEY, keyForMember, RELATION_META } from "@/utils/cart";
import s from "./memberDetails.module.scss";

const meta = (relationId: number | null) =>
  RELATION_META[keyForMember(relationId)] ?? {
    label: "Member",
    img: "/relations/Self.png",
  };

type Form = { name: string; dob: string };

export default function MemberDetailsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [forms, setForms] = useState<Record<number, Form>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
      if (!res.ok || !res.data) return;
      const dependents = res.data.selectedMembers.filter(
        (m) => m.dependentId != null,
      );
      setMembers(dependents);
      setForms(
        Object.fromEntries(
          dependents.map((m) => [m.dependentId, { name: "", dob: "" }]),
        ),
      );
    })();
  }, [router]);

  const setField = (id: number, key: keyof Form, value: string) =>
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));

  const allFilled =
    members.length > 0 &&
    members.every((m) => {
      const f = forms[m.dependentId as number];
      return f && f.name.trim() !== "" && f.dob !== "";
    });

  async function handleSubmit() {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    setError("");
    const payload = members.map((m) => ({
      dependentId: m.dependentId as number,
      name: forms[m.dependentId as number].name.trim(),
      dob: forms[m.dependentId as number].dob,
    }));
    const result = await updateDependentDetails(payload);
    setSubmitting(false);
    if (result.unauthorized) {
      router.replace("/login");
      return;
    }
    if (!result.ok) {
      setError(result.error || "Couldn't save details");
      return;
    }
    router.push("/");
  }

  return (
    <div className={s.page}>
      <main className={s.main}>
        <Navbar title="Member Details" />

        <div className={s.scroll}>
          <h1 className={s.heading}>Add member details</h1>
          <p className={s.lead}>
            Enter the name and date of birth for each member to activate their
            cover.
          </p>

          {members.length === 0 ? (
            <p className={s.empty}>No members to add details for.</p>
          ) : (
            members.map((m) => {
              const id = m.dependentId as number;
              const info = meta(m.relationId);
              const f = forms[id] ?? { name: "", dob: "" };
              return (
                <div className={s.card} key={id}>
                  <div className={s.cardHead}>
                    <Image
                      className={s.avatar}
                      src={info.img}
                      alt=""
                      width={36}
                      height={36}
                    />
                    <span className={s.relation}>{info.label}</span>
                  </div>
                  <label className={s.fieldLabel}>Full name</label>
                  <input
                    className={s.field}
                    type="text"
                    placeholder="Full name"
                    value={f.name}
                    onChange={(e) => setField(id, "name", e.target.value)}
                  />
                  <label className={s.fieldLabel}>Date of birth</label>
                  <input
                    className={s.field}
                    type="date"
                    value={f.dob}
                    onChange={(e) => setField(id, "dob", e.target.value)}
                  />
                </div>
              );
            })
          )}
        </div>

        <footer className={s.footer}>
          {error && <p className={s.footerError}>{error}</p>}
          <button
            type="button"
            className={s.cta}
            disabled={!allFilled || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Saving…" : "Save & Activate"}
          </button>
        </footer>
      </main>
    </div>
  );
}
