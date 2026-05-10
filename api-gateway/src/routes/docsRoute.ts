import { Router } from "express";
import { apiReference } from "@scalar/express-api-reference";

const docRoute = Router();

import fs from "fs";
import path from "path";

const docsDir = path.resolve(process.cwd(), "docs");

if (fs.existsSync(docsDir)) {
  const files = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".json"));

  files.forEach((file) => {
    const filePath = path.join(docsDir, file);

    const swaggerDocument = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Remove .json extension
    const serviceName = path.basename(file, ".json");

    // Dynamic route
    docRoute.get(`/${serviceName}.json`, (_req, res) => {
      res.json(swaggerDocument);
    });

    /**
     * Scalar UI endpoint
     */
    docRoute.use(
      `/${serviceName}`,
      apiReference({
        url: `/docs/${serviceName}.json`,
        showDeveloperTools: "never",
        theme: "purple",
      }),
    );

    console.log(`✅ Registered docs: /docs/${serviceName}.json`);
  });
}

export default docRoute;
