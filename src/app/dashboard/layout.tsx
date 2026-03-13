import { redirect } from "next/navigation";
import { getMockUser } from "@/lib/auth-mock";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMockUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-background p-4 md:p-6">
        {children}
      </main>
    </div>
  }
}
