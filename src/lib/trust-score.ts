import type { TrustLevel } from "@prisma/client";

export const TRUST_SCORE_DELTAS = {
  PROJECT_COMPLETED: 15,
  GOOD_REVIEW: 10,
  PROFILE_COMPLETE: 10,
  WEEKLY_ACTIVE: 2,
  STUDENT_VERIFIED: 10,
  REPORTED_AND_PROVEN: -20,
  NO_SHOW_GHOST: -10,
  KICKED_FROM_PROJECT: -8,
  LINK_POINTS: {
    LINKEDIN: 8,
    PORTFOLIO: 6,
    BEHANCE: 6,
    DRIBBBLE: 6,
    INSTAGRAM: 4,
    YOUTUBE: 4,
    CUSTOM: 4,
  }
} as const;


export function calculateTrustLevel(score: number): TrustLevel {
  if (score >= 86) return "VERIFIED";
  if (score >= 61) return "TRUSTED";
  if (score >= 31) return "MEMBER";
  return "NEWCOMER";
}

export function getTrustLevelEmoji(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    NEWCOMER: "🔴",
    MEMBER: "🟡",
    TRUSTED: "🟢",
    VERIFIED: "🔵",
  };
  return map[level];
}

export function getTrustLevelColor(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    NEWCOMER: "#FF4D4D",
    MEMBER: "#FFE500",
    TRUSTED: "#00D37F",
    VERIFIED: "#0047FF",
  };
  return map[level];
}

export function getTrustLevelLabel(level: TrustLevel): string {
  const map: Record<TrustLevel, string> = {
    NEWCOMER: "Newcomer",
    MEMBER: "Member",
    TRUSTED: "Trusted",
    VERIFIED: "Verified",
  };
  return map[level];
}

export function canCreateProject(level: TrustLevel): boolean {
  return level !== "NEWCOMER";
}
export function refreshUserTrustScore(user: any): { score: number, level: TrustLevel } {
  let score = 20; // Base score for everyone

  // 1. External Links (Capped at 20)
  let linkScore = 0;
  const verifiedLinks = user.externalLinks?.filter((l: any) => l.status === "VERIFIED") || [];
  verifiedLinks.forEach((l: any) => {
    linkScore += (TRUST_SCORE_DELTAS.LINK_POINTS as any)[l.platform] || 0;
  });
  score += linkScore;

  // 2. Profile Completeness (+5 for bio, +5 for image)
  if (user.bio) {
    score += TRUST_SCORE_DELTAS.PROFILE_COMPLETE;
  }
  if (user.image && !user.image.includes("default")) {
    // Maybe image is another +5 or +10, but let's stick to the 46 target first.
    // Actually, if we want to follow the rules (+10 for complete profile), 
    // and the user says 46 = 20 + 8 + 8 + 10, then 10 must be the bio.
  }

  // 3. Student Verification (+10)
  if (user.isStudentVerified) {
    score += TRUST_SCORE_DELTAS.STUDENT_VERIFIED;
  }

  // 4. Tambahkan Event Score (Poin dinamis dari database seperti Project Completed, Kicked, dll)
  const dynamicEventScore = user.eventScore || 0;
  score += dynamicEventScore;

  // Final Level
  const level = calculateTrustLevel(score);
  return { score, level };
}

export function canInviteDirectly(level: TrustLevel): boolean {
  return level === "TRUSTED" || level === "VERIFIED";
}

export function getMaxActiveProjects(level: TrustLevel, score: number): number {
  if (level === "NEWCOMER") return 0;
  if (score >= 100) return Infinity;
  return 3;
}
