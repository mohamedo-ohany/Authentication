import * as z from "zod/v4";

export const SignupFormSchema = z
  .object({
    username: z
      .string()
      .regex(/^\S+$/, "Username must not contain spaces")
      .min(2, "Username must be at least 2 characters")
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        "Username can only contain A-Z, a-z, 0-9, (.), (_), and (-)",
      )
      .max(20, "Username must be at most 20 characters"),
    email: z
      .string()
      .regex(/^\S+$/, "Email must not contain spaces")
      .email("Invalid email address")
      .max(50, "Email must be at most 50 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must be at most 50 characters"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type FormData = z.infer<typeof SignupFormSchema>;

export const LoginFormSchema = z.object({
  email: z
    .string()
    .regex(/^\S+$/, "Email must not contain spaces")
    .email("Invalid email address")
    .max(50, "Email must be at most 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be at most 50 characters"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
