# CRANKD: RESUME STATE

**Status: Phase 1.5 (Web Platform Pivot) - IMPLEMENTED**

The system is currently fully deployed to the `/web` directory. We have successfully ported the "Digital Soul" concept to a Next.js web application.

## 1. Where We Are
*   **Web App:** Built with Next.js 15 + Tailwind v4.
*   **Features Live:**
    *   **Home/Feed:** `/` (Featured Garage Grid).
    *   **Vehicle Profile:** `/vehicle/[id]` (Immersive Logbook with Maintenance Timeline).
*   **Backend:** Supabase Schema & Edge Functions are ready.

## 2. To Resume Work
When you return, run these commands in your terminal:

```bash
# 1. Navigate to the web project
cd /Users/mac/.gemini/antigravity/scratch/crankd/web

# 2. Clear cache (prevent Next.js glitches) and start server
rm -rf .next && npm run dev
```

## 3. Immediate Next Step
Once the server is running at `http://localhost:3000`:
*   **Verify the UI:** We need to confirm the "Mechanical Luxury" design looks correct in the browser.
*   **Execute Phase 2 (Web Social):** Build the "Garage Profile" (`/garage/me`) on the web.

**System is saved.**
