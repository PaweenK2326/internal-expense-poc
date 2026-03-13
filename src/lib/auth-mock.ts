import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

const AUTH_COOKIE = "internal-expense-mock-user";

export type MockUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: string;
};

export async function getMockUser(): Promise<MockUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AUTH_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as MockUser;
  } catch {
    return null;
  }
}

export async function setMockUser(user: MockUser): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearMockUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}
