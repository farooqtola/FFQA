KAPLAN REPORT — admin tab (like Quiz Report) for the Kaplan Mix Bank videos
===========================================================================
Three pastes into Index.html, one into Code.gs.

CODE.GS
  1. Paste all of 1-Code.gs-ADD.js anywhere at top level (e.g. after adminSetExamTotal).
  2. Change PORTAL_VERSION, e.g. '2026-10-09-K1'.

INDEX.HTML  (inside the <script>)
  3. Paste all of 2-Index.html-ADD.js just before the line
        /* ================= REPORT CARD ================= */
  4. In buildNav(), in the admin menu, add the Kaplan Report button after Quiz Sync:
        ['a-qsync','🔄','Quiz Sync']
     becomes
        ['a-qsync','🔄','Quiz Sync'],['a-kap','🎥','Kaplan Report']
  5. In go(), add to the V = {...} map:
        'a-kap':vAKap,
  6. Change CLIENT_VERSION to the same value as PORTAL_VERSION.

Then: Deploy > Manage deployments > Edit > Version: New version > Deploy.
Admin > Kaplan Report appears under OVERVIEW.

What it shows
  - All videos: completion %, average, finished-all, not started, watch time;
    per-video table (tap a row to open that video); ranked student progress with
    search, a Report card button and a WhatsApp Remind list for students who have not started.
  - One video: watched / in progress / not started counts, every student's %, status,
    minutes, stopped-at time and last watched; Previous / Next video buttons; Remind list.
  - Access filter (TSA Live / Full), Refresh (re-reads your kaplan page), HTML download.
  - Blocked students, and TSA students who cannot open Kaplan, are left out of the counts.
