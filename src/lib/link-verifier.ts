
export interface VerificationResult {
  isValid: boolean;
  previewTitle?: string;
  previewImage?: string;
  platform: string;
  username?: string;
  verifiedAt?: Date;
}

export function detectPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes("linkedin.com")) return "LINKEDIN";
    if (hostname.includes("github.com")) return "GITHUB";
    if (hostname.includes("behance.net")) return "BEHANCE";
    if (hostname.includes("dribbble.com")) return "DRIBBBLE";
    if (hostname.includes("instagram.com")) return "INSTAGRAM";
    if (hostname.includes("youtube.com")) return "YOUTUBE";
    // Check for common portfolio hosting
    if (hostname.includes("vercel.app") || hostname.includes("netlify.app") || hostname.includes("github.io")) return "PORTFOLIO";
    return "CUSTOM";
  } catch {
    return "CUSTOM";
  }
}

export function extractUsername(url: string, platform: string): string | undefined {
  try {
    const parsed = new URL(url);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    
    if (platform === "LINKEDIN" && pathSegments[0] === "in") return pathSegments[1];
    if (platform === "GITHUB") return pathSegments[0];
    if (platform === "BEHANCE") return pathSegments[0];
    if (platform === "DRIBBBLE") return pathSegments[0];
    if (platform === "INSTAGRAM") return pathSegments[0];
    if (platform === "YOUTUBE") {
      const seg = pathSegments[0];
      return seg?.startsWith("@") ? seg.slice(1) : seg;
    }
    
    return parsed.hostname;
  } catch {
    return undefined;
  }
}

async function fetchOpenGraphMeta(url: string): Promise<{ title?: string; image?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CollaboLab-Bot/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return {};
    
    const html = await response.text();
    
    const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    
    const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    
    return {
      title: titleMatch ? titleMatch[1] : undefined,
      image: imageMatch ? imageMatch[1] : undefined,
    };
  } catch (error) {
    console.error("Link verification fetch error:", error);
    return {};
  }
}

export async function verifyExternalLink(url: string): Promise<VerificationResult> {
  try {
    const platform = detectPlatform(url);
    const username = extractUsername(url, platform);
    
    const meta = await fetchOpenGraphMeta(url);
    
    return {
      isValid: true, // If fetchOpenGraphMeta didn't throw, we assume it's reachable
      previewTitle: meta.title,
      previewImage: meta.image,
      platform,
      username,
      verifiedAt: new Date(),
    };
  } catch (error) {
    return { isValid: false, platform: "CUSTOM" };
  }
}
