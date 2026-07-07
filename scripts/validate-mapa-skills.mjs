#!/usr/bin/env node
/**
 * Validação do mapa de skills + amostras academia-fit.
 * Uso: node scripts/validate-mapa-skills.mjs [--playwright]
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRATCH = process.env.MAP_SCRATCH || '/var/folders/6c/d7ws84896057zvsl4kdbznnh0000gn/T/grok-goal-69c8d840b7c7/implementer';
mkdirSync(SCRATCH, { recursive: true });
const PROJ = join(ROOT, 'projetos/academia-fit');
const SAMPLES = join(ROOT, 'mapa-skills-samples/academia-fit');

const KEY_FILES = [
  'avatar.md', 'relatorio-avatar.md', 'offerbook.md', 'DESIGN.md', 'funil.md', 'copy.md',
  'quiz.md', 'recuperacao.md', 'back-end.md'
];

let failed = 0;
const log = (ok, msg) => {
  console.log(`${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) failed++;
};

function listDir(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) listDir(p, acc);
    else acc.push(p.replace(ROOT + '/', ''));
  }
  return acc;
}

// 1. Projeto núcleo
log(existsSync(PROJ), `projetos/academia-fit existe`);
for (const f of KEY_FILES) {
  log(existsSync(join(PROJ, f)), `projetos/academia-fit/${f}`);
}

// 2. Amostras espelhadas
for (const f of KEY_FILES) {
  log(existsSync(join(SAMPLES, f)), `amostra ${f}`);
}
const pdfs = ['relatorio-avatar.pdf', 'espiao/dossie-fitflow.pdf', 'funil.pdf', 'recuperacao.pdf'];
for (const f of pdfs) {
  log(existsSync(join(SAMPLES, f)), `amostra PDF ${f}`);
}

// 3. Todos os arquivos em amostras são legíveis
const sampleFiles = listDir(SAMPLES);
log(sampleFiles.length >= 30, `amostras: ${sampleFiles.length} arquivos`);

// 4. sync script existe
log(existsSync(join(ROOT, 'sync-mapa-samples.sh')), 'sync-mapa-samples.sh');

writeFileSync(join(SCRATCH, 'projeto-listing.txt'), listDir(PROJ).join('\n'));
writeFileSync(join(SCRATCH, 'samples-listing.txt'), listDir(SAMPLES).join('\n'));

const port = Number(process.env.MAP_PORT || 8765);

// HTTP + curl PDF (servidor em 127.0.0.1:8765)
try {
  const pdfUrl = `http://127.0.0.1:${port}/mapa-skills-samples/academia-fit/relatorio-avatar.pdf`;
  const r = await fetch(pdfUrl);
  log(r.ok && (r.headers.get('content-type') || '').includes('pdf'), `HTTP PDF ${pdfUrl} (${r.status})`);
  const mapR = await fetch(`http://127.0.0.1:${port}/mapa-skills.html`);
  log(mapR.ok, `HTTP mapa-skills.html (${mapR.status})`);
  writeFileSync(join(SCRATCH, 'console-check.txt'), `mapa: ${mapR.status}\npdf: ${r.status} ${r.headers.get('content-type')}\n`);
} catch (e) {
  log(false, `HTTP check: ${e.message}`);
  writeFileSync(join(SCRATCH, 'launch-fallback.txt'), `HTTP server required on port ${port}: ${e.message}\n`);
}

// 5. sampleUrl do núcleo N12 apontam para arquivos reais
const N12_SAMPLE_PATHS = [
  'SETUP.md', 'avatar.md', 'relatorio-avatar.pdf', 'espiao/dossie-fitflow.pdf',
  'trends-2026-07.md', 'swipe/briefing-swipe-file.md', 'offerbook.html', 'DESIGN.md',
  'funil.pdf', 'copy.md', 'pagina/quiz.html', 'emails/venda.html', 'recuperacao.pdf', 'back-end.md'
];
for (const rel of N12_SAMPLE_PATHS) {
  log(existsSync(join(SAMPLES, rel)), `sampleUrl N12 ${rel}`);
}

if (process.argv.includes('--playwright')) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${port}/mapa-skills.html`, { waitUntil: 'networkidle' });
    await page.click('.flow-node[data-id="avatar-funil"]');
    await page.waitForTimeout(500);
    await page.click('button:has-text("relatorio-avatar.pdf")');
    await page.waitForTimeout(800);
    const src = await page.locator('#am-preview-pdf').getAttribute('src');
    log(!!src && src.includes('mapa-skills-samples'), `PDF iframe src: ${src}`);
    log(errors.length === 0, `console sem erros (${errors.length})`);
    await page.screenshot({ path: join(SCRATCH, 'pdf-preview.png') });
    await browser.close();
  } catch (e) {
    const skip = /Cannot find package 'playwright'/.test(e.message);
    if (skip) {
      console.log('⚠ Playwright indisponível — pulando teste de UI (use fallback HTTP acima)');
      writeFileSync(join(SCRATCH, 'playwright-output.txt'), `skipped: ${e.message}\n`);
    } else {
      log(false, `Playwright: ${e.message}`);
    }
  }
}

console.log(failed ? `\nFALHOU: ${failed} checks` : '\nOK: todos os checks passaram');
process.exit(failed ? 1 : 0);