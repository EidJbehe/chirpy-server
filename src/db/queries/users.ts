import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { NewUser, users } from "../schema.js";

export async function createUser(email: string, hashedPassword: string) {
  const [user] = await db
    .insert(users)
    .values({
      email,
      hashedPassword,
    })
    .returning();

  return user;
}


export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return user;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
