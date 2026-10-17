# PlayDanki

Simple language and learning cards. Deep blue, bold white text, instant
question/answer display, Space or Enter to continue, and a phone Next Card
button. Arithmetic requires a correct typed answer.

## Run and build

The website is static. No npm installation, server database or account is
needed. Rebuild with Node.js 22 or newer:

```text
node scripts/build.mjs
```

Serve `dist/` with any static web server. All game progress stays in the
visitor's browser. Optional standalone offline export:

```text
node scripts/export-offline.mjs <output-directory>
```

## GitHub Pages

Upload this folder to a repository named `playdanki`. In repository Settings
→ Pages, choose **GitHub Actions**. The included workflow builds and publishes
`dist/` on pushes to `main`. Relative asset paths support both a repository
URL and a custom domain. No payment information is collected by this site.

## Support button

The bottom-left Support menu is implemented but **disabled by default**.
It offers USD $2, $5, $10 and $100, opening Revolut in a separate tab.
Connect the actual recipient in `src/support-config.json` before enabling it.

- `genericUrl`: a public reusable payment-request link. Visitors must enter
  the chosen amount on Revolut; the site does not claim it is prefilled.
- `amountUrls`: optional genuine amount-specific links created by the
  recipient. The site does not invent undocumented amount URL parameters.
- `enabled`: set to `true` only after checking the recipient, account terms,
  currency, link lifetime and payment behavior.

The build rejects incomplete enabled configurations and payment previews.
Only HTTPS Revolut payment hosts are allowed. Payment details stay on
Revolut; no card form, tracking or payment-success claim is added here.

Personal account terms may prohibit website/business income. Confirm the
appropriate Revolut account type before activating public payments. Changing
the word "donation" does not change the payment provider's account rules.

## Domain

Desired name: `playdanki.com`. No domain is registered or owned by this
repository. Add a custom domain only after purchasing it in your own account.
Do not publish a CNAME file pointing to an unowned domain. Domain registration
and renewal are separate from GitHub hosting.

Progress is stored per website origin: changing from the old address to a
new domain starts a separate browser store. Existing progress remains at
the old address. No personal progress is uploaded to this repository.

## Content rights and attribution

There is no blanket license for all files. Dictionary and sentence datasets
retain their own attribution and share-alike terms. See `dist/credits.txt`,
`dist/licenses/`, and each source manifest in `dist/languages/`,
`dist/french/`, `dist/trivia/`, `dist/programming/` and `dist/quant/`.
Those notices and per-sentence contributor identifiers must stay available
when the site is republished. No additional copyright license for the
original application code is granted by this README.

The source baseline is recorded in `SOURCE-SNAPSHOT.json`. The copy excludes
Site administration metadata, credentials, browser progress and Git history.
