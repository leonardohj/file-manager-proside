"use client";
import { useEffect } from "react";
import { useFileManagerContext } from "./FileManagerContext";

export default function TokenListener() {
  const { setFilter, filter } = useFileManagerContext();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = async (event) => {
      const data = event.data;
      if (!data) return;

      // Only update filter if it exists
      if (typeof data.filter !== "undefined") {
        if(data.filter === "IMG")
        {
          setFilter("images")
        }
        if(data.filter === "VID")
          {
            setFilter("videos")
          }
        
        console.log(filter);
      }

      // Handle token separately
      if (data.type === "AUTH_TOKEN") {
        const token = data.token;
        console.log("Token received:", token);

        try {
          const res = await fetch("/api/verify-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const result = await res.json();
          console.log("Token verified:", result);
        } catch (err) {
          console.error("Error verifying token:", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setFilter]);

  return null;
}