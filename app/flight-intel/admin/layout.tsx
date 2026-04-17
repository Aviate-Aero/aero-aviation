"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname === "/flight-intel/admin/login";
    const isAuthenticated = sessionStorage.getItem("admin_authenticated") === "true";

    if (!isAuthenticated && !isLoginPage) {
      router.replace("/flight-intel/admin/login");
    } else if (isAuthenticated && isLoginPage) {
      router.replace("/flight-intel/admin");
    }
  }, [pathname, router]);

  return <>{children}</>;
}