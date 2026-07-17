#!/usr/bin/env node
/**
 * scripts/circuit-breaker.mjs — Gatilho de stop-loss do Squad de Tráfego.
 *
 * Avalia com dados reais da Graph API o ÚNICO gatilho que autoriza furar a
 * regra "não mexer 7 dias" do Estruturador:
 *
 *   gasto >= 2× CPA-alvo  E  0 conversões  E  CTR < 0,5%
 *
 * Somente leitura. Este script NÃO pausa nada — ele informa o Diagnosticador,
 * que recomenda, e o aluno decide.
 *
 * Uso:
 *   node scripts/circuit-breaker.mjs --campaign-id=X --cpa-alvo=50 [--json]
 *   (janela: desde o início da campanha — date_preset=maximum)
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findEnvFile, loadEnv, buildCtx, graphGet, hint } from './lib/meta-graph.mjs';

const CTR_MINIMO = 0.5;

function parseArgs(argv) {
  const out = { json: false, envPath: null, campaignId: null, cpaAlvo: null, help: false };
  for (const a of argv) {
    if (a === '--json') out.json = true;
    else if (a === '-h' || a === '--help') out.help = true;
    else if (a.startsWith('--campaign-id=')) out.campaignId = a.slice('--campaign-id='.length);
    else if (a.startsWith('--cpa-alvo=')) out.cpaAlvo = Number(a.slice('--cpa-alvo='.length));
    else if (a.startsWith('--env=')) out.envPath = a.slice('--env='.length);
  }
  return out;
}

function fail(msg, code = 2) {
  process.stderr.write(msg + '\n');
  process.exit(code);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.campaignId || !args.cpaAlvo || !Number.isFinite(args.cpaAlvo) || args.cpaAlvo <= 0) {
    fail('Uso: node scripts/circuit-breaker.mjs --campaign-id=<id> --cpa-alvo=<R$> [--json]');
  }
  const envPath = findEnvFile(args.envPath, dirname(fileURLToPath(import.meta.url)));
  if (!envPath) fail('.env não encontrado.');
  const env = loadEnv(envPath);
  if (!env.META_ACCESS_TOKEN) fail('META_ACCESS_TOKEN ausente no .env.');
  const ctx = buildCtx(env);

  const r = await graphGet(`${args.campaignId}/insights`, {
    date_preset: 'maximum',
    fields: 'spend,ctr,actions,impressions,date_start,date_stop',
  }, ctx);
  if (!r.ok) fail(`Erro na Graph API: ${r.message}\n→ ${hint(r.code, 'Confira o campaign-id.')}`, 1);
  const row = (r.data.data || [])[0];
  if (!row) fail('Campanha sem dados de entrega ainda — circuit-breaker não se aplica.', 1);

  const gasto = Number(row.spend) || 0;
  const ctr = Number(row.ctr);
  const acts = Object.fromEntries((row.actions || []).map((a) => [a.action_type, Number(a.value)]));
  const conversoes = acts.omni_purchase ?? acts.purchase ?? acts.lead ?? acts['offsite_conversion.fb_pixel_lead'] ?? 0;

  const condGasto = gasto >= 2 * args.cpaAlvo;
  const condConv = conversoes === 0;
  const condCtr = Number.isFinite(ctr) && ctr < CTR_MINIMO;
  const acionado = condGasto && condConv && condCtr;

  const report = {
    campaign_id: args.campaignId,
    janela: `${row.date_start} → ${row.date_stop}`,
    cpa_alvo: args.cpaAlvo,
    gasto,
    conversoes,
    ctr,
    condicoes: {
      [`gasto >= 2x CPA-alvo (R$${(2 * args.cpaAlvo).toFixed(2)})`]: condGasto,
      'zero conversões': condConv,
      [`CTR < ${CTR_MINIMO}%`]: condCtr,
    },
    circuit_breaker_acionado: acionado,
    orientacao: acionado
      ? 'Gatilho ACIONADO: a regra dos 7 dias está oficialmente furada. Diagnosticador pode recomendar revisão de criativo/ângulo antes do prazo — decisão final é do aluno.'
      : 'Gatilho NÃO acionado: respeite os 7 dias sem mexer. Fora deste gatilho nomeado, edição reseta o aprendizado do algoritmo.',
  };

  if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else {
    process.stdout.write(`\nCircuit-breaker — campanha ${report.campaign_id} (${report.janela})\n\n`);
    for (const [k, v] of Object.entries(report.condicoes)) {
      process.stdout.write(` ${v ? '⚠ SIM' : '· não'}  ${k}\n`);
    }
    process.stdout.write(`\n Gasto: R$${gasto.toFixed(2)} · Conversões: ${conversoes} · CTR: ${Number.isFinite(ctr) ? ctr.toFixed(2) : '?'}%\n`);
    process.stdout.write(`\n${acionado ? '🔴 ACIONADO' : '🟢 NÃO ACIONADO'} — ${report.orientacao}\n`);
  }
  process.exit(acionado ? 3 : 0);
}

main().catch((e) => {
  process.stderr.write(`Erro inesperado: ${e.message}\n`);
  process.exit(2);
});
