import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { config } from "./config.js";

const app = express();
const PORT = 8080;

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

app.use(middlewareLogResponses);

app.get("/app", middlewareMetricsInc, (_req: Request, res: Response) => {
  res.sendFile(path.resolve("src/app/index.html"));
});

app.use("/app", middlewareMetricsInc, express.static(path.resolve("src/app")));

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerReset);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
