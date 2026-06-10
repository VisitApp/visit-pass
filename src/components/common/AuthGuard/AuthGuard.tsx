"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TOKEN_KEY = "opd_auth_token";
/** Paths reachable without a token. */
const PUBLIC_PATHS = ["/login"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // strip trailing slash so "/login/" matches "/login"
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const isPublic = PUBLIC_PATHS.includes(normalized);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isPublic) {
      setAllowed(true);
      return;
    }
    if (sessionStorage.getItem(TOKEN_KEY)) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace("/login");
    }
  }, [isPublic, pathname, router]);

  if (!allowed) return null;
  return <>{children}</>;
}
