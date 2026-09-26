import { z } from 'zod';


const passwordSchema = z.union([
  z.string().min(1).max(128),
  z.object({ plain_text: z.string().min(1).max(128) }),
]).transform((value) => typeof value === 'string' ? value : value.plain_text);

export const signupSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  username: z.string().trim().min(3).max(100),
  password: passwordSchema.pipe(z.string().min(8).max(128)),
  playerLevel: z.string().trim().min(1).optional(),
  rank: z.string().trim().min(1).optional(),
  bio: z.string().optional(),
  bgClass: z.string().optional(),
});

export const signinSchema = z.object({
  email: z.string().trim().email().toLowerCase().optional(),
  username: z.string().trim().min(3).optional(),
  password: passwordSchema,
}).refine((data) => data.email || data.username, {
  message: 'Email or username is required',
  path: ['email'],
});

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  password:z.string().min(8).max(128),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type SignupData = SignupInput & { avatarUrl: string };
export type SigninInput = z.infer<typeof signinSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
