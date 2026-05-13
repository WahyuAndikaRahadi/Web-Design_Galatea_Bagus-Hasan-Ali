"use client";

import { useState } from "react";
import { User, Camera, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast";
import { useAlert } from "@/lib/alert";
import { useRouter } from "next/navigation";

interface ProfileEditorProps {
  initialData: {
    name: string;
    username: string | null;
    bio: string | null;
    image: string | null;
  };
}

export function ProfileEditor({ initialData }: ProfileEditorProps) {
  const [name, setName] = useState(initialData.name);
  const [username, setUsername] = useState(initialData.username || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [image, setImage] = useState<string | null>(initialData.image);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.image);
  const toast = useToast();
  const alert = useAlert();
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (500MB limit as requested)
    if (file.size > 500 * 1024 * 1024) {
      toast.error("File terlalu besar", "Maksimal ukuran file adalah 500MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreviewUrl(base64);
      setImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert.error({
        title: "Nama Wajib Diisi",
        description: "Silakan masukkan nama lengkap kamu agar tim bisa mengenalmu lebih baik."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio, image }),
      });

      if (!res.ok) throw new Error();

      await alert.success({
        title: "Profil Diperbarui!",
        description: "Perubahan kamu telah berhasil disimpan dan disinkronkan ke seluruh platform."
      });
      
      router.refresh();
    } catch (err) {
      alert.error({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan sistem saat mencoba menyimpan profil kamu. Silakan coba lagi nanti."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile Picture */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative" }}>
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: "4px solid #000",
            background: "#F5F0E8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "6px 6px 0px #000"
          }}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={60} strokeWidth={2} color="#000" />
            )}
          </div>
          <label 
            htmlFor="profile-pic-upload"
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              background: "#FFE500",
              border: "2px solid #000",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "2px 2px 0px #000",
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(1px, 1px)"; e.currentTarget.style.boxShadow = "1px 1px 0px #000"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0px #000"; }}
          >
            <Camera size={20} color="#000" />
            <input 
              id="profile-pic-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: "none" }} 
            />
          </label>
        </div>
        <p style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
          Klik ikon kamera untuk ganti foto.<br/>
          Format: JPG, PNG, GIF. Max 500MB.
        </p>
      </div>

      {/* Name Field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>Nama Lengkap</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu..."
          style={{
            background: "#fff", border: "3px solid #000", borderRadius: "8px", padding: "12px 16px",
            fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 500, boxShadow: "4px 4px 0px #000", outline: "none"
          }}
        />
      </div>

      {/* Username Field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>Username</label>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#666" }}>Unique & lowercase only</span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontWeight: 800, color: "#000" }}>@</span>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="username..."
            style={{
              width: "100%",
              background: "#fff",
              border: "3px solid #000",
              borderRadius: "8px",
              padding: "12px 16px 12px 32px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "15px",
              fontWeight: 700,
              boxShadow: "4px 4px 0px #000",
              outline: "none"
            }}
          />
        </div>
      </div>

      {/* Bio Field */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px" }}>Bio Singkat</label>
        <textarea 
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Ceritakan sedikit tentang dirimu..."
          rows={4}
          style={{
            background: "#fff",
            border: "3px solid #000",
            borderRadius: "8px",
            padding: "12px 16px",
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 500,
            boxShadow: "4px 4px 0px #000",
            outline: "none",
            resize: "none"
          }}
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        variant="primary" 
        disabled={isSubmitting}
        style={{ marginTop: "12px", width: "100%", height: "48px", fontSize: "16px" }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Simpan Perubahan
          </>
        )}
      </Button>
    </form>
  );
}
