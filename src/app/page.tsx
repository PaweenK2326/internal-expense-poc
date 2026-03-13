import { redirect } from "next/navigation";
import { getMockUser } from "@/lib/auth-mock";

export default async function Home() {
  const user = await getMockUser();
  if (user) redirect("/dashboard");
  redirect("/login");
}
