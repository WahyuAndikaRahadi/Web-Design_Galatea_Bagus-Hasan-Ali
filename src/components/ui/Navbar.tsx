"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, LinkButton } from "@/components/ui/Button";
import { getTrustLevelEmoji } from "@/lib/trust-score";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useToast } from "@/lib/toast";
import { Modal } from "@/components/ui/Modal";
import { User, Menu } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isCollabHub = /^\/project\/[^/]+\/hub($|\/)/.test(pathname);
  const toast = useToast();
  const { toggleSidebar } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hide navbar on auth pages and admin area
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/admin")) return null;

  const navLinks = pathname === "/"
    ? [
        { href: "#about", label: "About" },
        { href: "#stats", label: "Background" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#explore-preview", label: "Explore" },
        { href: "#trust", label: "Trust System" },
        { href: "#testimonials", label: "Testimonials" },
      ]
    : session?.user
      ? [
          { href: session.user.role === "ADMIN" ? "/admin" : "/dashboard", label: "Dashboard" },
          { href: "/project/my-projects", label: "My Projects" },
          { href: "/explore", label: "Explore" },
          { href: "/feed", label: "Feed" },
          { href: "/ai-hub", label: "AI Hub" },
          ...(session.user.role === "ADMIN" ? [{ href: "/admin", label: "🛠️ Admin" }] : []),
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/explore", label: "Explore" },
        ];

  const filteredLinks = navLinks;

  useEffect(() => {
    // Scroll spy logic
    const sections = navLinks
      .filter(link => link.href.startsWith("#"))
      .map(link => link.href.substring(1));

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // More focused on the upper half of the screen
      threshold: [0, 0.1, 0.5]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // We want to find the section that is currently most relevant (closest to the top)
      const intersectingEntries = entries.filter(entry => entry.isIntersecting);
      
      if (intersectingEntries.length > 0) {
        // Sort by how close the top of the element is to the top of the viewport
        const closest = intersectingEntries.sort((a, b) => {
          return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top);
        })[0];
        
        setActiveHash(`#${closest.target.id}`);
      } else {
        // Clear hash if no sections are in view (e.g. at the hero section)
        setActiveHash("");
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    // Hash change listener
    const handleHashChange = () => setActiveHash(window.location.hash);

    // Clear active state when at the top (Hero) or bottom (Footer)
    const handleScroll = () => {
      const isAtTop = window.scrollY < 100;
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;

      if (isAtTop || isAtBottom) {
        setActiveHash("");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navLinks]);

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "3px solid #000",
        boxShadow: "0 4px 0px rgba(0,0,0,0.05)", // Subtle shadow for depth
        position: "sticky",
        top: "0",
        zIndex: 2000,
        width: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: session?.user ? "none" : "1200px",
          margin: "0 auto",
          padding: session?.user ? "0 24px" : "0 24px",
          height: "80px", // Increased height slightly for breathing room
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {session?.user && !isCollabHub && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center"
            style={{
              background: "#FFE500",
              border: "2px solid #000",
              borderRadius: "4px",
              padding: "6px",
              marginRight: "16px",
              cursor: "pointer",
              boxShadow: "2px 2px 0px #000",
              transition: "all 0.1s ease",
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              (e.currentTarget as any).style.transform = "translate(1px, 1px)";
              (e.currentTarget as any).style.boxShadow = "1px 1px 0px #000";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as any).style.transform = "translate(0, 0)";
              (e.currentTarget as any).style.boxShadow = "2px 2px 0px #000";
            }}
          >
            <Menu size={20} color="#000" strokeWidth={3} />
          </button>
        )}
        <div style={{ flex: session?.user ? "0 0 auto" : 1, display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            className={`items-center gap-4 ${session?.user ? "hidden" : "flex"}`}
            style={{
              textDecoration: "none",
            }}
          >
            <img src="/images/logo.png" alt="Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
            <span
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 900,
                fontSize: "22px",
                color: "#000",
                letterSpacing: "-0.5px"
              }}
            >
              CollaboLab
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav 
          className={`hidden ${pathname === "/" ? "xl:flex" : (session?.user ? "xl:hidden" : "xl:flex")} items-center gap-2`}
          style={{
            // Removed pill background and border for a cleaner look
          }}
        >
          {filteredLinks.map((link) => {
            const isActive = link.href.startsWith("#")
              ? activeHash === link.href
              : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "active" : ""}`}
                style={{
                  fontSize: "14px",
                  padding: "6px 12px",
                  borderRadius: "8px"
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth section */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", justifyContent: "flex-end" }}>
          {session?.user ? (
            <div className="flex items-center gap-3 xl:gap-5">
              <div className="hidden sm:block">
                <div
                  title={`Trust Score: ${session.user.trustScore}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#F5F0E8",
                    border: "2px solid #000",
                    borderRadius: "6px",
                    padding: "3px 8px",
                    boxShadow: "2px 2px 0px #000",
                    cursor: "help"
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{getTrustLevelEmoji(session.user.trustLevel)}</span>
                  <span style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    fontWeight: 800,
                    fontSize: "13px",
                    color: "#000"
                  }}>
                    {session.user.trustScore}
                  </span>
                </div>
              </div>
              <NotificationBell userId={session.user.id} />
              <Link
                href={`/profile/${session.user.id}`}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0px #000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F5F0E8",
                  overflow: "hidden",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={20} strokeWidth={3} />
                )}
              </Link>
              <div className="hidden xl:block">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowLogoutModal(true)}
                  style={{ height: "36px", padding: "0 12px" }}
                >
                  Keluar
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-4">
              <LinkButton href="/login" variant="secondary" size="sm">
                Masuk
              </LinkButton>
              <LinkButton href="/register" variant="primary" size="sm">
                Daftar Gratis
              </LinkButton>
            </div>
          )}

          {/* Mobile hamburger - Only for guest */}
          {!session?.user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              id="navbar-menu-btn"
              className="xl:hidden"
              style={{
                background: menuOpen ? "#FFE500" : "transparent",
                border: "2px solid #000",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: "18px",
                transition: "all 0.15s ease",
                boxShadow: menuOpen ? "2px 2px 0px #000" : "none",
              }}
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu - Only for guest */}
      <AnimatePresence>
        {!session?.user && menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            style={{
              borderTop: "2px solid #000",
              background: "#FFFFFF",
              overflow: "hidden",
            }}
            className="xl:hidden"
          >
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredLinks.map((link) => {
                const isActive = link.href.startsWith("#")
                  ? activeHash === link.href
                  : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`nav-link ${isActive ? "active" : ""}`}
                    style={{ display: "block", textAlign: "left", fontSize: "18px" }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "2px solid #000" }}>
                <LinkButton href="/login" variant="secondary" fullWidth onClick={() => setMenuOpen(false)}>
                  Masuk
                </LinkButton>
                <LinkButton href="/register" variant="primary" fullWidth onClick={() => setMenuOpen(false)}>
                  Daftar Gratis
                </LinkButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Keluar Akun"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", margin: 0 }}>
            Apakah kamu yakin ingin keluar dari akun ini? Sesi kolaborasimu akan diakhiri.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                setShowLogoutModal(false);
                toast.info("Sedang keluar...", "Menghapus sesi kolaborasi...");
                await signOut({ callbackUrl: "/" });
              }}
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
