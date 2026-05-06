
"use client";

import { useEffect, useState } from "react";
import { ExternalLinkChip } from "./ExternalLinkChip";
import { LinkedInPreviewCard } from "./LinkedInPreviewCard";

interface Link {
  id: string;
  platform: any;
  url: string;
  username?: string;
  label?: string;
  status: string;
  previewTitle?: string;
  previewImage?: string;
}

interface Props {
  username: string;
}

export function ExternalLinksSection({ username }: Props) {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`/api/profile/${username}/links`);
        if (res.ok) {
          const data = await res.json();
          setLinks(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile links:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, [username]);

  if (loading) return <div style={{ fontSize: "14px", color: "#666" }}>Memuat profil eksternal...</div>;
  if (links.length === 0) return null;

  const linkedInLink = links.find(l => l.platform === "LINKEDIN");
  const otherLinks = links.filter(l => l.platform !== "LINKEDIN");

  return (
    <div style={{ marginTop: "24px" }}>
      <h3 style={{ 
        fontFamily: "Space Grotesk, sans-serif", 
        fontWeight: 900, 
        fontSize: "14px", 
        textTransform: "uppercase",
        letterSpacing: "1px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        External Profiles
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {linkedInLink && (
          <LinkedInPreviewCard 
            url={linkedInLink.url} 
            previewTitle={linkedInLink.previewTitle}
            previewImage={linkedInLink.previewImage}
            status={linkedInLink.status}
          />
        )}

        {otherLinks.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {otherLinks.map(link => (
              <ExternalLinkChip 
                key={link.id}
                platform={link.platform}
                url={link.url}
                username={link.username}
                label={link.label}
                status={link.status}
                previewTitle={link.previewTitle}
                previewImage={link.previewImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
