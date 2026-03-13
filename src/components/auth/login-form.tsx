"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { loginAction, type LoginFormValues } from "@/app/actions/auth-actions";
import { ROLE_LABELS, DEPARTMENT_OPTIONS } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().optional(),
  role: z.enum(["EMPLOYEE", "MANAGER", "C_LEVEL"]) as z.ZodType<Role>,
  department: z.string().min(1, "Department is required"),
});

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      name: "",
      role: "EMPLOYEE",
      department: DEPARTMENT_OPTIONS[0],
    },
  });


  async function onSubmit(values: LoginFormValues) {
    const res = await loginAction(values);
    if (res && !res.success) toast.error(res.error ?? "Login failed");
  }

  return (
    <Card className="w-full max-w-md border-2 border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex justify-center">
          <Image
            src="/app-logo.png"
            alt="i2 Enterprise"
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
        <CardTitle className="text-xl">Expense Claim System</CardTitle>
        <CardDescription>
          Sign in with your email and department.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              onValueChange={(v) => form.setValue("role", v as Role)}
              value={form.watch("role")}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="rounded-lg"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select
              onValueChange={(v) => form.setValue("department", v)}
              value={form.watch("department")}
            >
              <SelectTrigger id="department" className="rounded-lg">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-sm text-destructive">
                {form.formState.errors.department.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full rounded-lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
