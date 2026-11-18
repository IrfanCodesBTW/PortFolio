import "@fontsource-variable/archivo/standard.css";
import "@fontsource-variable/schibsted-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "lenis/dist/lenis.css";
import "./styles/index.css";

import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root element missing");
}

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

createRoot(container).render(<App />);
