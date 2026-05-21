"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "../../services/authSession";

/**
 * Redirige vers `/checkout/auth` si aucun JWT (parcours invité désactivé).
 * @returns {"checking" | "ok"}
 */
export function useCheckoutAuthGate() {
  const router = useRouter();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/checkout/auth");
      return;
    }
    setStatus("ok");
  }, [router]);

  return status;
}
