"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimFormSchema, type ClaimFormValues } from "@/lib/validations/claim-schema";
import { PROJECT_OPTIONS, CATEGORY_OPTIONS } from "@/lib/constants/roles";
import { createClaimAction } from "@/app/actions/claim-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, X } from "lucide-react";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPT = "image/*,.pdf";

export function ClaimForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFullOpen, setPreviewFullOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      project: "",
      category: "",
      amount: undefined as unknown as number,
      note: "",
    },
  });

  async function onSubmit(values: ClaimFormValues) {
    const file = selectedFile;
    let receiptUrl: string | null = null;
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Receipt file must be under 4MB.");
        return;
      }
      receiptUrl = await uploadReceipt(file);
    }
    const res = await createClaimAction(values, receiptUrl);
    if (res.success) {
      form.reset();
      clearFile();
      toast.success("Claim submitted successfully.");
    } else {
      toast.error(res.error ?? "Failed to submit claim.");
    }
  }

  function clearFile() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(file ?? null);
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      handleFileChange(file);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  }

  /** Try Vercel Blob first; fall back to base64 data URL when Blob is not configured. */
  async function uploadReceipt(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.set("receipt", file);
      const res = await fetch("/api/upload-receipt", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        return data.url;
      }
      if (res.status === 503) {
        return readFileAsDataUrl(file);
      }
      const err = (await res.json()).error as string | undefined;
      throw new Error(err ?? "Upload failed");
    } catch {
      return readFileAsDataUrl(file);
    }
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  return (
    <Card className="mx-auto w-full max-w-2xl overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/20 px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="text-xl">New expense claim</CardTitle>
        <CardDescription className="text-muted-foreground">
          Submit a claim with date range, project, category, amount, and optional receipt.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-5 sm:px-6 sm:pt-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground">
                Start date
              </Label>
              <Input
                id="startDate"
                type="date"
                className="rounded-lg"
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
              <Label htmlFor="endDate" className="text-foreground">
                End date
              </Label>
              <Input
                id="endDate"
                type="date"
                className="rounded-lg"
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
            <div className="space-y-2">
              <Label htmlFor="project" className="text-foreground">
                Project
              </Label>
              <Select
                onValueChange={(v) => form.setValue("project", v)}
                value={form.watch("project")}
              >
                <SelectTrigger id="project" className="rounded-lg">
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
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Select
                onValueChange={(v) => form.setValue("category", v)}
                value={form.watch("category")}
              >
                <SelectTrigger id="category" className="rounded-lg">
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
          </section>

          <section className="rounded-xl bg-muted/20 p-3 sm:p-4">
            <Label htmlFor="amount" className="text-foreground font-medium">
              Amount (฿)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="mt-2 max-w-xs rounded-lg text-lg font-semibold tabular-nums"
              value={form.watch("amount") ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                form.setValue(
                  "amount",
                  v === "" ? (undefined as unknown as number) : parseFloat(v) || (undefined as unknown as number)
                );
              }}
              onFocus={(e) => e.target.select()}
            />
            {form.formState.errors.amount && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <Label htmlFor="note" className="text-foreground">
              Note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="Add a note about this claim…"
              className="min-h-[100px] rounded-lg resize-y"
              {...form.register("note")}
            />
          </section>

          <section className="space-y-2">
            <Label className="text-foreground">Receipt (optional)</Label>
            <input
              ref={fileInputRef}
              id="receipt"
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={onInputChange}
            />
            {!selectedFile ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onKeyDown={(e) =>
                  e.key === "Enter" && fileInputRef.current?.click()
                }
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 transition-colors hover:border-primary/40 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:py-8"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Drop receipt here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  Image or PDF, max 4MB
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                {previewUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewFullOpen(true)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted shadow-inner transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="View receipt in full size"
                  >
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                    {selectedFile.size > MAX_FILE_SIZE && (
                      <span className="text-destructive"> — over 4MB limit</span>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-lg"
                  onClick={clearFile}
                  aria-label="Remove receipt"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            )}
          </section>

          <Dialog open={previewFullOpen} onOpenChange={setPreviewFullOpen}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-auto">
              <DialogHeader>
                <DialogTitle>Receipt preview</DialogTitle>
              </DialogHeader>
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Receipt (full size)"
                    className="max-h-[75vh] w-auto max-w-full rounded-lg border border-border object-contain"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              type="submit"
              size="lg"
              className="min-w-[140px] rounded-lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Submitting…" : "Submit claim"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
