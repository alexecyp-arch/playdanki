import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';

export async function buildPageWarmup(root) {
  const dist = new URL('dist/', root);
  // Fetch only the public HTML for the frequently used routes. Private
  // data and its dependencies are warmed by the signed-in navigation.
  const routes = ['/', '/temponotes/', '/weight-tracker/', '/monthly-logs/'];
  const template = await fs.readFile(new URL('src/page-warmup.js', root), 'utf8');
  const manifest = JSON.stringify(routes);
  const version = createHash('sha256').update(template + manifest).digest('hex').slice(0, 12);
  await fs.writeFile(new URL('page-warmup.js', dist), template.replace('WARMUP_ASSETS', () => manifest).replace('WARMUP_VERSION', version));
  for (const route of routes) {
    const file = new URL('.' + route + 'index.html', dist);
    const html = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, html.replace('</body>', '<script defer src="/page-warmup.js?v=' + version + '"></script></body>'));
  }
}
