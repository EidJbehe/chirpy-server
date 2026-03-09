import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { users } from "../schema.js";
export async function createUser(email, hashedPassword) {
    const [user] = await db
        .insert(users)
        .values({
        email,
        hashedPassword,
    })
        .returning();
    return user;
}
export async function getUserByEmail(email) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return user;
}
export async function deleteAllUsers() {
    await db.delete(users);
}
