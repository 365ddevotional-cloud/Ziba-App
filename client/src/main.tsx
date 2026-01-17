import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// One-time dev-only log to confirm clean mount
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  console.log("[Ziba] Frontend mounted fresh - cache cleared");
}

createRoot(document.getElementById("root")!).render(<App />);
