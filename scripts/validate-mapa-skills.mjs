#!/usr/bin/env node
/**
 * Validação do mapa de skills + amostras academia-fit.
 * Uso: node scripts/validate-mapa-skills.mjs [--playwright]
 */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { runInNewContext } from 'vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRATCH = process.env.MAP_SCRATCH || '/var/folders/6c/d7ws84896057zvsl4kdbznnh0000gn/T/grok-goal-69c8d840b7c7/implementer';
mkdirSync(SCRATCH, { recursive: true });
const PROJ = join(ROOT, 'projetos/academia-fit');
const SAMPLES = join(ROOT, 'mapa-skills-samples/academia-fit');
const ARTIFACTS_JS = join(ROOT, 'mapa-skills-artifacts.js');

const KEY_FILES = [
  'avatar.md', 'relatorio-avatar.md', 'offerbook.md', 'DESIGN.md', 'funil.md', 'copy.md',
  'quiz.md', 'recuperacao.md', 'back-end.md'
];

const N12_TOUR = [
  'comecar', 'avatar-funil', 'espiao-do-concorrente', 'trend-hunting', 'swipe-file',
  'offerbook', 'design-md', 'metodo-funil', 'copy-funil',
  'quiz-funil', 'email-funil', 'recuperacao-funil', 'backend-funil'
];

const PDF_CLICK_TESTS = [
  { skill: 'avatar-funil', artifactId: 'avatar-pdf', expectSrc: 'relatorio-avatar.pdf' },
  { skill: 'espiao-do-concorrente', artifactId: 'dossie-pdf', expectSrc: 'dossie-fitflow.pdf' },
  { skill: 'metodo-funil', artifactId: 'funil-pdf', expectSrc: 'funil.pdf' },
  { skill: 'offerbook', artifactId: 'offerbook-pdf', expectSrc: 'offerbook.pdf' },
  { skill: 'recuperacao-funil', artifactId: 'rec-pdf', expectSrc: 'recuperacao.pdf' },
];

let failed = 0;
const lines = [];
const log = (ok, msg) => {
  const line = `${ok ? '✓' : '✗'} ${msg}`;
  console.log(line);
  lines.push(line);
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

function loadArtifacts() {
  const code = readFileSync(ARTIFACTS_JS, 'utf8');
  const sandbox = { window: {} };
  runInNewContext(code, sandbox);
  return sandbox.window.ARTIFACT_SAMPLES || {};
}

function collectSampleUrls(artifacts) {
  const rows = [];
  for (const [skill, arts] of Object.entries(artifacts)) {
    for (const art of arts) {
      if (art.sampleUrl) rows.push({ skill, id: art.id, format: art.format, sampleUrl: art.sampleUrl });
    }
  }
  return rows;
}

// 1. Projeto núcleo
log(existsSync(PROJ), 'projetos/academia-fit existe');
for (const f of KEY_FILES) {
  log(existsSync(join(PROJ, f)), `projetos/academia-fit/${f}`);
}

// 2. Amostras espelhadas
for (const f of KEY_FILES) {
  log(existsSync(join(SAMPLES, f)), `amostra ${f}`);
}

const samplePdfs = listDir(SAMPLES).filter(p => p.endsWith('.pdf'));
log(samplePdfs.length === 14, `amostras: ${samplePdfs.length} PDFs (esperado 14)`);

const sampleFiles = listDir(SAMPLES);
log(sampleFiles.length >= 30, `amostras: ${sampleFiles.length} arquivos`);

log(existsSync(join(ROOT, 'sync-mapa-samples.sh')), 'sync-mapa-samples.sh');
log(existsSync(join(ROOT, 'scripts/bootstrap-academia-fit.sh')), 'scripts/bootstrap-academia-fit.sh');

writeFileSync(join(SCRATCH, 'projeto-listing.txt'), listDir(PROJ).join('\n'));
writeFileSync(join(SCRATCH, 'samples-listing.txt'), sampleFiles.join('\n'));

// 3. sampleUrl em mapa-skills-artifacts.js → arquivos no disco
const artifacts = loadArtifacts();
const sampleUrls = collectSampleUrls(artifacts);
const pdfArtifacts = sampleUrls.filter(r => r.format === 'pdf');
log(pdfArtifacts.length === 14, `artifacts.js: ${pdfArtifacts.length} entradas pdf() com sampleUrl (esperado 14)`);

const n12SampleUrls = sampleUrls.filter(r => N12_TOUR.includes(r.skill));
let missingUrls = 0;
for (const row of n12SampleUrls) {
  const full = join(ROOT, row.sampleUrl);
  const ok = existsSync(full);
  if (!ok) {
    log(false, `sampleUrl N12 ausente [${row.skill}/${row.id}]: ${row.sampleUrl}`);
    missingUrls++;
  }
}
if (!missingUrls) {
  log(true, `sampleUrl N12: ${n12SampleUrls.length} URLs do artifacts.js batem com arquivos no disco`);
}
writeFileSync(join(SCRATCH, 'sampleurl-audit.txt'), sampleUrls.map(r => `${r.skill}\t${r.id}\t${r.format}\t${r.sampleUrl}`).join('\n'));

const port = Number(process.env.MAP_PORT || 8765);
const base = `http://127.0.0.1:${port}`;

// 4. HTTP
try {
  const pdfUrl = `${base}/mapa-skills-samples/academia-fit/relatorio-avatar.pdf`;
  const r = await fetch(pdfUrl);
  log(r.ok && (r.headers.get('content-type') || '').includes('pdf'), `HTTP PDF ${pdfUrl} (${r.status})`);
  const mapR = await fetch(`${base}/mapa-skills.html`);
  log(mapR.ok, `HTTP mapa-skills.html (${mapR.status})`);
} catch (e) {
  log(false, `HTTP check: ${e.message}`);
  writeFileSync(join(SCRATCH, 'launch-fallback.txt'), `HTTP server required on port ${port}: ${e.message}\n`);
}

// 5. Playwright — tour N12 + clique PDF + screenshot
const runPlaywright = process.argv.includes('--playwright') || process.argv.includes('--ui');
if (runPlaywright) {
  const consoleLines = [];
  const pageErrors = [];
  try {
    const pwDir = join(ROOT, 'scripts/node_modules/playwright');
    const chromium = existsSync(pwDir)
      ? (await import(pathToFileURL(join(pwDir, 'index.mjs')).href)).chromium
      : (await import('playwright')).chromium;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    page.on('console', msg => {
      if (msg.type() === 'error') consoleLines.push(`[console.error] ${msg.text()}`);
    });
    page.on('pageerror', e => pageErrors.push(e.message));

    await page.goto(`${base}/mapa-skills.html`, { waitUntil: 'networkidle' });

    // Tour N12 completo
    await page.click('#tour-btn');
    await page.waitForTimeout(400);
    for (let i = 0; i < N12_TOUR.length; i++) {
      const skillId = N12_TOUR[i];
      const node = page.locator(`.flow-node[data-id="${skillId}"]`);
      await node.waitFor({ state: 'visible', timeout: 5000 });
      const active = await node.evaluate(el => el.classList.contains('tour-active'));
      log(active, `tour passo ${i + 1}/${N12_TOUR.length}: ${skillId} tour-active`);
      if (i < N12_TOUR.length - 1) {
        await page.click('button[onclick="tourNext()"]');
        await page.waitForTimeout(350);
      }
    }
    log(pageErrors.length === 0, `tour N12: ${pageErrors.length} pageerror(s)`);
    log(consoleLines.length === 0, `tour N12: ${consoleLines.length} console.error(s)`);

    // Parar tour antes dos cliques de artefato
    await page.evaluate(() => { if (typeof stopTour === 'function') stopTour(false); });

    const selectSkillJs = async (skillId) => {
      await page.evaluate((id) => {
        const el = document.querySelector(`.flow-node[data-id="${id}"]`);
        if (el && typeof selectSkill === 'function') selectSkill(id, el, true);
      }, skillId);
      await page.waitForTimeout(500);
    };

    // Clique PDF em 5 skills
    for (const t of PDF_CLICK_TESTS) {
      await selectSkillJs(t.skill);
      const btn = page.locator(`button[onclick="openArtifactById('${t.artifactId}')"]`);
      await btn.waitFor({ state: 'visible', timeout: 8000 });
      await btn.click();
      await page.waitForTimeout(700);
      const src = await page.locator('#am-preview-pdf').getAttribute('src');
      const visible = await page.locator('#am-preview-pdf').isVisible();
      const ok = visible && src && src.includes('mapa-skills-samples') && src.includes(t.expectSrc);
      log(ok, `PDF click ${t.skill}/${t.artifactId}: src=${src || '(vazio)'}`);
      await page.click('button[onclick="closeArtifactModal()"]').catch(() => {});
      await page.waitForTimeout(250);
    }

    // Screenshot do preview avatar
    await selectSkillJs('avatar-funil');
    await page.click(`button[onclick="openArtifactById('avatar-pdf')"]`);
    await page.waitForTimeout(700);
    await page.screenshot({ path: join(SCRATCH, 'pdf-preview.png') });
    log(existsSync(join(SCRATCH, 'pdf-preview.png')), `screenshot ${join(SCRATCH, 'pdf-preview.png')}`);

    await browser.close();

    writeFileSync(join(SCRATCH, 'console-check.txt'), [
      `tour_steps: ${N12_TOUR.length}`,
      `pageerrors: ${pageErrors.length}`,
      ...pageErrors.map(e => `pageerror: ${e}`),
      `console_errors: ${consoleLines.length}`,
      ...consoleLines,
      `pdf_tests: ${PDF_CLICK_TESTS.length}`,
      `playwright: ok`,
    ].join('\n'));
    writeFileSync(join(SCRATCH, 'playwright-output.txt'), lines.filter(l => l.includes('PDF click') || l.includes('tour')).join('\n'));
  } catch (e) {
    log(false, `Playwright: ${e.message}`);
    writeFileSync(join(SCRATCH, 'playwright-output.txt'), `failed: ${e.message}\n${e.stack || ''}`);
    writeFileSync(join(SCRATCH, 'console-check.txt'), `playwright_failed: ${e.message}\n`);
  }
} else {
  writeFileSync(join(SCRATCH, 'console-check.txt'), 'playwright: not run (use --playwright)\n');
}

writeFileSync(join(SCRATCH, 'validate-final.txt'), lines.join('\n') + (failed ? `\n\nFALHOU: ${failed}` : '\n\nOK: todos os checks passaram'));

console.log(failed ? `\nFALHOU: ${failed} checks` : '\nOK: todos os checks passaram');
process.exit(failed ? 1 : 0);