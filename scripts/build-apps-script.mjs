import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
const sourceHtmlPath = path.join(dist, 'index.html');
const outputPath = path.join(root, 'apps-script', 'Index.html');

if (!fs.existsSync(sourceHtmlPath)) {
  throw new Error('dist/index.html not found. Run vite build first.');
}

const html = fs.readFileSync(sourceHtmlPath, 'utf8');
const scriptMatch = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/i);
const cssMatch = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/i);

if (!scriptMatch) throw new Error('Could not find the Vite JavaScript bundle in dist/index.html.');
if (!cssMatch) throw new Error('Could not find the Vite CSS bundle in dist/index.html.');

const jsPath = path.join(dist, scriptMatch[1].replace(/^\//, ''));
const cssPath = path.join(dist, cssMatch[1].replace(/^\//, ''));

if (!fs.existsSync(jsPath)) throw new Error(`JavaScript bundle not found: ${jsPath}`);
if (!fs.existsSync(cssPath)) throw new Error(`CSS bundle not found: ${cssPath}`);

const js = fs.readFileSync(jsPath, 'utf8').replace(/<\/script/gi, '<\\/script');
const css = fs.readFileSync(cssPath, 'utf8');

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const title = titleMatch ? titleMatch[1] : 'Onboarding CRM';

const output = `<!doctype html>
<html lang="en">
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
${css}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
${js}
  </script>
</body>
</html>
`;

fs.writeFileSync(outputPath, output, 'utf8');

console.log(`Apps Script HTML generated: ${outputPath}`);
console.log(`JavaScript inlined: ${(js.length / 1024).toFixed(1)} KB`);
console.log(`CSS inlined: ${(css.length / 1024).toFixed(1)} KB`);
