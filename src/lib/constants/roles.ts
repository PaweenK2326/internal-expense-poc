import type { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  C_LEVEL: "C-Level",
};

export const PROJECT_OPTIONS = [
  "Project Alpha",
  "Project Beta",
  "Project Gamma",
  "Internal",
  "Other",
] as const;

export const CATEGORY_OPTIONS = [
  "Travel",
  "Meals",
  "Supplies",
  "Software",
  "Training",
  "Other",
] as const;
