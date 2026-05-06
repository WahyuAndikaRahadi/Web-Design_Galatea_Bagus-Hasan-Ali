"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LinkButton } from "@/components/ui/Button";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { NotificationBell } from "@/components/ui/NotificationBell";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "Explore" },
    { href: "/feed", label: "Feed", requireAuth: true },
    { href: "/dashboard", label: "Dashboard", requireAuth: true },
    { href: "/project/create", label: "Buat Project", requireAuth: true },
  ];

  const filteredLinks = navLinks.filter(
    (l) => !l.requireAuth || !!session?.user
  );

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "3px solid #000",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
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
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }} className="hidden md:flex">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 600,
                fontSize: "15px",
                color: "#000",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "4px",
                background: pathname === link.href ? "#FFE500" : "transparent",
                border: pathname === link.href ? "2px solid #000" : "2px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session?.user ? (
            <>
              <TrustScoreBadge
                score={session.user.trustScore}
                level={session.user.trustLevel}
                variant="compact"
                showScore
              />
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
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  background: "transparent",
                  border: "2px solid #000",
                  borderRadius: "4px",
                  padding: "6px 12px",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                id="navbar-signout-btn"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="secondary" size="sm">
                Masuk
              </LinkButton>
              <LinkButton href="/register" variant="primary" size="sm">
                Daftar Gratis
              </LinkButton>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            id="navbar-menu-btn"
            className="md:hidden"
            style={{
              background: "transparent",
              border: "2px solid #000",
              borderRadius: "4px",
              padding: "6px 10px",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: "18px",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: "2px solid #000",
            background: "#F5F0E8",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
          className="md:hidden"
        >
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                color: "#000",
                textDecoration: "none",
                padding: "10px",
                borderRadius: "4px",
                background: pathname === link.href ? "#FFE500" : "transparent",
                border: "2px solid transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
          {session?.user && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderTop: "1px solid #000", marginTop: "4px" }}>
              <NotificationBell userId={session.user.id} />
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px" }}>Notifikasi</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
