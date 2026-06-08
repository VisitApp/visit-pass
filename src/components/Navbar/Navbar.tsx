"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import styles from "./Navbar.module.scss";

type NavbarProps = {
  title?: string;
  /** Centered logo source (e.g. "/images/VisitLogo.webp"). */
  logoSrc?: string;
  /** Override default back behavior (router.back). */
  onBack?: () => void;
};

export default function Navbar({ title, logoSrc, onBack }: NavbarProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <header className={styles.navbar}>
      <button
        type="button"
        className={styles.back}
        onClick={handleBack}
        aria-label="Go back"
      >
        <FiChevronLeft size={24} aria-hidden="true" />
      </button>
      {logoSrc && (
        <Image
          className={styles.logo}
          src={logoSrc}
          alt="Visit logo"
          width={74}
          height={28}
          priority
        />
      )}
      {title && <h1 className={styles.title}>{title}</h1>}
    </header>
  );
}
