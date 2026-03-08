import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
app.use(express.json());
class BadRequestError extends Error {
    constructor(message) {
        super(message);
    }
}
class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
    }
}
class ForbiddenError extends Error {
    constructor(message) {
        super(message);
    }
}
class NotFoundError extends Error {
    constructor(message) {
        super(message);
    }
}
const middlewareLogResponses = (req, res, next) => {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
};
const middlewareMetricsInc = (req, res, next) => {
    config.fileserverHits += 1;
    next();
};
const handlerReadiness = (_req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
};
const handlerMetrics = (_req, res) => {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`
<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
  </body>
</html>
`);
};
const handlerReset = (_req, res) => {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("Hits reset to 0");
};
const handlerValidateChirp = async (req, res) => {
    const params = req.body;
    if (!params.body) {
        throw new BadRequestError("Something went wrong");
    }
    if (params.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    const profaneWords = ["kerfuffle", "sharbert", "fornax"];
    const words = params.body.split(" ");
    const cleanedWords = words.map((word) => {
        if (profaneWords.includes(word.toLowerCase())) {
            return "****";
        }
        return word;
    });
    const cleanedBody = cleanedWords.join(" ");
    res.status(200).json({
        cleanedBody: cleanedBody,
    });
};
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.post("/api/validate_chirp", (req, res, next) => {
    Promise.resolve(handlerValidateChirp(req, res)).catch(next);
});
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
const errorHandler = (err, req, res, next) => {
    if (err instanceof BadRequestError) {
        res.status(400).json({ error: err.message });
        return;
    }
    if (err instanceof UnauthorizedError) {
        res.status(401).json({ error: err.message });
        return;
    }
    if (err instanceof ForbiddenError) {
        res.status(403).json({ error: err.message });
        return;
    }
    if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
        return;
    }
    console.log(err);
    res.status(500).json({
        error: "Internal Server Error",
    });
};
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
