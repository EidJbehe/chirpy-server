import express from "express";
import { config } from "./config.js";
const app = express();
const PORT = 8080;
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
const handlerReadiness = (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
};
const handlerMetrics = (req, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits: ${config.fileserverHits}`);
};
const handlerReset = (req, res) => {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("Hits reset to 0");
};
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.get("/api/healthz", handlerReadiness);
app.get("/api/metrics", handlerMetrics);
app.get("/api/reset", handlerReset);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
