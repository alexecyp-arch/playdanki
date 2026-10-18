# Temponote on PlayDanki

Copied from the owner's Temponote app. Original layout, photograph, timers, ordering and controls are retained. The original application and notes are untouched; no existing notes were imported.

The new DANKI link returns to the main page. Google sign-in uses the same PlayDanki Firebase project. Each user's notes live in `users/{uid}/temponotes`; Firestore rules restrict access to that user. No note content is shipped in the static files or stored in the game-progress cache.

Notes disappear at expiry. As in the original app, expired database records are removed on the next note sync, rather than by a paid background service. This is ordinary account privacy, not end-to-end encryption. Project administrators retain database access.

The page runs with plain browser code in ui.js, without React or Tailwind. The original TSX remains as a layout reference. The original photograph is retained in source; the published 1920-pixel WebP is 91% smaller. Normal site builds require no extra dependencies. Firebase Authentication and Firestore handle Google login and private note sync.
