import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const templatePath = path.resolve(projectRoot, 'scripts/og-preview/index.html');
const assetsDir = path.resolve(projectRoot, 'public/assets');
const publicDir = path.resolve(projectRoot, 'public');
const distAssetsDir = path.resolve(projectRoot, 'dist/assets');
const distDir = path.resolve(projectRoot, 'dist');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const targetFile = path.resolve(assetsDir, 'og-preview.png');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

execFileSync(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--allow-file-access-from-files',
  '--window-size=1200,630',
  '--force-device-scale-factor=2',
  '--virtual-time-budget=3000',
  `--screenshot=${targetFile}`,
  `file://${templatePath}`
], { stdio: 'inherit' });

fs.copyFileSync(targetFile, path.resolve(publicDir, 'og-preview.png'));

if (fs.existsSync(distAssetsDir)) {
  fs.copyFileSync(targetFile, path.resolve(distAssetsDir, 'og-preview.png'));
}
if (fs.existsSync(distDir)) {
  fs.copyFileSync(targetFile, path.resolve(distDir, 'og-preview.png'));
}

console.log(`Saved rich link preview to ${targetFile} and ${path.resolve(publicDir, 'og-preview.png')}`);
