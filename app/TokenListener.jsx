"use client";
import { useEffect } from "react";

export default function TokenListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = async (event) => {
      if (event.data?.type === "AUTH_TOKEN") {
        const token = event.data.token;
        console.log("Recebi token:", token);

        try {
          const res = await fetch("/api/verify-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json();
          console.log("Token verified:", data);
        } catch (err) {
          console.error("Erro ao verificar token:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}