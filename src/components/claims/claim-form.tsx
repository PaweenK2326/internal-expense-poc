"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimFormSchema, type ClaimFormValues } from "@/lib/validations/claim-schema";
import { PROJECT_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants/roles";
import { createClaimAction } from "@/app/actions/claim-actions";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ClaimForm() {
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      project: "",
      category: "",
      amount: 0,
      note: "",
    },
  });

  async function onSubmit(values: ClaimFormValues) {
    setResult(null);
    const res = await createClaimAction(values, null);
    if (res.success) {
      form.reset();
      setResult({ success: true });
    } else {
      setResult({ success: false, error: res.error });
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>New expense claim</CardTitle>
        <CardDescription>
          Submit a claim with date range, project, category, and amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2 sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={
                  form.watch("startDate") instanceof Date
                    ? form.watch("startDate").toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  form.setValue("startDate", new Date(e.target.value))
                }
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={
                  form.watch("endDate") instanceof Date
                    ? form.watch("endDate").toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  form.setValue("endDate", new Date(e.target.value))
                }
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              onValueChange={(v) => form.setValue("project", v)}
              value={form.watch("project")}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.project && (
              <p className="text-sm text-destructive">
                {form.formState.errors.project.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(v) => form.setValue("category", v)}
              value={form.watch("category")}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="amount">Amount (฿)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" placeholder="Optional note" {...form.register("note")} />
          </div>

          {result && (
            <p
              className={`text-sm sm:col-span-2 ${
                result.success ? "text-green-600" : "text-destructive"
              }`}
            >
              {result.success ? "Claim submitted successfully." : result.error}
            </p>
          )}

          <Button type="submit" className="sm:col-span-2" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting…" : "Submit claim"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
