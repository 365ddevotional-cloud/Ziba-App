# Ziba Local Development

## Quick Start

**One command to start everything:**
```bash
npm run dev
```

This will:
1. Start the backend server on `http://127.0.0.1:5000`
2. Wait for the backend to be ready
3. Start the frontend dev server on `http://127.0.0.1:5173`

## URLs

- **Frontend:** http://127.0.0.1:5173
- **Login:** http://127.0.0.1:5173/login
- **Signup:** http://127.0.0.1:5173/signup
- **Backend Health:** http://127.0.0.1:5000/api/health

## What Success Looks Like

✅ **Backend:** Terminal shows "Backend API running at http://127.0.0.1:5000/api/health"

✅ **Frontend:** Terminal shows "Local: http://127.0.0.1:5173/"

✅ **Browser:** 
- Blue banner at top says "Ziba running in LOCAL DEV"
- Pages load without errors
- `/login` and `/signup` are accessible

✅ **Dev Check:** Run `npm run dev:check` to verify both servers are running

## Troubleshooting

### Port 5000 already in use
```
Error: Port 5000 is already in use!
```
**Solution:** Stop the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Then restart: npm run dev
```

### Port 5173 already in use
**Solution:** The frontend uses `strictPort: true`, so it will fail if port 5173 is in use. Stop the process:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /F /PID <PID>
```

### Backend won't start
- Check if PostgreSQL is running (if using PostgreSQL)
- Check `DATABASE_URL` in `.env`
- Run `npx prisma generate` and `npx prisma db push`

### Frontend won't start
- Ensure backend is running first (it waits for `/api/health`)
- Check that port 5173 is available

### Routes not working
- Ensure you're using `http://127.0.0.1:5173` (not `localhost`)
- Check browser console for errors
- Verify the dev banner is visible (confirms frontend loaded)

## Manual Start (Alternative)

If `npm run dev` doesn't work, start servers separately:

**Terminal 1:**
```bash
npm run dev:server
```

**Terminal 2:**
```bash
npm run dev:client
```

## Verification

Run the self-check script to verify everything is working:
```bash
npm run dev:check
```

This will confirm:
- Backend is responding on port 5000
- Frontend is responding on port 5173
- Both are healthy

## Important Notes

- Ports are **locked** to `127.0.0.1:5000` (backend) and `127.0.0.1:5173` (frontend)
- No auto-port switching in dev (for consistency)
- `/login` and `/signup` routes are **not guarded** (accessible without auth)
- The blue dev banner confirms frontend is running
