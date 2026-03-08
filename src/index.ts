import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { createUser, deleteAllUsers } from "./db/queries/users.js";
import { createChirp, getAllChirps,  getChirpById } from "./db/queries/chirps.js";
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();
const PORT = 8080;

app.use(express.json());

/*
========================
Custom Errors
========================
*/

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/*
========================
Metrics Middleware
========================
*/

app.use("/app", (req, res, next) => {
  config.api.fileserverHits++;
  next();
});

/*
========================
Metrics Endpoint
========================
*/

app.get("/admin/metrics", (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send(`
    <html>
      <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${config.api.fileserverHits} times!</p>
      </body>
    </html>
  `);
});

/*
========================
Reset Endpoint
========================
*/

app.post("/admin/reset", async (req, res) => {
  if (config.api.platform !== "dev") {
    res.sendStatus(403);
    return;
  }

  config.api.fileserverHits = 0;
  await deleteAllUsers();

  res.sendStatus(200);
});

/*
========================
Create User Endpoint
========================
*/

app.post("/api/users", async (req, res) => {
  type parameters = {
    email: string;
  };

  const params: parameters = req.body;

  const user = await createUser({
    email: params.email,
  });

  res.status(201).json(user);
});

/*
========================
Error Handler
========================
*/

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof BadRequestError) {
    res.status(400).send(err.message);
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).send(err.message);
    return;
  }

  if (err instanceof ForbiddenError) {
    res.status(403).send(err.message);
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).send(err.message);
    return;
  }

  console.error(err);
  res.status(500).send("Internal Server Error");
}
app.get("/api/chirps/:chirpId", async (req, res, next) => {
  try {
    const chirpId = req.params.chirpId;
    const chirp = await getChirpById(chirpId);

    if (!chirp) {
      res.sendStatus(404);
      return;
    }

    res.status(200).json(chirp);
  } catch (err) {
    next(err);
  }
});
app.get("/api/chirps", async (req, res, next) => {
  try {
    const chirps = await getAllChirps();
    res.status(200).json(chirps);
  } catch (err) {
    next(err);
  }
});
app.post("/api/chirps", async (req, res, next) => {
  try {
    type parameters = {
      body: string;
      userId: string;
    };

    const params: parameters = req.body;

    if (params.body.length > 140) {
      throw new BadRequestError("Chirp is too long");
    }

    const badWords = ["kerfuffle", "sharbert", "fornax"];
    let cleanedBody = params.body;

    for (const word of badWords) {
      const regex = new RegExp(word, "gi");
      cleanedBody = cleanedBody.replace(regex, "****");
    }

    const chirp = await createChirp({
      body: cleanedBody,
      userId: params.userId,
    });

    res.status(201).json(chirp);
  } catch (err) {
    next(err);
  }
});
app.use(errorHandler);

/*
========================
Start Server
========================
*/

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
