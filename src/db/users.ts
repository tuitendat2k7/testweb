import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    // First, try to find the user by their UID
    const existingUser = await db.select().from(users).where(eq(users.uid, uid)).limit(1);

    if (existingUser.length > 0) {
      // User already exists, return their profile
      return existingUser[0];
    }

    // User does not exist, create them
    // Check if any user exists so we can set admin role for the first user
    const allUsers = await db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    // Also set admin if the user has a specific email
    const isAdminEmail = email === 'tuitendat2k7@gmail.com';
    const role = (isFirstUser || isAdminEmail) ? 'admin' : 'student';

    const newUser = await db.insert(users)
      .values({
        uid,
        email,
        name: name || email.split('@')[0],
        role,
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.error("Database getOrCreateUser failed:", error);
    throw new Error("Failed to register/sync user in SQL database.", { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Database select user failed:", error);
    throw new Error("Failed to select user in SQL database.", { cause: error });
  }
}

export async function updateUserRole(uid: string, role: 'admin' | 'student') {
  try {
    const result = await db.update(users)
      .set({ role })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database update user role failed:", error);
    throw new Error("Failed to update user role in SQL database.", { cause: error });
  }
}
