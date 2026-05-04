import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dummy Payment Gateway Endpoint
  app.post("/api/payments/dummy-process", (req, res) => {
    const { amount, method } = req.body;
    // In a real app, this would redirect to a gateway or handle webhook
    console.log(`Processing dummy payment of ${amount} via ${method}`);
    res.json({ success: true, transactionId: "DUMMY_" + Date.now() });
  });

  // Mock External Provider API Integration
  app.post("/api/provider/order", (req, res) => {
    const { service, link, quantity } = req.body;
    console.log(`Mock Provider: Placing order for service ${service}`);
    res.json({ order: Math.floor(Math.random() * 1000000), status: "pending" });
  });

  // API System for Users (as requested)
  app.post("/api/v1/order/add", (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "Missing API Key" });
    
    // In search of user by API Key in Firestore (would normally do this)
    res.json({ status: "success", order: Date.now() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Fallback for development to serve index.html
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.readFileSync(
          path.resolve(__dirname, "index.html"),
          "utf-8"
        );
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
