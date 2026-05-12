
"use client";
import { useState } from "react";
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

export function ExternalLinkChip({ platform, url, username, label, status, previewTitle, previewImage, description }: Props & { previewTitle?: string, previewImage?: string, description?: string }) {
  const style = platformStyles[platform];
  const displayLabel = label || username || platform.toLowerCase();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        width: "calc(100% - 6px)", // Account for box-shadow to prevent overflow
        marginBottom: "6px", // Account for bottom box-shadow
        boxSizing: "border-box",
        alignItems: "center",
        gap: "20px",
        padding: "20px",
        background: "#fff",
        border: "4px solid #000",
        borderRadius: "16px",
        boxShadow: "6px 6px 0px #000",
        textDecoration: "none",
        color: "#000",
        fontFamily: "Space Grotesk, sans-serif",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden"
      }}
      className="external-card-nb"
    >
      <style>{`
        .external-card-nb:hover {
          transform: translate(-4px, -4px);
          box-shadow: 10px 10px 0px #000;
          background: ${style.bg};
        }
        @media (max-width: 640px) {
          .external-card-nb {
            padding: 14px !important;
            gap: 12px !important;
          }
          .platform-icon-container {
            width: 48px !important;
            height: 48px !important;
          }
          .platform-icon-container span {
            font-size: 24px !important;
          }
          .external-title {
            font-size: 15px !important;
          }
          .external-desc {
            font-size: 12px !important;
            margin-bottom: 2px !important;
          }
          .external-url {
            font-size: 11px !important;
          }
          .external-arrow {
            width: 32px !important;
            height: 32px !important;
            font-size: 16px !important;
            margin-left: 4px !important;
          }
        }
      `}</style>

      {/* Platform Icon/Image */}
      <div className="platform-icon-container" style={{ 
        width: "64px", 
        height: "64px", 
        borderRadius: "12px", 
        border: "3px solid #000", 
        background: style.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: "2px 2px 0px #000"
      }}>
        {previewImage ? (
          <img src={previewImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: "32px" }}>{style.icon}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span className="external-title" style={{ fontWeight: 900, fontSize: "18px", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {previewTitle || displayLabel}
          </span>
          {status === "VERIFIED" && (
            <span style={{ background: "#00D37F", border: "2px solid #000", borderRadius: "6px", fontSize: "11px", padding: "1px 8px", fontWeight: 900 }}>
              VERIFIED
            </span>
          )}
        </div>
        
        {description ? (
          <div className="external-desc" style={{ fontSize: "14px", color: "#3D3D3D", marginBottom: "4px", fontWeight: 500, opacity: 0.8 }}>
            {description}
          </div>
        ) : (
          <div className="external-desc" style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
            Lihat profil {platform.toLowerCase()} dan koneksi lainnya.
          </div>
        )}

        <div className="external-url" style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
          <span style={{ background: "#000", color: "#fff", padding: "0 6px", borderRadius: "4px", fontSize: "10px" }}>{platform}</span>
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: 0.6 }}>{url.replace(/^https?:\/\/(www\.)?/, "")}</span>
        </div>
      </div>

      <div className="external-arrow" style={{ 
        background: "#FFE500", 
        color: "#000", 
        width: "40px", 
        height: "40px", 
        borderRadius: "10px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: 900,
        marginLeft: "12px",
        flexShrink: 0,
        border: "3px solid #000",
        boxShadow: "3px 3px 0px #000"
      }}>
        →
      </div>
    </a>
  );
}
