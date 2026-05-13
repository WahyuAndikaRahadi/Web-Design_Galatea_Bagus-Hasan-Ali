"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  Rss, 
  Cpu, 
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!session?.user || !isMounted) return null;

  const navLinks = [
    { href: session.user.role === "ADMIN" ? "/admin" : "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/project/my-projects", label: "My Projects", icon: Briefcase },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/feed", label: "Feed", icon: Rss },
    { href: "/ai-hub", label: "AI Hub", icon: Cpu },
  ];

  const sidebarVariants = {
    desktop: {
      width: isSidebarCollapsed ? "88px" : "280px",
      x: 0,
      transition: { duration: 0.3, ease: "circOut" }
    },
    mobile: {
      width: "280px",
      x: isSidebarCollapsed ? "-100%" : 0,
      transition: { duration: 0.3, ease: "circOut" }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && !isSidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarCollapsed(true)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(2px)",
              zIndex: 140,
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobile ? "mobile" : "desktop"}
        variants={sidebarVariants}
        style={{
          height: "100vh",
          background: "#fff",
          borderRight: "3px solid #000",
          display: "flex",
          flexDirection: "column",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          zIndex: 150,
          overflowX: "hidden",
          padding: isSidebarCollapsed && !isMobile ? "24px 12px" : "24px 16px"
        }}
      >
        {/* Brand */}
        <div style={{ position: "relative", marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link
            href="/"
            onClick={() => isMobile && setSidebarCollapsed(true)}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "0 4px",
            }}
          >
            <motion.img 
              src="/images/logo.png" 
              alt="Logo" 
              animate={{ 
                width: (isSidebarCollapsed && !isMobile) ? "50px" : "60px", 
                height: (isSidebarCollapsed && !isMobile) ? "50px" : "60px" 
              }}
              style={{ objectFit: "contain", flexShrink: 0 }} 
            />
            {(!isSidebarCollapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 800,
                  fontSize: "24px",
                  color: "#000",
                  letterSpacing: "-0.5px",
                  whiteSpace: "nowrap"
                }}
              >
                CollaboLab
              </motion.span>
            )}
          </Link>
          
          {isMobile && (
            <button 
              onClick={() => setSidebarCollapsed(true)}
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isMobile && setSidebarCollapsed(true)}
                title={isSidebarCollapsed && !isMobile ? link.label : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  textDecoration: "none",
                  color: "#000",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: isActive ? "2px solid #000" : "2px solid transparent",
                  background: isActive ? "#FFE500" : "transparent",
                  boxShadow: isActive ? "3px 3px 0px #000" : "none",
                  transition: "all 0.15s ease",
                  justifyContent: (isSidebarCollapsed && !isMobile) ? "center" : "flex-start",
                  paddingLeft: (isSidebarCollapsed && !isMobile) ? "0" : "16px",
                  paddingRight: (isSidebarCollapsed && !isMobile) ? "0" : "16px",
                }}
                className="sidebar-link"
              >
                <Icon size={22} strokeWidth={isActive ? 3 : 2} style={{ flexShrink: 0 }} />
                {(!isSidebarCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
