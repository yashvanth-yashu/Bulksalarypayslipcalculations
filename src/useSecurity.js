import { useEffect } from "react";

export default function useSecurity() {
  useEffect(() => {
    // ── 1. Block Right-Click ──────────────────────────────────────
    const blockRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockRightClick);

    // ── 2. Block Keyboard Shortcuts ───────────────────────────────
    const blockKeys = (e) => {
      const key = e.key?.toLowerCase();

      // F12
      if (e.keyCode === 123) { e.preventDefault(); return false; }

      // Ctrl/Cmd + Shift + I  (Inspector)
      // Ctrl/Cmd + Shift + J  (Console)
      // Ctrl/Cmd + Shift + C  (Element picker)
      // Ctrl/Cmd + Shift + K  (Firefox console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i","j","c","k"].includes(key)) {
        e.preventDefault(); return false;
      }

      // Ctrl/Cmd + U  (View Source)
      if ((e.ctrlKey || e.metaKey) && key === "u") {
        e.preventDefault(); return false;
      }

      // Ctrl/Cmd + S  (Save page)
      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault(); return false;
      }

      // Ctrl/Cmd + P  (Print — can expose source)
      if ((e.ctrlKey || e.metaKey) && key === "p") {
        e.preventDefault(); return false;
      }
    };
    document.addEventListener("keydown", blockKeys);

    // ── 3. Detect DevTools open (size-based) ──────────────────────
    const devToolsCheck = () => {
      const threshold = 160;
      const widthDiff  = window.outerWidth  - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        document.body.innerHTML =
          `<div style="display:flex;align-items:center;justify-content:center;
            height:100vh;background:#0d1117;color:#e6edf3;
            font-family:sans-serif;font-size:18px;flex-direction:column;gap:12px;">
            <span style="font-size:48px">🔒</span>
            <strong>Access Denied</strong>
            <span style="font-size:14px;color:#8b949e">Developer tools are not permitted on this page.</span>
          </div>`;
      }
    };
    const devToolsInterval = setInterval(devToolsCheck, 1000);

    // ── 4. Debugger trap (slows down devtools console) ────────────
    const debuggerTrap = setInterval(() => {
      // eslint-disable-next-line no-debugger
      (function () { return false; }["constructor"]("debugger")());
    }, 3000);

    // ── 5. Disable text selection ─────────────────────────────────
    document.body.style.userSelect    = "none";
    document.body.style.webkitUserSelect = "none";

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      document.removeEventListener("contextmenu", blockRightClick);
      document.removeEventListener("keydown", blockKeys);
      clearInterval(devToolsInterval);
      clearInterval(debuggerTrap);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, []);
}