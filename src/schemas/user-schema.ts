import { z } from "zod"

export const createUserSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100, "Name is too long"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .regex(/^\S*$/, "Password must not contain spaces"),
  role_name: z.string().min(1, "Access role is required"),
  is_active: z.boolean(),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const DEFAULT_CREATE_USER_VALUES: CreateUserFormValues = {
  full_name: "",
  email: "",
  password: "",
  role_name: "",
  is_active: true,
}

// Zod Schema for Edit User Form
export const editUserSchema = z.object({
  role_name: z.string().min(1, "Access role is required"),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>


