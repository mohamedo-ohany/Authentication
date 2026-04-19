import * as z from "zod/v4";

const UsernameSchema = z
  .string()
  .regex(/^\S+$/, "Username must not contain spaces")
  .min(3, "Username must be at least 3 characters")
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Username can only contain A-Z, a-z, 0-9, (.), (_), and (-)",
  )
  .max(50, "Username must be at most 50 characters");

const EmailSchema = z
  .string()
  .regex(/^\S+$/, "Email must not contain spaces")
  .email("Invalid email address")
  .max(255, "Email must be at most 255 characters");

export const SignupFormSchema = z
  .object({
    username: UsernameSchema,
    email: EmailSchema,
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be at most 50 characters"),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type SignupFormData = z.infer<typeof SignupFormSchema>;

export const LoginFormSchema = z.object({
  email: z
    .string()
    .refine(
      (value) =>
        EmailSchema.safeParse(value).success ||
        UsernameSchema.safeParse(value).success,
      "Enter a valid email or username",
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be at most 50 characters"),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
