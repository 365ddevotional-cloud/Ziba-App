import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createServer as createNetServer } from "net";
import { seedDevAdmin, verifyDevAdminLogin } from "./bootstrap";
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

// CORS configuration for local development
// In production, CORS is handled by the proxy/reverse proxy
if (process.env.NODE_ENV === "development" && !process.env.REPL_ID) {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow requests from Vite dev server
    if (origin === "http://127.0.0.1:5173" || origin === "http://localhost:5173") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}

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
  // Log NODE_ENV at startup
  const nodeEnv = process.env.NODE_ENV || "development";
  console.log(`[SERVER] Starting in NODE_ENV=${nodeEnv}`);
  
  try {
    // STEP 3: Seed dev admin (runs AFTER Prisma connects, BEFORE app.listen)
    await seedDevAdmin();
    
    // STEP 6: Verify admin login after seeding
    if (nodeEnv === "development") {
      await verifyDevAdminLogin();
    }
    
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
    // In local dev, lock to 127.0.0.1:5000 (no auto-fallback for consistency)
    const preferred = parseInt(process.env.PORT || "5000", 10);
    const isProduction = process.env.NODE_ENV === "production";
    
    // In local dev, use exact port 5000 (fail if unavailable for clarity)
    // In production, auto-fallback if needed
    const port = isProduction ? (await getAvailablePort(preferred)) : preferred;
    
    // Determine host binding: use 127.0.0.1 in local dev for consistency, 0.0.0.0 in production
    const isLocalDev = !isProduction && !process.env.REPL_ID;
    const host = isLocalDev ? "127.0.0.1" : "0.0.0.0";
    
    // STEP 1: Check port conflicts BEFORE listening (DEV ONLY)
    if (isLocalDev) {
      const portInUse = await new Promise<boolean>((resolve) => {
        const testServer = createNetServer();
        testServer.once("error", (err: NodeJS.ErrnoException) => {
          resolve(err.code === "EADDRINUSE");
        });
        testServer.once("listening", () => {
          testServer.close();
          resolve(false);
        });
        testServer.listen(port, host);
      });
      
      if (portInUse) {
        console.error(`\n❌ PORT CONFLICT: Port ${port} is already in use!`);
        console.error(`   Backend requires port ${port} in DEV mode.`);
        console.error(`   On Windows: netstat -ano | findstr :${port}`);
        console.error(`   Then kill the process: taskkill /F /PID <PID>\n`);
        process.exit(1);
      }
      
      // Log DEV MODE confirmation
      console.log("[DEV MODE CONFIRMED]");
      console.log(`Backend: http://${host}:${port}`);
      console.log(`Frontend: http://127.0.0.1:5173`);
    }
    
    // reusePort is not supported on Windows, so only enable it on non-Windows platforms
    const listenOptions: any = {
      port,
      host,
    };
    const isWindows = process.platform === "win32";
    if (!isWindows) {
      listenOptions.reusePort = true;
    }
    
    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ ERROR: Port ${port} is already in use!`);
        console.error(`   Please stop the process using port ${port} and try again.`);
        console.error(`   On Windows: netstat -ano | findstr :${port}`);
        console.error(`   Then kill the process: taskkill /F /PID <PID>\n`);
        process.exit(1);
      } else {
        console.error(`\n❌ ERROR: Failed to start server on ${host}:${port}`);
        console.error(`   ${err.message}\n`);
        process.exit(1);
      }
    });
    
    httpServer.listen(
      listenOptions,
      () => {
        const url = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
        log(`Backend API running at ${url}/api/health`);
        if (isLocalDev) {
          log(`Local dev mode: Backend locked to ${host}:${port}`);
          log(`Frontend will be available at http://127.0.0.1:5173`);
        }
      },
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
