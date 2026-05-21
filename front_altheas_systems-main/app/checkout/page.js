"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "../../services/authSession";

export default function CheckoutEntryPage() {
  const router = useRouter();

  useEffect(() => {
    if (getAuthToken()) {
      router.replace("/checkout/address");
    } else {
      router.replace("/checkout/auth");
    }
  }, [router]);

  return (
    <main
      style={{
        padding: "3rem 1rem",
        textAlign: "center",
        fontFamily: "sans-serif",
        color: "#64748b",
      }}
    >
      <p style={{ margin: 0 }}>Redirection vers la commande…</p>
    </main>
  );
}
