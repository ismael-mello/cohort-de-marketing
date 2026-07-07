#!/usr/bin/env node
/**
 * Verifica que bootstrap-academia-fit.sh produz os mesmos caminhos
 * que as skills N12 declaram em SKILL.md (contrato de entrega).
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJ = join(ROOT, 'projetos/academia-fit');

const CONTRACTS = [
  { skill: 'avatar-funil', files: ['avatar.md', 'relatorio-avatar.md', 'relatorio-avatar.html', 'relatorio-avatar.pdf'] },
  { skill: 'espiao-do-concorrente', files: ['espiao/dossie-fitflow.md', 'espiao/dossie-fitflow.html', 'espiao/dossie-fitflow.pdf'] },
  { skill: 'trend-hunting', files: ['trends-2026-07.md', 'trends-2026-07.html', 'variacoes-hooks.md'] },
  { skill: 'swipe-file', files: ['swipe/briefing-swipe-file.md', 'swipe-file-index.html'] },
  { skill: 'offerbook', files: ['offerbook.md', 'offerbook.html', 'offerbook.pdf'] },
  { skill: 'design-md', files: ['DESIGN.md', 'preview.html', 'tokens.json'] },
  { skill: 'metodo-funil', files: ['funil.md', 'funil.html', 'funil.pdf'] },
  { skill: 'copy-funil', files: ['copy.md'] },
  { skill: 'quiz-funil', files: ['quiz.md', 'pagina/quiz.html', 'pagina/resultado-emocional.html'] },
  { skill: 'email-funil', files: ['emails/nutricao.html', 'emails/venda.html'] },
  { skill: 'recuperacao-funil', files: ['recuperacao.md', 'recuperacao.html', 'recuperacao.pdf'] },
  { skill: 'backend-funil', files: ['back-end.md'] },
];

let failed = 0;
for (const { skill, files } of CONTRACTS) {
  const skillMd = join(ROOT, `.claude/skills/${skill}/SKILL.md`);
  if (!existsSync(skillMd)) {
    console.log(`✗ SKILL.md ausente: ${skill}`);
    failed++;
    continue;
  }
  for (const f of files) {
    const ok = existsSync(join(PROJ, f));
    console.log(`${ok ? '✓' : '✗'} [${skill}] ${f}`);
    if (!ok) failed++;
  }
}

console.log(failed ? `\nFALHOU: ${failed}` : '\nOK: contratos N12 satisfeitos pelo bootstrap');
process.exit(failed ? 1 : 0);