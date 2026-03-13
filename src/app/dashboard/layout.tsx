import { redirect } from "next/navigation";
import { getMockUser } from "@/lib/auth-mock";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMockUser();
  if (!user) redirect("/login");

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
