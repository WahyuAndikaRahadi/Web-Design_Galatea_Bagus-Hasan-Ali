
"use client";

import { ExternalPlatform } from "@prisma/client";

interface Props {
  platform: ExternalPlatform;
  url: string;
  username?: string;
  label?: string;
  status: string;
}

const platformStyles: Record<ExternalPlatform, { color: string, bg: string, icon: string }> = {
  LINKEDIN: { color: "#0077B5", bg: "#E8F0FE", icon: "🔵" },
  GITHUB: { color: "#333", bg: "#F5F5F5", icon: "⚫" },
  BEHANCE: { color: "#053eff", bg: "#E5EBFF", icon: "🔷" },
  DRIBBBLE: { color: "#ea4c89", bg: "#FFECF3", icon: "🩷" },
  PORTFOLIO: { color: "#000", bg: "#F0F0F0", icon: "🌐" },
  INSTAGRAM: { color: "#e1306c", bg: "#FFF0F5", icon: "🟣" },
  YOUTUBE: { color: "#ff0000", bg: "#FFEBEE", icon: "🔴" },
  CUSTOM: { color: "#666", bg: "#F8F8F8", icon: "🔗" },
};

export function ExternalLinkChip({ platform, url, username, label, status, previewTitle, previewImage }: Props & { previewTitle?: string, previewImage?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const style = platformStyles[platform];
  const displayLabel = label || username || platform.toLowerCase();

  return (
    <div style={{ position: "relative" }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          background: style.bg,
          border: "2px solid #000",
          borderRadius: "4px",
          boxShadow: "2px 2px 0px #000",
          textDecoration: "none",
          color: "#000",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
      >
        <span style={{ fontSize: "16px" }}>{style.icon}</span>
        <span>{displayLabel}</span>
        {status === "VERIFIED" && (
          <span style={{ 
            background: "#00D37F", 
            color: "#000", 
            fontSize: "10px", 
            padding: "1px 4px", 
            borderRadius: "2px",
            marginLeft: "2px"
          }}>
            ✅
          </span>
        )}
      </a>

      {isHovered && previewTitle && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "10px",
          width: "200px",
          background: "#fff",
          border: "2px solid #000",
          borderRadius: "6px",
          boxShadow: "4px 4px 0px #000",
          padding: "8px",
          zIndex: 50,
          pointerEvents: "none"
        }}>
          {previewImage && (
            <img src={previewImage} alt="" style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "2px", marginBottom: "4px", border: "1px solid #eee" }} />
          )}
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#000", lineHeight: 1.2 }}>{previewTitle}</div>
        </div>
      )}
    </div>
  );
}
