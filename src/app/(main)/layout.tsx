'use client'

import type { ReactNode } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthGuard from "@/components/auth/AuthGuard";

const PROTECTED_ROUTES = ["/explore", "/dashboard", "/project", "/profile", "/settings", "/onboarding", "/ai-hub"];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isCollabHub = /^\/project\/[^/]+\/hub($|\/)/.test(pathname);

  const content = (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      {session?.user && !isCollabHub && <Sidebar />}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>
      </div>
    </div>
  );

  if (isProtected) {
    return <AuthGuard>{content}</AuthGuard>;
  }

  return content;
}
