import type { TrustLevel, AvailStatus, ProjectCategory, CommitmentLevel, ProjectTopic, ProjectStatus, TaskStatus, Priority, MemberRole, UserRole } from "@prisma/client";
import "next-auth/jwt";

// ─── NextAuth type augmentation ──────────────────────────────────────────────
declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    trustScore: number;
    trustLevel: TrustLevel;
    availStatus: AvailStatus;
    onboardingDone: boolean;
    role: UserRole;
    isBlocked: boolean;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
      trustScore: number;
      trustLevel: TrustLevel;
      availStatus: AvailStatus;
      onboardingDone: boolean;
      role: UserRole;
      isBlocked: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    trustScore: number;
    trustLevel: TrustLevel;
    availStatus: AvailStatus;
    onboardingDone: boolean;
    role: UserRole;
    isBlocked: boolean;
  }
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export type UserSkillData = {
  id: string;
  skillName: string;
};

export type UserPublicProfile = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  trustScore: number;
  trustLevel: TrustLevel;
  availStatus: AvailStatus;
  isStudentVerified: boolean;
  skills: UserSkillData[];
  createdAt: Date;
};

export type ProjectSkillData = {
  id: string;
  skillName: string;
};

export type ProjectMemberData = {
  id: string;
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: Date | null;
  role: MemberRole;
  roleTitle: string | null;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    trustScore: number;
    trustLevel: TrustLevel;
  };
};

export type ProjectCardData = {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  commitmentLevel: CommitmentLevel;
  projectTopic: ProjectTopic;
  maxMembers: number;
  status: ProjectStatus;
  deadline: Date | null;
  createdAt: Date;
  requiredSkills: ProjectSkillData[];
  members: { id: string }[];
  owner: {
    id: string;
    name: string;
    image: string | null;
    trustScore: number;
    trustLevel: TrustLevel;
  };
};

export type ProjectDetailData = ProjectCardData & {
  members: ProjectMemberData[];
  tasks: TaskData[];
};

export type TaskData = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string | null;
  labelTag: string | null;
  deadline: Date | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageData = {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type ApplicationData = {
  id: string;
  projectId: string;
  applicantId: string;
  message: string;
  commitmentLevel: CommitmentLevel;
  status: string;
  createdAt: Date;
  applicant?: UserPublicProfile;
};

// ─── Category Metadata ────────────────────────────────────────────────────────

export const CATEGORY_META: Record<ProjectCategory, { emoji: string; label: string; color: string }> = {
  LOMBA: { emoji: "🏆", label: "Lomba", color: "#FFE500" },
  STARTUP: { emoji: "💼", label: "Startup", color: "#0047FF" },
  KREATIF: { emoji: "🎨", label: "Kreatif", color: "#FF4D4D" },
  BELAJAR: { emoji: "📚", label: "Belajar", color: "#00D37F" },
  SOSIAL: { emoji: "🌱", label: "Sosial", color: "#00D37F" },
  AKADEMIK: { emoji: "📖", label: "Akademik", color: "#0047FF" },
  BISNIS: { emoji: "📊", label: "Bisnis", color: "#00D37F" },
  PERTANIAN: { emoji: "🚜", label: "Pertanian", color: "#00D37F" },
  TEKNOLOGI: { emoji: "💻", label: "Teknologi", color: "#FFE500" },
  PERKANTORAN: { emoji: "📎", label: "Perkantoran", color: "#FF4D4D" },
  KESEHATAN: { emoji: "🏥", label: "Kesehatan", color: "#00D37F" },
  HUKUM: { emoji: "⚖️", label: "Hukum", color: "#0047FF" },
  TEKNIK: { emoji: "⚙️", label: "Teknik", color: "#FF4D4D" },
  SENI: { emoji: "🎭", label: "Seni", color: "#FFE500" },
  OLAHRAGA: { emoji: "⚽", label: "Olahraga", color: "#0047FF" },
  KULINER: { emoji: "🍳", label: "Kuliner", color: "#FF4D4D" },
  SAINS: { emoji: "🧪", label: "Sains", color: "#00D37F" },
};

export const COMMITMENT_META: Record<CommitmentLevel, { label: string; description: string }> = {
  CASUAL: { label: "Casual", description: "Santai, tidak ada tekanan" },
  SERIUS: { label: "Serius", description: "Ada target dan timeline jelas" },
  KOMPETISI: { label: "Kompetisi", description: "Deadline ketat, high commitment" },
};

export const TOPIC_META: Record<ProjectTopic, { label: string; description: string; color: string }> = {
  TEKNOLOGI: { label: "Teknologi", description: "Inovasi & Pengembangan Digital", color: "#0047FF" },
  PERTANIAN: { label: "Pertanian", description: "Ketahanan Pangan & Agrikultur", color: "#00D37F" },
  PENDIDIKAN: { label: "Pendidikan", description: "Pengembangan SDM & Belajar", color: "#FFE500" },
  LINGKUNGAN: { label: "Lingkungan", description: "Sustainability & Alam", color: "#00D37F" },
  EKONOMI: { label: "Ekonomi", description: "Bisnis, Finance & UMKM", color: "#FF4D4D" },
  KARYA_TULIS: { label: "Karya Tulis", description: "Esai, Artikel & Publikasi", color: "#0047FF" },
  RESEARCH: { label: "Research", description: "Penelitian & Analisis Data", color: "#00D37F" },
  PENGABDIAN: { label: "Pengabdian", description: "Sosial & Masyarakat", color: "#FF4D4D" },
  KESEHATAN: { label: "Kesehatan", description: "Wellness & Medis", color: "#00D37F" },
  SENI_BUDAYA: { label: "Seni Budaya", description: "Ekspresi Kreatif & Tradisi", color: "#FFE500" },
  HUKUM_POLITIK: { label: "Hukum & Politik", description: "Legal, Kebijakan & Diplomasi", color: "#0047FF" },
  MANUFAKTUR: { label: "Manufaktur", description: "Produksi, Teknik & Industri", color: "#FF4D4D" },
  KULINER_PARIWISATA: { label: "Kuliner & Tour", description: "Pariwisata & Seni Memasak", color: "#FFE500" },
  OLAHRAGA_KEBUGARAN: { label: "Olahraga", description: "Kesehatan Fisik & Prestasi", color: "#0047FF" },
  MARITIM_DIRGANTARA: { label: "Maritim & Udara", description: "Aviation & Ocean Science", color: "#00D37F" },
  SAINS_MURNI: { label: "Sains Murni", description: "MIPA, Laboratorium & Inovasi", color: "#FF4D4D" },
};

export const AVAIL_META: Record<AvailStatus, { label: string; color: string; emoji: string }> = {
  OPEN: { label: "Open to Collab", color: "#00D37F", emoji: "🟢" },
  FOCUS: { label: "Fokus Dulu", color: "#FFE500", emoji: "🟡" },
  BUSY: { label: "Sibuk", color: "#FF4D4D", emoji: "🔴" },
};

// ─── Skill Groups for UI Categorization ──────────────────────────────────────

export const SKILL_GROUPS = [
  {
    name: "Teknologi & Digital",
    skills: ["Frontend Developer", "Backend Developer", "Mobile Developer", "Fullstack Developer", "UI/UX Designer", "Data Analyst", "Data Scientist", "Cyber Security", "Cloud Engineer", "Game Developer", "Blockchain Developer", "AI/ML Engineer", "DevOps Specialist", "Quality Assurance", "Product Manager", "Systems Architect", "Network Engineer"]
  },
  {
    name: "Akademik & Riset",
    skills: ["Researcher", "Scientific Writing", "Academic Research", "Statistical Analysis", "Mathematics", "Physics", "Chemistry", "Biology", "Biotechnology", "Neuroscience", "Astronomy", "Microbiology", "Geology", "Laboratory Management", "Social Research"]
  },
  {
    name: "Bisnis & Manajemen",
    skills: ["Business Developer", "Project Manager", "Accountant", "Human Resources", "Finance Analyst", "Investment Banking", "Public Relations", "Digital Marketer", "Marketing Strategist", "Auditor", "Tax Consultant", "Supply Chain Manager", "Business Intelligence", "Risk Management", "Entrepreneurship", "Customer Success"]
  },
  {
    name: "Hukum & Sosial",
    skills: ["Legal Consultant", "Advokat", "Notaris", "Diplomasi", "Public Policy", "Sosiologi", "Psikologi", "Konselor", "Kriminologi", "Hubungan Internasional", "Antropologi", "Politik & Pemerintahan", "Hak Asasi Manusia"]
  },
  {
    name: "Kesehatan & Medis",
    skills: ["Dokter Umum", "Dokter Spesialis", "Perawat", "Apoteker", "Ahli Gizi", "Fisioterapi", "Psikiater", "Kedokteran Gigi", "Kesehatan Masyarakat", "Radiologi", "Paramedis", "Veterinary (Dokter Hewan)"]
  },
  {
    name: "Teknik & Vokasi",
    skills: ["Mechanical Engineer", "Electrical Technician", "Civil Engineer", "Architecture", "Industrial Design", "Automotive Specialist", "Robotics Engineer", "Aerospace Engineering", "Petroleum Engineer", "Mining Engineer", "Telecommunication", "Maintenance Specialist", "Welding Technician", "Electronic Engineering"]
  },
  {
    name: "Pertanian & Lingkungan",
    skills: ["Agribusiness", "Food Technology", "Urban Farming", "Hidroponik", "Manajemen Lingkungan", "Sustainability Specialist", "Oceanography", "Marine Biology", "Naval Architect", "Fisheries Management", "Forestry", "Meteorology"]
  },
  {
    name: "Kreatif & Seni",
    skills: ["Graphic Designer", "Video Editor", "Content Creator", "Copywriter", "Photographer", "Animator", "Social Media Manager", "Music Producer", "Fashion Designer", "Interior Design", "Fine Arts", "Illustrator", "Creative Writing", "Journalism", "Broadcasting"]
  },
  {
    name: "Pendidikan & Umum",
    skills: ["Teacher/Tutor", "Curriculum Developer", "Educational Technology", "Social Worker", "Linguistik", "Translator/Penerjemah", "Interpreter", "Library Management", "Chef/Cook", "Pastry Artist", "Event Planner", "Athlete", "Sports Coach", "Logistics Coordinator", "Pilot"]
  }
];

export const SKILL_SUGGESTIONS = SKILL_GROUPS.flatMap(group => group.skills);
