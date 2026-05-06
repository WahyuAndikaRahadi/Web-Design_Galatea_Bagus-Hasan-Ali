import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeedPage } from "@/components/feed/FeedPage";
import { Navbar } from "@/components/ui/Navbar";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, trustScore: true, trustLevel: true },
  });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 80px)", background: "#FFFFFF" }}>
        <FeedPage user={user} />
      </main>
    </>
  );
}
