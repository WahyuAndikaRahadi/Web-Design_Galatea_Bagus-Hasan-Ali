
import { callGemini } from "./gemini";

interface UserContext {
  skills: string[];
  dnaType: string;
  availability: string;
  trustLevel: string;
  completedProjectCategories: string[];
  preferredCommitmentLevel: string;
}

interface Project {
  id: string;
  title: string;
  category: string;
  skills: string[];
  commitmentLevel: string;
}

export async function getProjectRecommendations(userContext: UserContext, openProjects: Project[]) {
  if (openProjects.length === 0) {
    return {
      recommendations: [],
      message: "Saat ini tidak ada project open di platform. Coba lagi nanti atau buat projectmu sendiri!"
    };
  }

  const prompt = `Kamu adalah matchmaking AI di CollaboLab untuk Gen-Z Indonesia.
Tugasmu adalah merekomendasikan project dari database yang paling cocok dengan profil user.

PENTING: 
1. HANYA GUNAKAN project dari list "PROJECT TERSEDIA" di bawah.
2. JANGAN PERNAH mengarang project baru atau menggunakan ID yang tidak ada di list.
3. Jika tidak ada yang cocok, kembalikan array kosong.
4. Berikan alasan yang sangat personal berdasarkan Skill Match atau Collaboration DNA.

Profil User:
- Skill: ${userContext.skills.join(", ")}
- DNA: ${userContext.dnaType}
- Level: ${userContext.trustLevel}
- Minat Kategori: ${userContext.completedProjectCategories.join(", ")}
- Target Komitmen: ${userContext.preferredCommitmentLevel}

PROJECT TERSEDIA:
${openProjects.map(p => `
[ID: ${p.id}]
Judul: ${p.title}
Kategori: ${p.category}
Skill Dibutuhkan: ${p.skills.join(", ")}
Komitmen: ${p.commitmentLevel}
`).join("\n---\n")}

Output format HANYA JSON:
{
  "recommendations": [
    {
      "projectId": "id dari list di atas",
      "projectTitle": "Judul project sesuai list",
      "matchScore": 0,
      "reasoning": "Kenapa cocok? Hubungkan dengan skill user atau DNA mereka. Contoh: 'React dan Builder DNA kamu sangat cocok untuk project startup ini.'"
    }
  ]
}
`;

  return await callGemini("PROJECT_RECOMMENDATION", prompt);
}
