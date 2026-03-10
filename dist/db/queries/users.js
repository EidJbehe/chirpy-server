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
export async function updateUser(id, email, hashedPassword) {
    const [user] = await db
        .update(users)
        .set({
        email,
        hashedPassword,
        updatedAt: new Date(),
    })
        .where(eq(users.id, id))
        .returning();
    return user;
}
export async function upgradeUserToChirpyRed(id) {
    const [user] = await db
        .update(users)
        .set({ isChirpyRed: true, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
    return user;
}
