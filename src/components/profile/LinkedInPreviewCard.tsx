
"use client";

interface Props {
  url: string;
  previewTitle?: string;
  previewImage?: string;
  status: string;
}

export function LinkedInPreviewCard({ url, previewTitle, previewImage, status }: Props) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2px solid #000",
        borderRadius: "8px",
        boxShadow: "4px 4px 0px #000",
        padding: "16px",
        width: "320px",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0077B5", fontWeight: 800 }}>
          <span>🔵</span> LinkedIn
        </div>
        {status === "VERIFIED" && (
          <span style={{ background: "#00D37F", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800, border: "1px solid #000" }}>
            VERIFIED
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div style={{ 
          width: "64px", 
          height: "64px", 
          borderRadius: "4px", 
          border: "2px solid #000", 
          background: "#F5F0E8",
          overflow: "hidden",
          flexShrink: 0
        }}>
          {previewImage ? (
            <img src={previewImage} alt="LinkedIn Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              👤
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: "16px", marginBottom: "4px", color: "#000" }}>
            {previewTitle || "LinkedIn Profile"}
          </div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: 1.4 }}>
            Lihat riwayat profesional dan pendidikan di LinkedIn.
          </div>
        </div>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          marginTop: "16px",
          padding: "10px",
          textAlign: "center",
          background: "#FFE500",
          border: "2px solid #000",
          borderRadius: "4px",
          boxShadow: "2px 2px 0px #000",
          textDecoration: "none",
          color: "#000",
          fontWeight: 800,
          fontSize: "14px",
        }}
      >
        Lihat Profil LinkedIn →
      </a>
    </div>
  );
}
