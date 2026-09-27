import express from "express";
import cors from "cors";
import { floorPlanRouter } from "./routes/floorPlans";
import { planningRouter } from "./routes/planning";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/floor-plans", floorPlanRouter);
app.use("/api/floor-plans", planningRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
