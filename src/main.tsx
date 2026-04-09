import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        if (registration.active?.scriptURL.includes("dev-sw") || registration.active?.scriptURL.includes("registerSW.js")) {
          registration.unregister();
        }
      });
    });

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => console.log("SW registered:", reg))
      .catch((err) => console.log("SW registration failed:", err));
  });
}

const root = document.getElementById("root")!;

createRoot(root).render(
  <App />
);
