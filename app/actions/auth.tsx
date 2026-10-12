'use server'

import { z } from 'zod'
import {
  verifyPassword,
  createSession,
  createUser,
  deleteSession,
} from '@/lib/auth'
import { getUserByEmail } from '@/lib/dal'
import { mockDelay } from '@/lib/utils'
import { redirect } from 'next/navigation'

// 定義一個乾淨的 Error 轉換工具
function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce(
    (acc, issue) => {
      const path = issue.path[0]?.toString() || 'form'
      if (!acc[path]) acc[path] = []
      acc[path].push(issue.message)
      return acc
    },
    {} as Record<string, string[]>,
  )
}

// Define Zod schema for signin validation
const SignInSchema = z.object({
  email: z.email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

// Define Zod schema for signup validation
const SignUpSchema = z
  .object({
    email: z.email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}
export async function signIn(formData: FormData): Promise<ActionResponse> {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validationResult = SignInSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(validationResult.error),
      }
    }

    const user = await getUserByEmail(data.email)
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      }
    }

    const isPasswordValid = await verifyPassword(data.password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
        errors: {
          email: ['Invalid email or password'],
        },
      }
    }

    await createSession(user.id)

    return {
      success: true,
      message: 'Signed in successfully',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'Something bad happened',
      error: 'Something bad happened',
    }
  }
}

export async function signUp(formData: FormData): Promise<ActionResponse> {
  console.log('here from the server')
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validationResult = SignUpSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(validationResult.error),
      }
    }

    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return {
        success: false,
        message: 'Nah',
        errors: {
          email: ['Invalid email or password'],
        },
      }
    }

    const user = await createUser(data.email, data.password)
    if (!user) {
      return {
        success: false,
        message: 'try again',
        errors: {
          email: ['account could not be created'],
        },
      }
    }

    await createSession(user.id)

    return {
      success: true,
      message: 'Account created',
    }
  } catch (e) {
    console.error(e)
    return {
      success: false,
      message: 'something bad happened',
      error: 'something bad happened',
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    await deleteSession()
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    redirect('/signin')
  }
}
