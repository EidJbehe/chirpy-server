import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc } from "drizzle-orm";
export async function createChirp(chirp: NewChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .returning();

  return result;
}
export async function getAllChirps() {
  return await db
    .select()
    .from(chirps)
    .orderBy(asc(chirps.createdAt));
}
