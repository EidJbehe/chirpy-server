import express from "express";
import { createUser, getUserByEmail, deleteAllUsers } from "./db/queries/users.js";
import { createChirp, getAllChirps, getChirpById, } from "./db/queries/chirps.js";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT, getBearerToken, } from "./auth.js";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
let fileserverHits = 0;
app.use(express.json());
app.post("/admin/reset", async (_req, res, next) => {
    try {
        fileserverHits = 0;
        await deleteAllUsers();
        res.status(200).send("OK");
    }
    catch (err) {
        next(err);
    }
});
app.get("/admin/metrics", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${fileserverHits} times!</p>
      </body>
    </html>
  `);
});
app.post("/api/users", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            });
        }
        const hashedPassword = await hashPassword(password);
        const user = await createUser(email, hashedPassword);
        return res.status(201).json({
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email: user.email,
        });
    }
    catch (err) {
        next(err);
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password, expiresInSeconds } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "email and password are required",
            });
        }
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                error: "incorrect email or password",
            });
        }
        const validPassword = await checkPasswordHash(password, user.hashedPassword);
        if (!validPassword) {
            return res.status(401).json({
                error: "incorrect email or password",
            });
        }
        let expiresIn = 3600;
        if (typeof expiresInSeconds === "number" &&
            expiresInSeconds > 0 &&
            expiresInSeconds < 3600) {
            expiresIn = expiresInSeconds;
        }
        const token = makeJWT(user.id, expiresIn, config.api.jwtSecret);
        return res.status(200).json({
            id: user.id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            email: user.email,
            token,
        });
    }
    catch {
        return res.status(401).json({
            error: "incorrect email or password",
        });
    }
});
app.post("/api/chirps", async (req, res, next) => {
    try {
        const token = getBearerToken(req);
        const userId = validateJWT(token, config.api.jwtSecret);
        const params = req.body;
        if (!params.body) {
            return res.status(400).json({
                error: "Chirp body is required",
            });
        }
        if (params.body.length > 140) {
            return res.status(400).json({
                error: "Chirp is too long",
            });
        }
        const badWords = ["kerfuffle", "sharbert", "fornax"];
        let cleanedBody = params.body;
        for (const word of badWords) {
            const regex = new RegExp(word, "gi");
            cleanedBody = cleanedBody.replace(regex, "****");
        }
        const chirp = await createChirp({
            body: cleanedBody,
            userId,
        });
        return res.status(201).json(chirp);
    }
    catch (err) {
        next(err);
    }
});
app.get("/api/chirps", async (_req, res, next) => {
    try {
        const chirps = await getAllChirps();
        return res.status(200).json(chirps);
    }
    catch (err) {
        next(err);
    }
});
app.get("/api/chirps/:chirpId", async (req, res, next) => {
    try {
        const { chirpId } = req.params;
        const chirp = await getChirpById(chirpId);
        if (!chirp) {
            return res.status(404).json({
                error: "chirp not found",
            });
        }
        return res.status(200).json(chirp);
    }
    catch (err) {
        next(err);
    }
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
