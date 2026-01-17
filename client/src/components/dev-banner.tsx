/**
 * DEV BANNER
 * Non-intrusive banner shown only in local development
 */
export function DevBanner() {
  // Only show in local dev (not in Replit or production)
  const isLocalDev = import.meta.env.DEV && !import.meta.env.VITE_REPL_ID;
  
  if (!isLocalDev) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white text-xs text-center py-1 z-50 border-b border-blue-700">
      <span className="font-medium">Ziba running in LOCAL DEV</span>
      <span className="mx-2">•</span>
      <span>Backend: http://127.0.0.1:5000</span>
      <span className="mx-2">•</span>
      <span>Frontend: http://127.0.0.1:5173</span>
    </div>
  );
}
