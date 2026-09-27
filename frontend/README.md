# VyaparSathi Frontend Documentation & Audit Report

This directory contains the user interface and client-side logic for the **VyaparSathi (व्यापारसाथी)** rural entrepreneurship advisory platform.

For the complete technical architecture and full audit report, refer to the root [README.md](file:///c:/Users/Lenovo/OneDrive/final%20(2)/final/README.md).

---

## Quick Start

```powershell
# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev

# Build production bundle
npm run build
```

The application runs on `http://localhost:5173/`.

---

## Key Highlights & Resolved Issues

1. **Vite Cache Fix**: `cacheDir` in [vite.config.js](file:///c:/Users/Lenovo/OneDrive/final%20(2)/final/frontend/vite.config.js) uses `os.tmpdir()` to prevent OneDrive file-locking `EPERM` errors.
2. **AI Proxy Separation**: The proxy pattern was refined to `^/ai/` so client routing to `/ai-assistant` never triggers a 502 Bad Gateway.
3. **Backend Integration**: Map points now cleanly load from `/api/nearby`.
4. **Business Decision Sathi**: Multi-agent business decision maker integrated with 6 specialist advisors, compact business snapshot, clear recommendation panel, and 5 sequential actions.
5. **Audit Status**: **12/12 routes tested with 0 JS exceptions, 0 console errors, and 0 network 4xx/5xx failures.**
