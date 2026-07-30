"use client";

import type React from "react";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/flight-intel/auth/auth-context";

export default function AircraftLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/flight-intel");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <Suspense fallback={null}>{children}</Suspense>;
}
