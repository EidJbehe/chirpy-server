import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

const app = express();
const PORT = 8080;
app.use(express.json());
const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`
      );
    }
  });

  next();
};

const middlewareMetricsInc = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  config.fileserverHits += 1;
  next();
};

const handlerReadiness = (_req: Request, res: Response): void => {
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("OK");
};

const handlerMetrics = (_req: Request, res: Response): void => {
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

const handlerReset = (_req: Request, res: Response): void => {
  config.fileserverHits = 0;
  res.set("Content-Type", "text/plain; charset=utf-8");
  res.send("Hits reset to 0");
};
const handlerValidateChirp = (req: Request, res: Response): void => {
  type RequestBody = {
    body: string;
  };

  const params: RequestBody = req.body;

  if (params.body.length > 140) {
    res.set("Content-Type", "application/json");
    res.status(400).send(
      JSON.stringify({
        error: "Chirp is too long",
      })
    );
    return;
  }

  res.set("Content-Type", "application/json");
  res.status(200).send(
    JSON.stringify({
      valid: true,
    })
  );
};
app.use(middlewareLogResponses);

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerValidateChirp);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
