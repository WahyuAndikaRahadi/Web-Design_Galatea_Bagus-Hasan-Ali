import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { WhySection } from "@/components/landing/WhySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ExplorePreview } from "@/components/landing/ExplorePreview";
import { MarqueeSection } from "@/components/landing/MarqueeSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { CtaFooterSection } from "@/components/landing/CtaFooterSection";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Noise } from "@/components/ui/Noise";

export const metadata: Metadata = {
  title: "CollaboLab — Find Your People. Build Together.",
  description:
    "Platform kolaborasi real-time untuk Gen-Z. Temukan partner project, join lomba, dan bangun portofolio bersama dengan sistem Trust Score.",
};

export default async function HomePage() {
  const session = await auth();
  
  // Fetch the 4 latest projects for the explore preview
  const projects = await prisma.project.findMany({
    where: {
      status: "OPEN",
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          name: true,
          trustScore: true,
          trustLevel: true,
        },
      },
      requiredSkills: {
        select: {
          skillName: true,
        },
      },
      members: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <>
      <CustomCursor />
      <Noise />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <WhySection />
        <HowItWorksSection />
        <ExplorePreview 
          projects={projects.map(p => ({
            ...p,
            requiredSkills: p.requiredSkills.map(s => s.skillName),
            memberCount: p.members.length,
          }))} 
          isAuthenticated={!!session} 
        />
        <MarqueeSection />
        <TrustSection />
        <TestimonialsSection />
        <CtaFooterSection />
      </main>
    </>
  );
}
