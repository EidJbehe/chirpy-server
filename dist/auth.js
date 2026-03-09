import argon2 from "argon2";
import jwt from "jsonwebtoken";
export async function hashPassword(password) {
    return await argon2.hash(password);
}
export async function checkPasswordHash(password, hash) {
    return await argon2.verify(hash, password);
}
export function makeJWT(userID, expiresIn, secret) {
    const iat = Math.floor(Date.now() / 1000);
    const payload = {
        iss: "chirpy",
        sub: userID,
        iat,
        exp: iat + expiresIn,
    };
    return jwt.sign(payload, secret);
}
export function validateJWT(tokenString, secret) {
    try {
        const decoded = jwt.verify(tokenString, secret);
        if (!decoded.sub || typeof decoded.sub !== "string") {
            throw new Error("Invalid token");
        }
        return decoded.sub;
    }
    catch {
        throw new Error("Invalid token");
    }
}
export function getBearerToken(req) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new Error("Missing authorization header");
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new Error("Invalid authorization header");
    }
    return parts[1];
}
