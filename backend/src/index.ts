import express from "express";
import cors from "cors";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import dashboardRoutes from "./routes/dashboard.ts";
import servicesRoutes from "./routes/services.ts";
import logsRoutes from "./routes/logs.ts";
import olapRoutes from "./routes/olap.ts";

const app = express();
app.use(cors());
app.use(express.json());

const swaggerDoc = YAML.load("docs/swagger.yaml");

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
