import { getMockUser } from "@/lib/auth-mock";
import { getDashboardSummary } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ProjectBarChart } from "@/components/dashboard/project-bar-chart";

export default async function DashboardPage() {
  const user = await getMockUser();
  if (!user) return null;

  const data = await getDashboardSummary();
  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <KpiCards
        totalApprovedThisMonth={data.totalApprovedThisMonth}
        totalPending={data.totalPending}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By category (this month)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryPieChart data={data.byCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By project (this month)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ProjectBarChart data={data.byProject} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
