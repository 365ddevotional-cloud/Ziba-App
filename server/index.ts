import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createServer as createNetServer } from "net";
import { bootstrapFounderAdmin } from "./bootstrap";
import { ensurePlatformWallet } from "./wallet-service";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Use MemoryStore for SQLite (local dev), PgSession for PostgreSQL (production)
// SQLite-compatible session store for local development
// Environment variables read at runtime (not build time)
function getSessionStore() {
  const databaseUrl = process.env.DATABASE_URL;
  const isSQLite = databaseUrl?.startsWith("file:");
  
  return isSQLite
    ? new (MemoryStore(session))({
        checkPeriod: 86400000, // prune expired entries every 24h
      })
    : new (connectPgSimple(session))({
        conString: databaseUrl,
        createTableIfMissing: true,
      });
}

const sessionStore = getSessionStore();

// Session configuration - all values read at runtime
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Get an available port by trying the preferred port and incrementing if needed
 * @param preferredPort - The preferred port to try first
 * @param maxAttempts - Maximum number of ports to try (default: 50)
 * @returns Promise resolving to an available port number
 */
async function getAvailablePort(preferredPort: number, maxAttempts: number = 50): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = preferredPort + i;
    const isAvailable = await new Promise<boolean>((resolve) => {
      const server = createNetServer();
      
      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(false);
        }
      });
      
      server.once("listening", () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port, "127.0.0.1");
    });
    
    if (isAvailable) {
      return port;
    }
  }
  
  throw new Error(`No available port found in range ${preferredPort}-${preferredPort + maxAttempts - 1}`);
}

// Middleware to prevent caching on API responses and add request-time logging
app.use((req, res, next) => {
  // Set no-cache headers for all API responses to prevent caching
  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Minimal logging in production - only log errors
      if (process.env.NODE_ENV === "production") {
        if (res.statusCode >= 400) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          log(logLine);
        }
      } else {
        // Development: log all API requests
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    }
  });

  next();
});

// Server initialization - all code executes at runtime (not build time)
// Environment variables, database connections, and routes are initialized per request
(async () => {
  try {
    await bootstrapFounderAdmin();
    await ensurePlatformWallet();
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log errors in production, but don't throw to prevent server crash
      if (process.env.NODE_ENV === "production") {
        console.error(`[ERROR] ${status} ${message}`);
      } else {
        console.error(err);
      }

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else if (process.env.REPL_ID !== undefined) {
      // Replit: Use Vite middleware mode (integrated into Express)
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    } else {
      // Local dev: Vite runs as standalone server, backend only serves API
      // No Vite middleware setup needed
      log("Local dev mode: Vite running as standalone server");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    // Auto-fallback to next available port if preferred port is in use (dev only)
    const preferred = parseInt(process.env.PORT || "5000", 10);
    const isProduction = process.env.NODE_ENV === "production";
    
    // In production, use the exact PORT env var (no auto-fallback)
    // In development, auto-fallback to next available port if needed
    const port = isProduction ? preferred : await getAvailablePort(preferred);
    
    // Determine host binding: use 127.0.0.1 on Windows in development, 0.0.0.0 otherwise
    const isWindows = process.platform === "win32";
    const isLocalDev = !isProduction;
    const host = (isWindows && isLocalDev) ? "127.0.0.1" : "0.0.0.0";
    
    // reusePort is not supported on Windows, so only enable it on non-Windows platforms
    const listenOptions: any = {
      port,
      host,
    };
    if (!isWindows) {
      listenOptions.reusePort = true;
    }
    
    httpServer.listen(
      listenOptions,
      () => {
        const url = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
        log(`Backend API running at ${url}/api/health`);
        if (!isProduction && port !== preferred) {
          log(`Port ${preferred} was in use, using port ${port} instead`);
        }
        if (!isProduction && !process.env.REPL_ID) {
          log(`UI will be available at http://127.0.0.1:5173 (or next available port)`);
        }
      },
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
