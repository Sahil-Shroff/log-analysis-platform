import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import dashboardRoutes from "./routes/dashboard.js";
import servicesRoutes from "./routes/services.js";
import logsRoutes from "./routes/logs.js";
import olapRoutes from "./routes/olap.js";

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDoc = YAML.load("docs/openapi.yaml");

// Routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/olap", olapRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[backend] REST API running on http://localhost:${PORT}`);
});
