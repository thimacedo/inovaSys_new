import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vercel API routes
  app.get("/api/vercel/deployments", async (req, res) => {
    try {
      const apiKey = process.env.VERCEL_API_KEY;
      const projectId = process.env.VERCEL_PROJECT_ID;

      if (!apiKey || !projectId) {
        return res.status(400).json({ error: "Vercel API Key or Project ID missing in environment variables." });
      }

      const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Vercel deployments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vercel/deploy", async (req, res) => {
    try {
      const apiKey = process.env.VERCEL_API_KEY;
      const projectId = process.env.VERCEL_PROJECT_ID;

      if (!apiKey || !projectId) {
        return res.status(400).json({ error: "Vercel API Key or Project ID missing in environment variables." });
      }

      const response = await fetch(`https://api.vercel.com/v13/deployments`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "inovasys", // Or fetch from Vercel project details
          project: projectId,
          target: "production"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json(errorData);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error triggering Vercel deploy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
