import { z } from "zod";

export const registerSchema = z.object({
  hotelName: z.string().min(2, "Hotel name is required"),
  slug: z
    .string()
    .min(3, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(7, "Phone is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"]).default("STARTER"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
