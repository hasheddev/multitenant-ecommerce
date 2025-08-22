import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(4),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be less than 32 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or number"
    )
    .refine(
      (val) => !val.includes("--"),
      "Username cannot contain double dashes"
    )
    .transform((val) => val.toLowerCase()),
});

export const loginSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string(),
});
