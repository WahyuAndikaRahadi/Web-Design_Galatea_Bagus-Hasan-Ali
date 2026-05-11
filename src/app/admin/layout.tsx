'use client'

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/auth/AdminGuard";
import { NoiseTexture } from "@/components/ui/DecorativeElements";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "User Management", icon: "👥" },
  { href: "/admin/projects", label: "Project Oversight", icon: "📁" },
  { href: "/admin/reports", label: "Reports", icon: "🚩" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AdminGuard>
      <div style={{ display: "flex", minHeight: "100vh", background: "#0D0D0D", color: "#fff", position: "relative", fontFamily: "Space Grotesk, sans-serif" }}>
        <NoiseTexture opacity={0.05} />
        
        {/* Admin Sidebar */}
        <aside style={{ 
          width: "280px", 
          background: "#161616", 
          borderRight: "4px solid #FFE500", 
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 10,
          boxShadow: "10px 0 30px rgba(0,0,0,0.5)"
        }}>
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "40px" }}>
              <span style={{ background: "#FFE500", border: "2px solid #000", padding: "4px", borderRadius: "4px", fontWeight: 900, boxShadow: "2px 2px 0px #000" }}>🛡️</span>
              <span style={{ fontWeight: 900, fontSize: "22px", color: "#FFE500", letterSpacing: "-0.5px" }}>ADMIN_OS</span>
            </Link>

            <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {ADMIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 18px",
                      background: isActive ? "#FFE500" : "transparent",
                      border: "2px solid",
                      borderColor: isActive ? "#000" : "#333",
                      borderRadius: "4px",
                      color: isActive ? "#000" : "#888",
                      fontWeight: 800,
                      boxShadow: isActive ? "4px 4px 0px #FFE500" : "none",
                      transform: isActive ? "translate(-2px, -2px)" : "none",
                      transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
             <div style={{ padding: "16px", background: "#222", border: "1px solid #444", borderRadius: "4px", fontSize: "12px" }}>
                <div style={{ color: "#FFE500", fontWeight: 800, marginBottom: "4px" }}>SYSTEM_STATUS</div>
                <div style={{ color: "#00D37F", display: "flex", alignItems: "center", gap: "6px" }}>
                   <span style={{ width: "8px", height: "8px", background: "#00D37F", borderRadius: "50%" }}></span>
                   All Systems Operational
                </div>
             </div>
            <Link 
              href="/dashboard"
              style={{
                textDecoration: "none",
                display: "block",
                textAlign: "center",
                padding: "14px",
                background: "#FFE500",
                color: "#000",
                borderRadius: "4px",
                fontWeight: 900,
                fontSize: "14px",
                border: "2px solid #000"
              }}
            >
              EXIT COMMAND CENTER
            </Link>
          </div>
        </aside>

        {/* Admin Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
           {/* Top Bar */}
           <header style={{ 
              height: "72px", 
              borderBottom: "2px solid #333", 
              padding: "0 40px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              background: "rgba(22,22,22,0.8)",
              backdropFilter: "blur(10px)"
           }}>
              <div style={{ color: "#888", fontWeight: 700, fontSize: "14px" }}>
                 ROOT_TERMINAL / {pathname.toUpperCase()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                 <div style={{ background: "#222", border: "1px solid #444", padding: "6px 12px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>
                    V1.2.0-STABLE
                 </div>
              </div>
           </header>

           <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
             {children}
           </main>
        </div>
      </div>
    </AdminGuard>
  );
}
