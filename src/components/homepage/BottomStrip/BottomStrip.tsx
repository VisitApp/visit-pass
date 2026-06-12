"use client";

import { useRouter } from "next/navigation";
import s from "./BottomStrip.module.scss";

export default function BottomStrip() {
  const router = useRouter();

  return (
    <footer className={s.strip}>
      <button
        type="button"
        className={s.cta}
        onClick={() => router.push("/details")}
      >
        Become a Member
      </button>
    </footer>
  );
}
