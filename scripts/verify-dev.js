#!/usr/bin/env node
/**
 * DEV VERIFICATION SCRIPT
 * Fully automated verification of DEV admin seed and login
 * 
 * Requirements:
 * - No manual steps
 * - No browser UI
 * - Fail loudly if anything is wrong
 */

import { execSync, spawn } from 'child_process';
import http from 'http';
import net from 'net';

const BACKEND_PORT = 5000;
const FRONTEND_PORT = 5173;
const ADMIN_EMAIL = "founder@ziba.app";
const ADMIN_PASSWORD = "Ziba-admin-2013";

let backendProcess = null;
let frontendProcess = null;

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ERROR: ${message}`, colors.red);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, '127.0.0.1', () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Get PID of process using a port (Windows)
function getProcessUsingPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[1].includes(`${port}`)) {
        return parts[parts.length - 1]; // PID is last column
      }
    }
  } catch (e) {
    // Port might not be in use
  }
  return null;
}

// Wait for server to be ready
function waitForServer(url, maxAttempts = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const urlObj = new URL(url);
      const req = http.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname || '/api/health',
        method: 'GET',
        timeout: 2000,
      }, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          // Server is responding
          resolve(true);
        } else {
          if (attempts >= maxAttempts) {
            reject(new Error(`Server not ready after ${maxAttempts} attempts`));
          } else {
            setTimeout(check, interval);
          }
        }
      });
      
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error(`Server not ready after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, interval);
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          reject(new Error(`Server not ready after ${maxAttempts} attempts`));
        } else {
          setTimeout(check, interval);
        }
      });
      
      req.end();
    };
    
    check();
  });
}

// Make HTTP request
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: body });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body, raw: body });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test admin login
async function testAdminLogin() {
  info(`Testing admin login: ${ADMIN_EMAIL}`);
  
  const options = {
    hostname: '127.0.0.1',
    port: BACKEND_PORT,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000,
  };
  
  const response = await httpRequest(options, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });
  
  if (response.status === 200) {
    success(`Admin login successful (HTTP ${response.status})`);
    if (response.body && response.body.message === "Login successful") {
      success(`Login response: ${response.body.message}`);
      return true;
    } else {
      error(`Unexpected login response: ${JSON.stringify(response.body)}`);
      return false;
    }
  } else {
    error(`Admin login failed: HTTP ${response.status}`);
    if (response.body) {
      error(`Response: ${JSON.stringify(response.body)}`);
    }
    return false;
  }
}

// Capture backend logs to verify seed
let backendLogs = [];
let seedVerified = false;
let loginVerified = false;

function captureBackendLogs(process) {
  process.stdout.on('data', (data) => {
    const output = data.toString();
    backendLogs.push(output);
    process.stdout.write(data); // Also forward to console
    
    // Check for seed confirmation
    if (output.includes('[DEV ADMIN SEEDED]') || output.includes('✅ DEV ADMIN SEEDED')) {
      seedVerified = true;
      success('Admin seed confirmed in logs');
    }
    
    // Check for login verification
    if (output.includes('[DEV ADMIN LOGIN VERIFIED ✅]') || output.includes('DEV ADMIN LOGIN VERIFIED')) {
      loginVerified = true;
      success('Admin login verification confirmed in logs');
    }
  });
  
  process.stderr.on('data', (data) => {
    const output = data.toString();
    backendLogs.push(output);
    process.stderr.write(data); // Forward errors too
  });
}

// Main verification flow
async function main() {
  log('\n' + '='.repeat(60));
  log('DEV SYSTEM VERIFICATION - AUTOMATED');
  log('='.repeat(60) + '\n');
  
  try {
    // STEP 1: Check for port conflicts
    info('Checking for port conflicts...');
    
    const backendPortInUse = await isPortInUse(BACKEND_PORT);
    if (backendPortInUse) {
      const pid = getProcessUsingPort(BACKEND_PORT);
      error(`Port ${BACKEND_PORT} is already in use!`);
      if (pid) {
        error(`PID: ${pid}`);
        error(`Kill process: taskkill /F /PID ${pid}`);
      }
      process.exit(1);
    } else {
      success(`Port ${BACKEND_PORT} is available`);
    }
    
    const frontendPortInUse = await isPortInUse(FRONTEND_PORT);
    if (frontendPortInUse) {
      const pid = getProcessUsingPort(FRONTEND_PORT);
      warn(`Port ${FRONTEND_PORT} is in use (frontend may already be running)`);
      if (pid) {
        info(`PID: ${pid}`);
      }
    } else {
      success(`Port ${FRONTEND_PORT} is available`);
    }
    
    // STEP 2: Start backend
    info('\nStarting backend server...');
    process.env.NODE_ENV = 'development';
    
    backendProcess = spawn('npm', ['run', 'dev:server'], {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'development' },
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    
    captureBackendLogs(backendProcess);
    
    backendProcess.on('error', (err) => {
      error(`Failed to start backend: ${err.message}`);
      process.exit(1);
    });
    
    // Wait for backend to be ready
    info('Waiting for backend to start...');
    try {
      await waitForServer(`http://127.0.0.1:${BACKEND_PORT}/api/health`, 30, 1000);
      success(`Backend is responding on port ${BACKEND_PORT}`);
    } catch (err) {
      error(`Backend failed to start: ${err.message}`);
      if (backendProcess) {
        backendProcess.kill();
      }
      process.exit(1);
    }
    
    // Wait a bit for seed to complete and check logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (!seedVerified) {
      warn('Admin seed log not found - checking manually...');
      // Still proceed, seed might have completed
    }
    
    if (!loginVerified) {
      warn('Admin login verification log not found - will test manually...');
    }
    
    // STEP 4: Test admin login via API
    info('\nTesting admin login via API...');
    const loginSuccess = await testAdminLogin();
    
    if (!loginSuccess) {
      error('Admin login test failed!');
      if (backendProcess) {
        backendProcess.kill();
      }
      process.exit(1);
    }
    
    success('[DEV ADMIN AUTH FLOW VERIFIED ✅]');
    
    // STEP 5: Final result
    log('\n' + '='.repeat(60));
    success('[DEV SYSTEM VERIFIED — SAFE TO USE]');
    log('='.repeat(60));
    log('\nAdmin credentials:');
    log(`  Email: ${ADMIN_EMAIL}`);
    log(`  Password: ${ADMIN_PASSWORD}`);
    log(`\nBackend: http://127.0.0.1:${BACKEND_PORT}`);
    log(`Frontend: http://127.0.0.1:${FRONTEND_PORT}`);
    log('\n⚠️  Backend is still running. Press Ctrl+C to stop.\n');
    
    // Keep process alive
    process.on('SIGINT', () => {
      info('\nShutting down...');
      if (backendProcess) {
        backendProcess.kill();
      }
      if (frontendProcess) {
        frontendProcess.kill();
      }
      process.exit(0);
    });
    
    // Wait forever (or until Ctrl+C)
    await new Promise(() => {});
    
  } catch (err) {
    error(`Verification failed: ${err.message}`);
    log('\n' + '='.repeat(60));
    error('[DEV SYSTEM BROKEN — DO NOT PROCEED]');
    log('='.repeat(60));
    
    if (backendProcess) {
      backendProcess.kill();
    }
    if (frontendProcess) {
      frontendProcess.kill();
    }
    
    process.exit(1);
  }
}

// Run verification
main().catch((err) => {
  error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
