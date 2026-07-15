#!/usr/bin/env node
/**
 * scripts/acf-upload.mjs — Ponte ads-creative-factory → Meta Ads.
 *
 * Sobe imagens de criativo APROVADAS pelo aluno para a biblioteca da conta
 * (`/act_X/adimages`) e devolve os image_hash que o estruturador-publish.mjs
 * usa no plano da campanha. Não cria anúncio nenhum — só deixa as imagens
 * disponíveis na conta.
 *
 * Uso:
 *   node scripts/acf-upload.mjs --imagem=criativos/h1-feed.png --imagem=criativos/h2-feed.png
 *   node scripts/acf-upload.mjs --dir=projetos/meu-projeto/criativos/factory   # todos os .png/.jpg
 *   Flags: --json --env=/caminho/.env
 *
 * Regra do squad: só suba o que o aluno curou — upload não é publicação,
 * mas biblioteca de conta não é lugar de rascunho.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findEnvFile, loadEnv, buildCtx, graphPost, hint, resolveActId } from './lib/meta-graph.mjs';

const EXTENSOES = ['.png', '.jpg', '.jpeg'];
const TAMANHO_MAX_MB = 30;

function parseArgs(argv) {
  const out = { imagens: [], dir: null, json: false, envPath: null, help: false };
  for (const a of argv) {
    if (a === '--json') out.json = true;
    else if (a === '-h' || a === '--help') out.help = true;
    else if (a.startsWith('--imagem=')) out.imagens.push(a.slice('--imagem='.length));
    else if (a.startsWith('--dir=')) out.dir = a.slice('--dir='.length);
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
  if (args.help || (!args.imagens.length && !args.dir)) {
    fail('Uso: node scripts/acf-upload.mjs --imagem=arquivo.png [--imagem=...] | --dir=pasta [--json]');
  }
  const envPath = findEnvFile(args.envPath, dirname(fileURLToPath(import.meta.url)));
  if (!envPath) fail('.env não encontrado.');
  const env = loadEnv(envPath);
  if (!env.META_ACCESS_TOKEN) fail('META_ACCESS_TOKEN ausente no .env.');
  const ctx = buildCtx(env);
  if (!ctx.actId) fail('META_AD_ACCOUNT_ID ausente no .env.');
  await resolveActId(ctx);

  const arquivos = [...args.imagens];
  if (args.dir) {
    for (const f of readdirSync(args.dir)) {
      if (EXTENSOES.includes(extname(f).toLowerCase())) arquivos.push(join(args.dir, f));
    }
  }
  if (!arquivos.length) fail('Nenhuma imagem .png/.jpg encontrada.');

  const hashes = {};
  const erros = [];
  for (const path of arquivos) {
    let bytes;
    try {
      const st = statSync(path);
      if (st.size > TAMANHO_MAX_MB * 1024 * 1024) {
        erros.push({ arquivo: path, erro: `arquivo maior que ${TAMANHO_MAX_MB}MB` });
        continue;
      }
      bytes = readFileSync(path);
    } catch (e) {
      erros.push({ arquivo: path, erro: e.message });
      continue;
    }
    const form = new FormData();
    form.set(basename(path), new Blob([bytes]), basename(path));
    const r = await graphPost(`${ctx.actId}/adimages`, form, ctx);
    if (!r.ok) {
      erros.push({ arquivo: path, erro: `${r.message} (código ${r.code}) → ${hint(r.code, '')}` });
      continue;
    }
    const first = Object.values(r.data.images || {})[0];
    if (first?.hash) hashes[basename(path)] = first.hash;
    else erros.push({ arquivo: path, erro: 'resposta da API sem hash' });
  }

  const report = { enviadas: hashes, erros };
  if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else {
    process.stdout.write('\nUpload de criativos — biblioteca da conta ' + ctx.actId + '\n\n');
    for (const [f, h] of Object.entries(hashes)) process.stdout.write(` ✔ ${f} → image_hash: ${h}\n`);
    for (const e of erros) process.stdout.write(` ✖ ${e.arquivo}: ${e.erro}\n`);
    if (Object.keys(hashes).length) {
      process.stdout.write('\nUse os image_hash acima no campo criativos[].image_hash do plano do Estruturador.\n');
    }
  }
  process.exit(erros.length && !Object.keys(hashes).length ? 1 : 0);
}

main().catch((e) => {
  process.stderr.write(`Erro inesperado: ${e.message}\n`);
  process.exit(2);
});
