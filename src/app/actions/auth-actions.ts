"use server";

import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { setMockUser, clearMockUser } from "@/lib/auth-mock";
import { prisma } from "@/lib/prisma";

export type LoginFormValues = {
  email: string;
  name: string;
  role: Role;
  department: string;
};

export async function loginAction(formData: LoginFormValues) {
  try {
    let user = await prisma.user.findFirst({
      where: { email: formData.email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          department: formData.department,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: formData.name,
          role: formData.role,
          department: formData.department,
        },
      });
    }
    await setMockUser({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    console.error("loginAction error:", error);
    return { success: false, error: "Login failed. Please try again." };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  try {
    await clearMockUser();
  } catch (error) {
    console.error("logoutAction error:", error);
    return { success: false, error: "Logout failed." };
  }
  redirect("/login");
}
