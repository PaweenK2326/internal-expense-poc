import { redirect } from "next/navigation";
import { getMockUser } from "@/lib/auth-mock";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getMockUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <LoginForm />
    </div>
  );
}
