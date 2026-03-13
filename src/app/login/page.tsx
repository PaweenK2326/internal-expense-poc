import { redirect } from "next/navigation";
import { getMockUser } from "@/lib/auth-mock";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getMockUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-accent/20 p-4">
      <LoginForm />
    </div>
  );
}
