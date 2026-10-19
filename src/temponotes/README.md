# Temponote on PlayDanki

Copied from the owner's Temponote app. Original layout, photograph, timers, ordering and controls are retained. The original application and notes are untouched; no existing notes were imported.

The new DANKI link returns to the main page. Google sign-in uses the same PlayDanki Firebase project. Each user's notes live in `users/{uid}/temponotes`; Firestore rules restrict access to that user. No note content is shipped in the static files or stored in the game-progress cache.

Notes disappear at expiry. As in the original app, expired database records are removed on the next note sync, rather than by a paid background service. This is ordinary account privacy, not end-to-end encryption. Project administrators retain database access.

The page runs with plain browser code in ui.js, without React or Tailwind. The original TSX remains as a layout reference. Normal site builds require no extra dependencies. Firebase Authentication and Firestore handle Google login and private note sync.

The 34 supplied backgrounds rotate in order at the visitor's local midnight, then repeat. Only today's image is preloaded and displayed; other days are never prefetched. Screens up to 800 pixels wide use the smaller mobile image. Both the sign-in view and notes share the same image URL. The selection script is inline so the browser can start that one request before authentication loads. There is no slideshow, animation or image polling. prepare-backgrounds.py creates the committed optimized assets; normal builds do not need the original files or Pillow.

ETERNAL NOTES stores private recurring templates in users/{uid}/eternalNotes. Choose one or more weekdays. Matching notes appear in the regular list for that local calendar day, ending at the next local midnight (including clock changes). The one-second display clock derives occurrences without daily database writes or a background server. Today's delete button dismisses that occurrence; Edit and delete in the dropup manage the permanent template. Scheduled occurrences have no time-extension buttons so they retain their midnight deadline. The templates sync across the user's signed-in devices; recurrence follows the local calendar on each device.
