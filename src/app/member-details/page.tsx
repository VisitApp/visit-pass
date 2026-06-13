"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DateWheel, Navbar, ProgressBar } from "@/components";
import {
  getCartSummary,
  type SelectedMember,
  updateDependentDetails,
} from "@/services";
import { keyForMember, MEMBERS_KEY, RELATION_META } from "@/utils/cart";
import s from "./memberDetails.module.scss";

const meta = (relationId: number | null) =>
  RELATION_META[keyForMember(relationId)] ?? {
    label: "Member",
    img: "/relations/Self.png",
  };

type Form = { name: string; dob: string; gender: string };

const isSelf = (m: SelectedMember) => keyForMember(m.relationId) === "self";

const CURRENT_YEAR = new Date().getFullYear();

const formatDob = (dob: string) =>
  new Date(dob).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function MemberDetailsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<SelectedMember[]>([]);
  // Keyed by index so the self row (dependentId null) gets its own slot.
  const [forms, setForms] = useState<Record<number, Form>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // index of the member whose DOB wheel is open, or null
  const [dobPicker, setDobPicker] = useState<number | null>(null);

  useEffect(() => {
    const initForms = (list: SelectedMember[]) => {
      setMembers(list);
      setForms(
        Object.fromEntries(
          list.map((m, i) => [
            i,
            { name: m.name ?? "", dob: m.dob ?? "", gender: "" },
          ]),
        ),
      );
    };

    // Prefer the members passed from order-confirmed; only fetch if absent.
    const passed = sessionStorage.getItem(MEMBERS_KEY);
    if (passed) {
      try {
        const list = JSON.parse(passed) as SelectedMember[];
        if (list.length > 0) {
          initForms(list);
          return;
        }
      } catch {
        /* malformed — fall through to fetch */
      }
    }

    (async () => {
      const res = await getCartSummary();
      if (res.unauthorized) {
        router.replace("/login");
        return;
      }
      if (!res.ok || !res.data) return;
      initForms(res.data.selectedMembers);
    })();
  }, [router]);

  const setField = (i: number, key: keyof Form, value: string) =>
    setForms((prev) => ({ ...prev, [i]: { ...prev[i], [key]: value } }));

  const allFilled =
    members.length > 0 &&
    members.every((m, i) => {
      const f = forms[i];
      if (!f || f.name.trim() === "" || f.dob === "") return false;
      if (isSelf(m) && f.gender === "") return false;
      return true;
    });

  async function handleSubmit() {
    if (!allFilled || submitting) return;
    setSubmitting(true);
    setError("");
    const payload = members.map((m, i) => ({
      dependentId: m.dependentId,
      name: forms[i].name.trim(),
      dob: forms[i].dob,
      ...(isSelf(m) ? { gender: forms[i].gender } : {}),
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
    sessionStorage.removeItem(MEMBERS_KEY);
    router.push(`/activated?members=${payload.length}`);
  }

  return (
    <div className={s.page}>
      <main className={s.main}>
        <Navbar title="Fill Details" />

        <ProgressBar value={80} className={s.progress} />

        <div className={s.scroll}>
          <h1 className={s.heading}>Add member details</h1>
          <p className={s.lead}>All fields are mandatory</p>

          {members.length === 0 ? (
            <p className={s.empty}>No members to add details for.</p>
          ) : (
            members.map((m, i) => {
              const info = meta(m.relationId);
              const f = forms[i] ?? { name: "", dob: "" };
              return (
                <div className={s.card} key={i}>
                  <span className={s.relation}>{info.label}</span>
                  <div className={s.fields}>
                    <div className={s.inputWrapper}>
                      <input
                        className={s.field}
                        type="text"
                        placeholder="Full name"
                        aria-label="Full name"
                        value={f.name}
                        onChange={(e) =>
                          setField(
                            i,
                            "name",
                            e.target.value
                              .replace(/[^a-zA-Z ]/g, "")
                              .replace(/^\s+/, "")
                              .replace(/\s{2,}/g, " "),
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className={s.inputWrapper}
                      aria-label="Date of birth"
                      onClick={() => setDobPicker(i)}
                    >
                      <span
                        className={`${s.field} ${f.dob ? "" : s.placeholder}`}
                      >
                        {f.dob ? formatDob(f.dob) : "Date of birth"}
                      </span>
                    </button>
                    {isSelf(m) && (
                      <div className={s.inputWrapper}>
                        <select
                          className={`${s.field} ${f.gender ? "" : s.placeholder}`}
                          aria-label="Gender"
                          value={f.gender}
                          onChange={(e) =>
                            setField(i, "gender", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Gender
                          </option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    )}
                  </div>
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

        {dobPicker !== null && (
          <DateWheel
            value={forms[dobPicker]?.dob ?? ""}
            maxYear={CURRENT_YEAR}
            onConfirm={(dob) => setField(dobPicker, "dob", dob)}
            onClose={() => setDobPicker(null)}
          />
        )}
      </main>
    </div>
  );
}
