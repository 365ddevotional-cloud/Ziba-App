#!/usr/bin/env tsx
/**
 * DEV SELF-CHECK
 * Verifies backend and frontend are running correctly in local dev
 */

async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/health", {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.status === 200) {
      const data = await response.json();
      console.log("✓ Backend is running on http://127.0.0.1:5000");
      console.log(`  Status: ${data.status}, Database: ${data.database?.provider || "Unknown"}`);
      return true;
    } else {
      console.error(`✗ Backend returned status ${response.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("✗ Backend check timed out - is the server running?");
    } else if (error.code === "ECONNREFUSED") {
      console.error("✗ Backend connection refused - server not running on port 5000");
    } else {
      console.error(`✗ Backend check failed: ${error.message}`);
    }
    return false;
  }
}

async function checkFrontend(): Promise<boolean> {
  try {
    const response = await fetch("http://127.0.0.1:5173", {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    
    if (response.status === 200) {
      const text = await response.text();
      // Check if it's actually serving HTML (not an error page)
      if (text.includes("<html") || text.includes("<!DOCTYPE")) {
        console.log("✓ Frontend is running on http://127.0.0.1:5173");
        return true;
      } else {
        console.error("✗ Frontend returned unexpected content");
        return false;
      }
    } else {
      console.error(`✗ Frontend returned status ${response.status}`);
      return false;
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("✗ Frontend check timed out - is the server running?");
    } else if (error.code === "ECONNREFUSED") {
      console.error("✗ Frontend connection refused - server not running on port 5173");
    } else {
      console.error(`✗ Frontend check failed: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log("\n🔍 Ziba Local Dev Self-Check\n");
  
  const backendOk = await checkBackend();
  const frontendOk = await checkFrontend();
  
  console.log("");
  if (backendOk && frontendOk) {
    console.log("✅ All checks passed! Ziba is running correctly.");
    console.log("\n📋 URLs:");
    console.log("  Frontend: http://127.0.0.1:5173");
    console.log("  Backend:  http://127.0.0.1:5000/api/health");
    console.log("  Login:    http://127.0.0.1:5173/login");
    console.log("  Signup:   http://127.0.0.1:5173/signup");
    process.exit(0);
  } else {
    console.error("❌ Some checks failed. Please start the dev servers:");
    console.error("  Run: npm run dev");
    console.error("  Or separately:");
    console.error("    Terminal 1: npm run dev:server");
    console.error("    Terminal 2: npm run dev:client");
    process.exit(1);
  }
}

main();
