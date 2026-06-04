import "server-only";

import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "auth_session",
    attributes: {
      // HTTPS only in production (prevents cookie theft over HTTP)
      secure: process.env.NODE_ENV === "production",
      // Lax is a good balance between security and usability
      sameSite: "lax",
      // httpOnly is set to true by Lucia by default (XSS protection)
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      name: attributes.name,
      role: attributes.role,
    };
  },
});

// IMPORTANT: This type is required for Lucia
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  email: string;
  name: string;
  role: "owner" | "office" | "tech";
}