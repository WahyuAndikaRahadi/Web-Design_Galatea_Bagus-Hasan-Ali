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
    GITHUB: 8,
    PORTFOLIO: 6,
    BEHANCE: 5,
    DRIBBBLE: 5,
    INSTAGRAM: 3,
    YOUTUBE: 3,
    CUSTOM: 2,
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
  score += Math.min(linkScore, 20);

  // 2. Profile Completeness (+10 if bio and image exist)
  if (user.bio && user.image) {
    score += TRUST_SCORE_DELTAS.PROFILE_COMPLETE;
  }

  // 3. Student Verification (+10)
  if (user.isStudentVerified) {
    score += TRUST_SCORE_DELTAS.STUDENT_VERIFIED;
  }

  // 4. Completed Projects (+15 each)
  // This logic depends on how you pass the data. 
  // For now, let's assume we pass the counts.
  if (user._count?.projectsOwned) {
     // This part is tricky without a full query.
     // In a real app, you'd fetch these counts.
  }

  // Final Level
  const level = calculateTrustLevel(score);
  return { score, level };
}

export function canInviteDirectly(level: TrustLevel): boolean {
  return level === "TRUSTED" || level === "VERIFIED";
}

export function getMaxActiveProjects(level: TrustLevel): number {
  if (level === "NEWCOMER") return 0;
  if (level === "MEMBER") return 2;
  return Infinity;
}
