"use server";

import "server-only";

import { lucia } from "@/lib/auth/lucia";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .trim()
    .refine((val) => !/<[^>]*>/.test(val), {
      message: "Name cannot contain HTML tags",
    }),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim()
    .max(255, "Email is too long"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password is too long")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export async function signup(prevState: any, formData: FormData) {
  const requestHeaders = await headers();
  const ip = getClientIP(requestHeaders);

  // Rate limit signup attempts (prevent abuse)
  const rateLimit = checkRateLimit({
    key: `signup:${ip}`,
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  });

  if (!rateLimit.success) {
    return { error: "Too many signup attempts. Please try again later." };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // Check if user already exists
  const existingUser = (await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1))[0];

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  // Hash password with Argon2
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      role: "owner", // First user is always owner
    })
    .returning();

  // Create session
  const session = await lucia.createSession(newUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function login(prevState: any, formData: FormData) {
  const requestHeaders = await headers();
  const ip = getClientIP(requestHeaders);

  // Rate limit: 5 login attempts per 15 minutes per IP
  const rateLimit = checkRateLimit({
    key: `login:${ip}`,
    limit: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  });

  if (!rateLimit.success) {
    const resetDate = new Date(rateLimit.resetTime);
    return {
      error: `Too many login attempts. Please try again after ${resetDate.toLocaleTimeString()}.`,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { email, password } = parsed.data;

  const user = (await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1))[0];

  if (!user) {
    // Use generic message to avoid user enumeration
    return { error: "Invalid email or password" };
  }

  const validPassword = await verify(user.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  if (!validPassword) {
    return { error: "Invalid email or password" };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;

  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }

  // Create a blank session cookie with proper security attributes
  const sessionCookie = lucia.createBlankSessionCookie();

  cookieStore.set(sessionCookie.name, sessionCookie.value, {
    ...sessionCookie.attributes,
    // Ensure the cookie is properly cleared
    maxAge: 0,
    expires: new Date(0),
  });

  redirect("/login");
}