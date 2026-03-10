import { db } from "../index.js";
import { chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";
export async function createChirp(chirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .returning();
    return result;
}
export async function getAllChirps(authorId) {
    if (authorId) {
        return await db
            .select()
            .from(chirps)
            .where(eq(chirps.userId, authorId))
            .orderBy(asc(chirps.createdAt));
    }
    return await db
        .select()
        .from(chirps)
        .orderBy(asc(chirps.createdAt));
}
export async function getChirpById(id) {
    const [result] = await db
        .select()
        .from(chirps)
        .where(eq(chirps.id, id));
    return result;
}
export async function deleteChirp(id) {
    const [chirp] = await db
        .delete(chirps)
        .where(eq(chirps.id, id))
        .returning();
    return chirp;
}
