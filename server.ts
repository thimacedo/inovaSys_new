/**
 * @file server.ts
 * @description Servidor Express para o InovaSys com arquitetura modular,
 *   rate limiting seguro contra memory leak, tipagem completa e graceful shutdown.
 */

import express, { NextFunction, Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

// ============================================================
// 1. TYPES & INTERFACES
// ============================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface VercelCredentials {
  apiKey: string;
  projectId: string;
}

interface AppConfig {
  readonly port: number;
  readonly rateLimitMax: number;
  readonly rateLimitWindowMs: number;
  readonly isProduction: boolean;
}

// ============================================================
// 2. CONFIGURATION — centraliza todos os valores configuráveis
// ============================================================

const config: AppConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  rateLimitMax: 200,
  rateLimitWindowMs: 60_000,
  isProduction: process.env.NODE_ENV === "production",
};

// ============================================================
// 3. LOGGER — substitui console.log disperso por logging estruturado
// ============================================================

const logger = {
  info: (msg: string, meta?: Record<string, unknown>): void =>
    console.log(
      JSON.stringify({ level: "info", ts: new Date().toISOString(), msg, ...meta })
    ),
  warn: (msg: string, meta?: Record<string, unknown>): void =>
    console.warn(
      JSON.stringify({ level: "warn", ts: new Date().toISOString(), msg, ...meta })
    ),
  error: (msg: string, err?: unknown): void =>
    console.error(
      JSON.stringify({
        level: "error",
        ts: new Date().toISOString(),
        msg,
        err: err instanceof Error ? err.message : String(err),
      })
    ),
};

// ============================================================
// 4. VALIDATORS — validação centralizada e reutilizável
// ============================================================

/** Aceita apenas IDs alfanuméricos com hífen/underscore (máx. 64 chars). */
const VALID_PROJECT_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

function isValidProjectId(id: string): boolean {
  return VALID_PROJECT_ID_REGEX.test(id);
}

/**
 * Type guard que valida o payload de e-mail.
 * Evita que corpos malformados atinjam a lógica de envio.
 */
function isValidEmailPayload(body: unknown): body is EmailPayload {
  if (typeof body !== "object" || body === null) return false;
  const { to, subject, html } = body as Record<string, unknown>;
  return (
    typeof to === "string" && to.includes("@") && to.length > 0 &&
    typeof subject === "string" && subject.trim().length > 0 &&
    typeof html === "string" && html.trim().length > 0
  );
}

// ============================================================
// 5. RATE LIMITER — corrige o memory leak do Map infinito
// ============================================================

/**
 * Rate limiter baseado em IP com limpeza periódica de entradas obsoletas.
 *
 * O problema anterior era um Map que crescia indefinidamente.
 * Esta implementação usa setInterval com unref() para executar cleanup
 * sem bloquear o event loop nem impedir o encerramento do processo.
 */
class RateLimiter {
  private readonly records = new Map<string, RateLimitRecord>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {
    // Cleanup a cada 5 minutos para liberar memória de IPs inativos
    this.cleanupTimer = setInterval(() => this.evictStaleRecords(), 5 * 60_000);
    // unref() garante que o timer não impeça o graceful shutdown
    this.cleanupTimer.unref();
  }

  /**
   * Verifica se a requisição do IP está dentro do limite.
   * @returns `true` se permitido, `false` se excedeu o limite.
   */
  isAllowed(ip: string): boolean {
    const now = Date.now();
    const record = this.records.get(ip);

    if (!record || now >= record.resetAt) {
      this.records.set(ip, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) return false;

    record.count++;
    return true;
  }

  /** Remove entradas com janela de tempo expirada para liberar memória. */
  private evictStaleRecords(): void {
    const now = Date.now();
    for (const [ip, record] of this.records) {
      if (now >= record.resetAt) this.records.delete(ip);
    }
    logger.info("RateLimiter: cleanup executado.", { remainingIps: this.records.size });
  }

  /** Libera recursos — deve ser chamado no graceful shutdown. */
  destroy(): void {
    clearInterval(this.cleanupTimer);
    this.records.clear();
  }
}

// ============================================================
// 6. MIDDLEWARE — cada responsabilidade em sua própria função
// ============================================================

/**
 * Adiciona cabeçalhos de segurança a todas as respostas.
 * Separado do resto para ser testável de forma isolada.
 */
function applySecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

/**
 * Factory de middleware de rate limiting.
 * Recebe a instância do RateLimiter por injeção (testável sem estado global).
 */
function createRateLimitMiddleware(limiter: RateLimiter) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? "unknown";
    if (!limiter.isAllowed(ip)) {
      res.status(429).json({
        error: "Limite de requisições atingido. Tente novamente em 60 segundos.",
      });
      return;
    }
    next();
  };
}

// ============================================================
// 7. VERCEL SERVICE — isola a lógica de integração externa
// ============================================================

/**
 * Recupera e valida as credenciais Vercel das variáveis de ambiente.
 * @returns Credenciais válidas ou `null` se ausentes/inválidas.
 */
function getVercelCredentials(): VercelCredentials | null {
  const apiKey = process.env.VERCEL_API_KEY;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!apiKey || !projectId) return null;
  if (!isValidProjectId(projectId)) {
    logger.warn("VERCEL_PROJECT_ID contém caracteres inválidos.", { projectId });
    return null;
  }

  return { apiKey, projectId };
}

/**
 * Busca os últimos deployments do projeto na API da Vercel.
 * @param credentials - Credenciais válidas da Vercel.
 * @returns Response bruta da API Vercel.
 */
async function fetchVercelDeployments(credentials: VercelCredentials): Promise<Response> {
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", credentials.projectId);
  url.searchParams.set("limit", "5");

  return fetch(url.toString(), {
    headers: { Authorization: `Bearer ${credentials.apiKey}` },
  });
}

/**
 * Dispara um novo deploy de produção na API da Vercel.
 * @param credentials - Credenciais válidas da Vercel.
 * @returns Response bruta da API Vercel.
 */
async function triggerVercelDeploy(credentials: VercelCredentials): Promise<Response> {
  return fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "inovasys",
      project: credentials.projectId,
      target: "production",
    }),
  });
}

// ============================================================
// 8. ROUTE HANDLERS — um handler por responsabilidade
// ============================================================

function handleHealth(_req: Request, res: Response): void {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

async function handleGetDeployments(_req: Request, res: Response): Promise<void> {
  const credentials = getVercelCredentials();
  if (!credentials) {
    res.status(400).json({ error: "Credenciais da Vercel ausentes ou inválidas." });
    return;
  }

  try {
    const apiResponse = await fetchVercelDeployments(credentials);
    const data: unknown = await apiResponse.json();
    res.status(apiResponse.status).json(data);
  } catch (err) {
    logger.error("Falha ao buscar deployments da Vercel.", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

async function handleTriggerDeploy(_req: Request, res: Response): Promise<void> {
  const credentials = getVercelCredentials();
  if (!credentials) {
    res.status(400).json({ error: "Credenciais da Vercel ausentes ou inválidas." });
    return;
  }

  try {
    const apiResponse = await triggerVercelDeploy(credentials);
    const data: unknown = await apiResponse.json();
    res.status(apiResponse.status).json(data);
  } catch (err) {
    logger.error("Falha ao disparar deploy na Vercel.", err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
}

function handleEmail(req: Request, res: Response): void {
  // Valida o payload antes de qualquer processamento
  if (!isValidEmailPayload(req.body)) {
    res.status(400).json({
      error: "Payload inválido. Os campos 'to', 'subject' e 'html' são obrigatórios.",
    });
    return;
  }

  const { to, subject } = req.body;
  logger.info("[Dev Mock Email] Enviando e-mail.", { to, subject });
  res.json({ mock: true, message: "E-mail mockado localmente com sucesso." });
}

// ============================================================
// 9. ROUTER — agrupa rotas da API com suas dependências
// ============================================================

function buildApiRouter(rateLimiter: RateLimiter): express.Router {
  const router = express.Router();

  // Rate limiting aplicado a TODAS as rotas /api/*
  router.use(createRateLimitMiddleware(rateLimiter));

  router.get("/health", handleHealth);
  router.get("/vercel/deployments", (req, res) => handleGetDeployments(req, res));
  router.post("/vercel/deploy", (req, res) => handleTriggerDeploy(req, res));
  router.post("/vercel/email", handleEmail);

  return router;
}

// ============================================================
// 10. BOOTSTRAP — setup do servidor com graceful shutdown
// ============================================================

/**
 * Inicializa o servidor Express com todas as dependências.
 * Inclui graceful shutdown para encerrar conexões pendentes corretamente.
 */
async function startServer(): Promise<void> {
  const app = express();
  const rateLimiter = new RateLimiter(config.rateLimitMax, config.rateLimitWindowMs);

  // Middlewares globais
  app.use(applySecurityHeaders);
  app.use(express.json({ limit: "10mb" }));

  // Rotas da API
  app.use("/api", buildApiRouter(rateLimiter));

  // Modo desenvolvimento: usa o middleware do Vite para HMR
  if (!config.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Modo produção: serve o build estático
    const distPath = path.join(process.cwd(), "dist");
    app.use(
      express.static(distPath, {
        setHeaders: (res) => res.setHeader("Cache-Control", "public, max-age=3600"),
      })
    );
    // SPA fallback: todas as rotas não encontradas retornam o index.html
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const server = app.listen(config.port, "0.0.0.0", () => {
    logger.info(`Servidor iniciado.`, { port: config.port, env: process.env.NODE_ENV });
  });

  // Graceful Shutdown: aguarda conexões ativas encerrarem antes de sair
  const shutdown = (signal: string): void => {
    logger.info(`Sinal ${signal} recebido. Encerrando servidor...`);
    rateLimiter.destroy();
    server.close(() => {
      logger.info("Servidor encerrado com sucesso.");
      process.exit(0);
    });
    // Timeout de segurança: força saída após 10s caso conexões travem
    setTimeout(() => {
      logger.error("Timeout no shutdown forçado.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((err) => {
  logger.error("Erro fatal ao inicializar o servidor.", err);
  process.exit(1);
});
