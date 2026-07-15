#!/usr/bin/env node
/**
 * scripts/leitor-metricas.mjs — Leitor de Métricas, Modo API (Squad de Tráfego).
 *
 * Puxa insights reais da campanha via Graph API e devolve os sinais com selo
 * de fonte, preservando o contrato "não-inferir": só repassa números que a
 * própria Meta entrega prontos — nada é calculado aqui. ROAS da plataforma
 * sai como "Estimado" (atribuição ≠ caixa) até o aluno confirmar venda real.
 *
 * Uso:
 *   node scripts/leitor-metricas.mjs                          # lista campanhas p/ escolher
 *   node scripts/leitor-metricas.mjs --campaign-id=123        # leitura da campanha
 *   node scripts/leitor-metricas.mjs --campaign-id=123 --fadiga   # análise por anúncio (Briefista)
 *   node scripts/leitor-metricas.mjs --account                # conta inteira
 *   Flags: --date-preset=last_7d|last_3d|last_14d|... --json --env=/caminho/.env
 *
 * Somente leitura (GET). Requer META_ACCESS_TOKEN (+ META_AD_ACCOUNT_ID) no .env.
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GRAPH_VERSION, findEnvFile, loadEnv, buildCtx, graphGet, graphGetAll, hint, resolveActId,
} from './lib/meta-graph.mjs';

const INSIGHT_FIELDS = [
  'spend', 'impressions', 'clicks', 'inline_link_clicks', 'ctr', 'cpm', 'cpc',
  'frequency', 'reach', 'actions', 'cost_per_action_type', 'purchase_roas',
  'date_start', 'date_stop',
].join(',');

const MIN_CONVERSOES_CPA = 10;
const FADIGA_QUEDA_CTR = 0.20;      // -20% do pico
const FADIGA_FREQUENCIA = 3.0;
const FADIGA_IDADE_DIAS = 14;
const FADIGA_MIN_IMPRESSOES_DIA = 500; // dia com menos que isso não conta como "pico"

function parseArgs(argv) {
  const out = { json: false, envPath: null, campaignId: null, account: false, fadiga: false, datePreset: 'last_7d', help: false };
  for (const a of argv) {
    if (a === '--json') out.json = true;
    else if (a === '--account') out.account = true;
    else if (a === '--fadiga') out.fadiga = true;
    else if (a === '-h' || a === '--help') out.help = true;
    else if (a.startsWith('--campaign-id=')) out.campaignId = a.slice('--campaign-id='.length);
    else if (a.startsWith('--date-preset=')) out.datePreset = a.slice('--date-preset='.length);
    else if (a.startsWith('--env=')) out.envPath = a.slice('--env='.length);
  }
  return out;
}

function fail(msg, code = 2) {
  process.stderr.write(msg + '\n');
  process.exit(code);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// Ações relevantes, com o action_type literal preservado
function extractActions(row) {
  const acts = {};
  for (const a of row.actions || []) acts[a.action_type] = num(a.value);
  const costs = {};
  for (const a of row.cost_per_action_type || []) costs[a.action_type] = num(a.value);
  const roas = (row.purchase_roas || []).map((r) => ({ action_type: r.action_type, valor: num(r.value) }));
  return { acts, costs, roas };
}

function sinal(metrica, valor, selo, fonte, premissa) {
  return { metrica, valor, selo, fonte, ...(premissa ? { premissa } : {}) };
}

function buildSinais(row, hoje) {
  const fonte = `API Graph ${GRAPH_VERSION} em ${hoje} (janela ${row.date_start} → ${row.date_stop})`;
  const { acts, costs, roas } = extractActions(row);
  const sinais = [
    sinal('Gasto (R$)', num(row.spend), 'Real', fonte),
    sinal('Impressões', num(row.impressions), 'Real', fonte),
    sinal('Alcance', num(row.reach), 'Real', fonte),
    sinal('Cliques (todos)', num(row.clicks), 'Real', fonte),
    sinal('Cliques no link', num(row.inline_link_clicks), 'Real', fonte),
    sinal('CTR (%)', num(row.ctr), 'Real', fonte),
    sinal('CPM (R$)', num(row.cpm), 'Real', fonte),
    sinal('CPC (R$)', num(row.cpc), 'Real', fonte),
    sinal('Frequência', num(row.frequency), 'Real', fonte),
  ].filter((s) => s.valor !== null);

  const purchases = acts.omni_purchase ?? acts.purchase ?? null;
  const leads = acts.lead ?? acts['offsite_conversion.fb_pixel_lead'] ?? null;
  if (purchases !== null) {
    sinais.push(sinal('Compras (atribuídas)', purchases, 'Real', fonte, 'evento reportado pela plataforma'));
    const cpa = costs.omni_purchase ?? costs.purchase;
    if (cpa != null) sinais.push(sinal('CPA compra (R$)', cpa, 'Real', fonte, 'custo por resultado reportado pela plataforma'));
  }
  if (leads !== null) {
    sinais.push(sinal('Leads (atribuídos)', leads, 'Real', fonte, 'evento reportado pela plataforma'));
    const cpl = costs.lead ?? costs['offsite_conversion.fb_pixel_lead'];
    if (cpl != null) sinais.push(sinal('CPL (R$)', cpl, 'Real', fonte, 'custo por resultado reportado pela plataforma'));
  }
  for (const r of roas) {
    sinais.push(sinal(`ROAS (${r.action_type})`, r.valor, 'Estimado', fonte,
      'atribuição da plataforma, NÃO confirmado no caixa — só vira Real com venda conferida pelo aluno'));
  }

  const conversoes = purchases ?? leads ?? 0;
  return { sinais, conversoes, acoes_brutas: acts };
}

function toYaml(report) {
  const lines = ['leitor:', `  modo: "api"`, `  ultima_leitura: "${report.ultima_leitura}"`,
    `  fonte: "Graph API ${GRAPH_VERSION} (${report.escopo})"`,
    `  janela_atribuicao: "${report.janela_atribuicao}"`, '  sinais:'];
  for (const s of report.sinais) {
    lines.push(`    - metrica: "${s.metrica}"`);
    lines.push(`      valor: ${s.valor}`);
    lines.push(`      selo: "${s.selo}"`);
    lines.push(`      fonte: "${s.fonte}"`);
    if (s.premissa) lines.push(`      premissa: "${s.premissa}"`);
  }
  lines.push(`  amostra_suficiente_para_cpa: ${report.amostra_suficiente_para_cpa}`);
  lines.push(`  nota_amostra: "${report.nota_amostra}"`);
  return lines.join('\n');
}

async function listarCampanhas(ctx) {
  const r = await graphGetAll(`${ctx.actId}/campaigns`, { fields: 'id,name,status,effective_status,objective,created_time', limit: 50 }, ctx);
  if (!r.ok) fail(`Erro ao listar campanhas: ${r.message}\n→ ${hint(r.code, 'Confira o .env.')}`);
  return r.data;
}

async function janelaAtribuicao(campaignId, ctx) {
  const r = await graphGet(`${campaignId}/adsets`, { fields: 'attribution_spec', limit: 5 }, ctx);
  if (!r.ok || !(r.data.data || []).length) return 'não fornecido pela API';
  const specs = (r.data.data[0].attribution_spec || [])
    .map((s) => `${s.window_days}d ${s.event_type === 'CLICK_THROUGH' ? 'clique' : 'view'}`);
  return specs.length ? specs.join(' / ') : 'não fornecido pela API';
}

async function leitura(scopePath, escopo, args, ctx, hoje) {
  const r = await graphGet(`${scopePath}/insights`, { date_preset: args.datePreset, fields: INSIGHT_FIELDS }, ctx);
  if (!r.ok) fail(`Erro ao buscar insights: ${r.message}\n→ ${hint(r.code, 'Confira campaign-id e permissões.')}`, 1);
  const rows = r.data.data || [];
  if (!rows.length) {
    fail(`Sem dados na janela ${args.datePreset} para ${escopo}. A campanha entregou impressões nesse período?`, 1);
  }
  const { sinais, conversoes, acoes_brutas } = buildSinais(rows[0], hoje);
  const amostraOk = conversoes >= MIN_CONVERSOES_CPA;
  return {
    modo: 'api',
    ultima_leitura: hoje,
    escopo,
    janela: args.datePreset,
    janela_atribuicao: scopePath.startsWith('act_') ? 'configuração por conjunto — leia por campanha' : await janelaAtribuicao(scopePath, ctx),
    sinais,
    acoes_brutas,
    conversoes_principais: conversoes,
    amostra_suficiente_para_cpa: amostraOk,
    nota_amostra: amostraOk
      ? `amostra com ${conversoes} conversões na janela — CPA utilizável`
      : `amostra insuficiente para CPA (${conversoes} conversões < ${MIN_CONVERSOES_CPA}) — leia sinal de topo (CTR, CPM, CPC, cliques no link)`,
  };
}

async function fadiga(campaignId, args, ctx, hoje) {
  const adsR = await graphGetAll(`${campaignId}/ads`, { fields: 'id,name,created_time,effective_status', limit: 50 }, ctx);
  if (!adsR.ok) fail(`Erro ao listar anúncios: ${adsR.message}`, 1);
  const resultado = [];
  for (const ad of adsR.data) {
    const ins = await graphGet(`${ad.id}/insights`, {
      date_preset: args.datePreset || 'last_14d',
      time_increment: 1,
      fields: 'ctr,impressions,frequency,spend,date_start',
    }, ctx);
    const dias = ins.ok ? ins.data.data || [] : [];
    const validos = dias.filter((d) => num(d.impressions) >= FADIGA_MIN_IMPRESSOES_DIA && num(d.ctr) !== null);
    const picoCtr = validos.length ? Math.max(...validos.map((d) => num(d.ctr))) : null;
    const ult = validos.slice(-3);
    const ctrRecente = ult.length ? ult.reduce((s, d) => s + num(d.ctr), 0) / ult.length : null;
    const quedaPct = picoCtr && ctrRecente !== null ? (picoCtr - ctrRecente) / picoCtr : null;
    const freqMax = dias.length ? Math.max(...dias.map((d) => num(d.frequency) || 0)) : null;
    const idadeDias = ad.created_time ? Math.floor((Date.now() - new Date(ad.created_time)) / 86_400_000) : null;

    const gatilhos = [];
    if (quedaPct !== null && quedaPct >= FADIGA_QUEDA_CTR) gatilhos.push(`CTR caiu ${(quedaPct * 100).toFixed(0)}% do pico (${picoCtr.toFixed(2)}% → ${ctrRecente.toFixed(2)}%)`);
    if (freqMax !== null && freqMax > FADIGA_FREQUENCIA) gatilhos.push(`frequência ${freqMax.toFixed(1)} > ${FADIGA_FREQUENCIA}`);
    if (idadeDias !== null && idadeDias >= FADIGA_IDADE_DIAS) gatilhos.push(`criativo com ${idadeDias} dias sem iteração`);

    resultado.push({
      ad_id: ad.id,
      nome: ad.name,
      status: ad.effective_status,
      idade_dias: idadeDias,
      ctr_pico: picoCtr,
      ctr_recente_3d: ctrRecente !== null ? Number(ctrRecente.toFixed(3)) : null,
      frequencia_max: freqMax,
      dias_com_amostra: validos.length,
      fadiga_detectada: gatilhos.length > 0,
      gatilhos,
    });
  }
  return { modo: 'api', analisado_em: hoje, campaign_id: campaignId, janela: args.datePreset || 'last_14d', anuncios: resultado };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Uso: node scripts/leitor-metricas.mjs [--campaign-id=X | --account] [--fadiga] [--date-preset=last_7d] [--json]\n');
    process.exit(0);
  }
  const envPath = findEnvFile(args.envPath, dirname(fileURLToPath(import.meta.url)));
  if (!envPath) fail('Erro: .env não encontrado. Sem credenciais, use o Modo Manual da skill (colar números).');
  const env = loadEnv(envPath);
  if (!env.META_ACCESS_TOKEN) fail('Erro: META_ACCESS_TOKEN ausente — use o Modo Manual da skill ou configure o .env.');
  const ctx = buildCtx(env);
  if (!ctx.actId) fail('Erro: META_AD_ACCOUNT_ID ausente no .env (rode scripts/zelador-audit.mjs --gravar-env para descobrir).');
  await resolveActId(ctx);
  const hoje = new Date().toISOString().slice(0, 10);

  if (!args.campaignId && !args.account) {
    const campanhas = await listarCampanhas(ctx);
    if (!campanhas.length) fail('Nenhuma campanha na conta. Rode o Estruturador primeiro.', 1);
    process.stdout.write('Campanhas na conta — rode de novo com --campaign-id=<id>:\n');
    for (const c of campanhas) {
      process.stdout.write(`  ${c.id}  [${c.effective_status}] ${c.objective}  "${c.name}"\n`);
    }
    process.exit(0);
  }

  if (args.fadiga) {
    if (!args.campaignId) fail('--fadiga exige --campaign-id=<id>');
    if (!args.datePreset || args.datePreset === 'last_7d') args.datePreset = 'last_14d';
    const rep = await fadiga(args.campaignId, args, ctx, hoje);
    if (args.json) process.stdout.write(JSON.stringify(rep, null, 2) + '\n');
    else {
      process.stdout.write(`\nFadiga criativa — campanha ${rep.campaign_id} (janela ${rep.janela})\n\n`);
      for (const a of rep.anuncios) {
        process.stdout.write(` ${a.fadiga_detectada ? '⚠' : '✔'} ${a.nome} [${a.status}] — ${a.idade_dias}d`);
        process.stdout.write(a.ctr_pico ? `, CTR pico ${a.ctr_pico.toFixed(2)}% → 3d ${a.ctr_recente_3d}%` : ', sem amostra diária suficiente');
        process.stdout.write('\n');
        for (const g of a.gatilhos) process.stdout.write(`     → ${g}\n`);
      }
      const n = rep.anuncios.filter((a) => a.fadiga_detectada).length;
      process.stdout.write(`\n${n} anúncio(s) com fadiga detectada. Handoff: Briefista gera nova leva dos ângulos vencedores.\n`);
    }
    return;
  }

  const scopePath = args.account ? ctx.actId : args.campaignId;
  const escopo = args.account ? `conta ${ctx.actId}` : `campanha ${args.campaignId}`;
  const rep = await leitura(scopePath, escopo, args, ctx, hoje);

  if (args.json) process.stdout.write(JSON.stringify(rep, null, 2) + '\n');
  else {
    process.stdout.write(`\nLeitor de Métricas — ${escopo} · janela ${rep.janela} · ${hoje}\n`);
    process.stdout.write(`Janela de atribuição: ${rep.janela_atribuicao}\n\n`);
    for (const s of rep.sinais) {
      process.stdout.write(` ${s.selo === 'Real' ? '✔' : '≈'} ${s.metrica.padEnd(24)} ${s.valor}   [${s.selo}]${s.premissa ? ` — ${s.premissa}` : ''}\n`);
    }
    process.stdout.write(`\n${rep.nota_amostra}\n\nBloco para o PAINEL-DA-SEMANA.yaml:\n\n${toYaml(rep)}\n`);
  }
}

main().catch((e) => {
  process.stderr.write(`Erro inesperado: ${e.message}\n`);
  process.exit(2);
});
