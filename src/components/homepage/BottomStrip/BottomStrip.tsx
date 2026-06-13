"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import OfferSeal from "@/icons/OfferSeal.svg";
import s from "./BottomStrip.module.scss";

export default function BottomStrip() {
  const router = useRouter();

  return (
    <footer className={s.strip}>
      <div className={s.offer}>
        <Image src={OfferSeal} alt="" width={20} height={20} />
        <span>
          Get <strong>20% off</strong> for <strong>10:00</strong> mins · special
          price
        </span>
      </div>
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
