import { prisma } from "@/lib/prisma";
import { NoiseTexture, SectionLabel } from "@/components/ui/DecorativeElements";

async function getStats() {
  const [userCount, projectCount, reportCount, recentUsers, recentProjects] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.report.count(),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, createdAt: true, email: true } }),
    prisma.project.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { owner: { select: { name: true } } } }),
  ]);

  return { userCount, projectCount, reportCount, recentUsers, recentProjects };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "40px" }}>
        <div style={{ display: "inline-block", background: "#FFE500", color: "#000", padding: "4px 12px", borderRadius: "2px", fontWeight: 900, fontSize: "12px", marginBottom: "16px" }}>
           SYSTEM_ADMIN_ACCESS_GRANTED
        </div>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "48px", margin: "0 0 12px 0", color: "#FFE500" }}>
          Command Center
        </h1>
        <p style={{ color: "#888", fontSize: "18px", fontWeight: 500 }}>
          Monitoring global ecosystem health and user activity.
        </p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        <div style={{ background: "#161616", border: "2px solid #333", borderRadius: "8px", padding: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#888", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Total Users</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#fff" }}>{stats.userCount}</div>
          <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "12px", color: "#00D37F" }}>↑ 12% from last week</div>
          <div style={{ position: "absolute", bottom: "-10px", right: "-10px", fontSize: "60px", opacity: 0.1 }}>👥</div>
        </div>
        
        <div style={{ background: "#161616", border: "2px solid #333", borderRadius: "8px", padding: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#888", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Active Projects</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#FFE500" }}>{stats.projectCount}</div>
          <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "12px", color: "#FFE500" }}>Stable activity</div>
          <div style={{ position: "absolute", bottom: "-10px", right: "-10px", fontSize: "60px", opacity: 0.1 }}>📁</div>
        </div>

        <div style={{ background: "#161616", border: "2px solid #FF4D4D", borderRadius: "8px", padding: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#FF4D4D", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "1px" }}>Pending Reports</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#FF4D4D" }}>{stats.reportCount}</div>
          <div style={{ fontSize: "12px", fontWeight: 700, marginTop: "12px", color: "#FF4D4D" }}>Requires Attention</div>
          <div style={{ position: "absolute", bottom: "-10px", right: "-10px", fontSize: "60px", opacity: 0.1 }}>🚩</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Recent Users */}
        <div style={{ background: "#161616", border: "2px solid #333", borderRadius: "8px", padding: "32px" }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#FFE500" }}>{">"}</span> Recent Registrations
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {stats.recentUsers.map(user => (
              <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #222" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff" }}>{user.name}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{user.email}</div>
                </div>
                <div style={{ fontSize: "10px", fontWeight: 800, background: "#222", color: "#888", padding: "4px 8px", borderRadius: "2px", border: "1px solid #333" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div style={{ background: "#161616", border: "2px solid #333", borderRadius: "8px", padding: "32px" }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", marginBottom: "24px", color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#FFE500" }}>{">"}</span> Latest Projects
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {stats.recentProjects.map(project => (
              <div key={project.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #222" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff" }}>{project.title}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>owner: {project.owner.name}</div>
                </div>
                <div style={{ fontSize: "10px", fontWeight: 800, background: "#FFE500", color: "#000", padding: "4px 8px", borderRadius: "2px" }}>
                  {project.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
