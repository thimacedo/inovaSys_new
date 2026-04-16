import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  app.use(express.json({ limit: '10mb' }));

  // Rate limiting for API routes
  const requestCounts: Map<string, { count: number; resetAt: number }> = new Map();
  app.use('/api/', (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);
    if (record && now < record.resetAt) {
      if (record.count > 200) { // 200 requests per minute
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      record.count++;
    } else {
      requestCounts.set(ip, { count: 1, resetAt: now + 60000 });
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vercel API routes - Server-side only, keys never exposed to client
  app.get("/api/vercel/deployments", async (req, res) => {
    try {
      const apiKey = process.env.VERCEL_API_KEY;
      const projectId = process.env.VERCEL_PROJECT_ID;

      if (!apiKey || !projectId) {
        return res.status(400).json({ error: "Vercel API Key or Project ID missing in environment variables." });
      }

      // Validate projectId is a valid identifier (alphanumeric + underscore only)
      if (!/^[a-zA-Z0-9_]+$/.test(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format." });
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

  app.post("/api/vercel/email", async (req, res) => {
    const { to, subject, html } = req.body;

    // Use Nodemailer if SMTP credentials are provided, otherwise use mock
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: (process.env.SMTP_PORT === "465"), // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: `"InovaSys" <${process.env.SMTP_USER}>`,
          to: to,
          subject: subject,
          html: html,
        });

        console.log("Message sent: %s", info.messageId);
        res.json({ success: true, messageId: info.messageId });

      } catch (error) {
        console.error("Error sending email with Nodemailer:", error);
        res.status(500).json({ error: "Failed to send email" });
      }
    } else {
      // Fallback to mock for local development
      try {
        console.log(`[Dev Mock Email] Enviando para: ${to}\nAssunto: ${subject}`);
        res.json({ mock: true, message: "E-mail mockado localmente com sucesso." });
      } catch (error) {
        console.error("Erro local disparando email mock", error);
        res.status(500).json({ error: "Erro interno no servidor de teste" });
      }
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
    app.use(express.static(distPath, {
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
