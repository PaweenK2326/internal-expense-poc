import { getMockUser } from "@/lib/auth-mock";
import { getDashboardSummary } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ClaimStatusCards } from "@/components/dashboard/claim-status-cards";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ProjectBarChart } from "@/components/dashboard/project-bar-chart";
import { MonthSelector } from "@/components/dashboard/month-selector";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getYearAndMonthFromSearchParams(searchParams?: {
  [key: string]: string | string[] | undefined;
}): { year: number; monthIndex0Based: number; label: string } {
  const now = new Date();
  const raw = searchParams?.month;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value) {
    const [yearStr, monthStr] = value.split("-");
    const parsedYear = Number(yearStr);
    const parsedMonth = Number(monthStr);

    if (
      Number.isFinite(parsedYear) &&
      Number.isFinite(parsedMonth) &&
      parsedMonth >= 1 &&
      parsedMonth <= 12
    ) {
      const monthIndex0Based = parsedMonth - 1;
      const labelDate = new Date(parsedYear, monthIndex0Based, 1);
      const label = labelDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      return { year: parsedYear, monthIndex0Based, label };
    }
  }

  const label = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return { year: now.getFullYear(), monthIndex0Based: now.getMonth(), label };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await getMockUser();
  if (!user) return null;

  const params = await searchParams;
  const { year, monthIndex0Based, label } = getYearAndMonthFromSearchParams(params);

  const data = await getDashboardSummary(year, monthIndex0Based);
  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <MonthSelector />
        </div>
        <p className="text-muted-foreground">Unable to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <MonthSelector />
      </div>
      <KpiCards
        totalApprovedThisMonth={data.totalApprovedThisMonth}
        totalPending={data.totalPending}
      />
      <ClaimStatusCards countByStatus={data.countByStatus} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By category ({label})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CategoryPieChart data={data.byCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By project ({label})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ProjectBarChart data={data.byProject} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
