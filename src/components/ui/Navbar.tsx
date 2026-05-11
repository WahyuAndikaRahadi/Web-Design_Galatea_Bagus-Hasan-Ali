"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, LinkButton } from "@/components/ui/Button";
import { getTrustLevelEmoji, getTrustLevelColor } from "@/lib/trust-score";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useToast } from "@/lib/toast";
import { Modal } from "@/components/ui/Modal";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hide navbar on auth pages
  if (pathname === "/login" || pathname === "/register") return null;

  const navLinks = session?.user 
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/explore", label: "Explore" },
        { href: "/feed", label: "Feed" },
        { href: "/ai-hub", label: "AI Hub" },
        ...(session.user.role === "ADMIN" ? [{ href: "/admin", label: "🛠️ Admin" }] : []),
        { href: "/project/my-projects", label: "My Projects" },
      ]
    : pathname === "/" 
      ? [
          { href: "#about", label: "About" },
          { href: "#how-it-works", label: "How It Works" },
          { href: "#explore-preview", label: "Explore" },
          { href: "#trust", label: "Trust System" },
          { href: "#testimonials", label: "Testimonials" },
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
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
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
        zIndex: 100,
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              background: "#FFE500",
              border: "2px solid #000",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 900,
              boxShadow: "2px 2px 0px #000",
            }}
          >
            🤝
          </span>
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              color: "#000",
            }}
          >
            CollaboLab
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {filteredLinks.map((link) => {
            const isActive = link.href.startsWith("#") 
              ? activeHash === link.href 
              : pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth section */}
        {/* Auth section */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {session?.user ? (
            <div className="flex items-center gap-2 lg:gap-3">
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
                  session.user.name?.[0]?.toUpperCase() ?? "U"
                )}
              </Link>
              <div className="hidden lg:block">
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
            <div className="hidden lg:flex items-center gap-3">
              <LinkButton href="/login" variant="secondary" size="sm">
                Masuk
              </LinkButton>
              <LinkButton href="/register" variant="primary" size="sm">
                Daftar Gratis
              </LinkButton>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            id="navbar-menu-btn"
            className="lg:hidden"
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
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
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
            className="lg:hidden"
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
              
              {!session?.user ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "2px solid #000" }}>
                  <LinkButton href="/login" variant="secondary" fullWidth onClick={() => setMenuOpen(false)}>
                    Masuk
                  </LinkButton>
                  <LinkButton href="/register" variant="primary" fullWidth onClick={() => setMenuOpen(false)}>
                    Daftar Gratis
                  </LinkButton>
                </div>
              ) : (
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "2px solid #000" }}>
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      setMenuOpen(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    Keluar Akun
                  </Button>
                </div>
              )}
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
