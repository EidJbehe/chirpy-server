import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  checkPasswordHash,
  makeJWT,
  validateJWT,
} from "./auth";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";

  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});

describe("JWT", () => {
  const secret = "test-secret";
  const userID = "123";

  it("should create and validate a JWT", () => {
    const token = makeJWT(userID, 60, secret);
    const decodedUserID = validateJWT(token, secret);

    expect(decodedUserID).toBe(userID);
  });

  it("should reject token signed with wrong secret", () => {
    const token = makeJWT(userID, 60, secret);

    expect(() => {
      validateJWT(token, "wrong-secret");
    }).toThrow();
  });

  it("should reject expired tokens", () => {
    const token = makeJWT(userID, -10, secret);

    expect(() => {
      validateJWT(token, secret);
    }).toThrow();
  });
});
