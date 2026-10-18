# Google sign-in and private progress sync

Project: `playdanki-ad7f6`. The owner approved Firebase terms and Frankfurt
(`europe-west3`) storage. The project uses Spark with no billing account.
Google Authentication is enabled for playdanki.com and www.playdanki.com.
Firestore was created in production mode and the owner-only rules were published.
Do not link billing, enable Analytics, or enable paid products during maintenance.

1. Create the PlayDanki project and register a web app.
2. Enable Authentication with Google as the only provider.
3. Authorize playdanki.com and www.playdanki.com for sign-in.
4. Create a Firestore Standard database in a suitable EU location, with
   production rules. Deploy firestore.rules before any client writes.
5. Add the public Firebase web configuration to the app. Never add an admin
   key or service account credential to this public repository.
6. Implement a small bottom-left account control alongside Support, lazy-load
   Firebase, and keep guest practice and existing local progress working.
7. Sync all language decks, Economics, Trivia, Programming, QUANT and Arithmetic.
   Account changes must not copy the previous person's progress into the next
   account. Save locally immediately and batch cloud saves; report pending,
   failed and successful saves truthfully.
8. Verify signed-in restore, reconnect, concurrent-device conflicts, sign-out,
   account switching, and unauthorized database access before deployment.

The unsigned-in REST read check returned 403 PERMISSION_DENIED. Local automated
checks cover import, save, failed saves, conflict choices and account separation.
Use a real Google account through the site UI to verify end-to-end sign-in and
restore after deployment. Never use an admin credential to simulate that test.
