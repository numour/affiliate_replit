import { z } from "zod";

export const affiliateFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  instagram: z
    .string()
    .min(2, { message: "Instagram handle is required" })
    .refine((val) => val.startsWith("@"), {
      message: "Instagram handle should start with @",
    }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .refine((val) => /^\d+$/.test(val), {
      message: "Phone number should contain only digits",
    }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  address: z
    .string()
    .min(10, { message: "Please provide a complete address" }),
});
