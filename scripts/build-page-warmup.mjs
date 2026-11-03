import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

export async function buildPageWarmup(root, runtimeVersion, atlasVersion) {
  const dist = new URL('dist/', root);
  const pages = (await fs.readdir(dist, {recursive: true}))
    .map(path => path.replaceAll('\\', '/'))
    .filter(path => path.endsWith('.html'))
    .sort();
  const assets = new Set();
  const documents = new Map();
  for (const page of pages) {
    const file = new URL(page, dist);
    const html = await fs.readFile(file, 'utf8');
    documents.set(file, html);
    const route = '/' + page.replace(/(^|\/)index\.html$/, '$1');
    assets.add(route);
    const release = route.startsWith('/data-atlas/') ? atlasVersion
      : /^\/(temponotes|timebox|weight-tracker)\//.test(route) ? runtimeVersion : null;
    if (release) assets.add(route + '?v=' + release);

    const pageUrl = new URL('/' + page, 'https://playdanki.com');
    for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"|<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/gi)) {
      const url = new URL(match[1] || match[2], pageUrl);
      if (url.origin === pageUrl.origin) assets.add(url.pathname + url.search);
    }
  }

  const template = await fs.readFile(new URL('src/page-warmup.js', root), 'utf8');
  const manifest = JSON.stringify([...assets]);
  const version = createHash('sha256').update(template + manifest).digest('hex').slice(0, 12);
  await fs.writeFile(new URL('page-warmup.js', dist), template.replace('WARMUP_ASSETS', () => manifest).replace('WARMUP_VERSION', version));
  for (const [file, html] of documents) {
    await fs.writeFile(file, html.replace('</body>', '<script defer src="/page-warmup.js?v=' + version + '"></script></body>'));
  }
}
