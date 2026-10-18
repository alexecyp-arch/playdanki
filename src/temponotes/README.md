# Temponote on PlayDanki

Copied from the owner's Temponote app. Original layout, photograph, timers, ordering and controls are retained. The original application and notes are untouched; no existing notes were imported.

The new DANKI link returns to the main page. Google sign-in uses the same PlayDanki Firebase project. Each user's notes live in `users/{uid}/temponotes`; Firestore rules restrict access to that user. No note content is shipped in the static files or stored in the game-progress cache.

Notes disappear at expiry. As in the original app, expired database records are removed on the next note sync, rather than by a paid background service. This is ordinary account privacy, not end-to-end encryption. Project administrators retain database access.

React and React DOM are bundled into ui.bundle.js; their licenses accompany it. The repository contains the original TSX source. To rebuild the UI bundle, install React 19, React DOM 19 and esbuild in a development folder, set NODE_PATH to its node_modules, then run `node scripts/bundle-temponotes.cjs`. Normal site builds copy the committed bundle and require no extra dependencies.
