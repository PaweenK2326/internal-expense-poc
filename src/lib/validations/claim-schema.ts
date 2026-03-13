import { z } from "zod";

const amountSchema = z.preprocess(
  (val) =>
    val === "" || val === undefined || val === null
      ? undefined
      : typeof val === "number"
        ? val
        : Number(val),
  z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Enter a valid amount",
    })
    .positive("Amount must be greater than 0")
);

export const claimFormSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    project: z.string().min(1, "Project is required"),
    category: z.string().min(1, "Category is required"),
    amount: amountSchema,
    note: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

export const approvePayloadSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export type ApprovePayload = z.infer<typeof approvePayloadSchema>;
