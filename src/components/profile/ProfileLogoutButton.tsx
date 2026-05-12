"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";

export function ProfileLogoutButton() {
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const handleLogout = async () => {
    setShowModal(false);
    toast.info("Sedang keluar...", "Menghapus sesi kolaborasi...");
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <button
        type="button"
        className="logout-btn"
        onClick={() => setShowModal(true)}
        style={{
          width: "100%",
          background: "#FF4D4D",
          border: "3px solid #000",
          borderRadius: "12px",
          padding: "14px 24px",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 900,
          fontSize: "16px",
          color: "#fff",
          boxShadow: "6px 6px 0px #000",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginTop: "16px"
        }}
      >
         Keluar Akun
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Keluar Akun"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <p style={{ fontSize: "15px", color: "#3D3D3D", margin: 0, lineHeight: 1.5 }}>
            Apakah kamu yakin ingin keluar dari akun ini? Sesi kolaborasimu akan diakhiri.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
