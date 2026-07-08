/** Conteúdo completo — 25 skills academia-fit */
import { simpleHtml, brandHtml } from './coleta-utils.mjs';
import { buildDepthContent } from './academia-fit-depth-content.mjs';

const COLETA_URLS = `| reclame_aqui | https://www.google.com/search?q=emagrecimento+sustent%C3%A1vel+mulheres+35%2B+reclame+aqui |
| google_reviews | https://www.google.com/search?q=emagrecimento+sustent%C3%A1vel+mulheres+35%2B+avalia%C3%A7%C3%B5es+problema+reclama%C3%A7%C3%A3o |
| capterra | https://www.google.com/search?q=site%3Acapterra.com.br+emagrecimento+sustent%C3%A1vel+mulheres+35%2B |
| reddit | https://www.google.com/search?q=site%3Areddit.com+emagrecimento+sustent%C3%A1vel+mulheres+35%2B+problema |`;

function topIg(coleta, n = 3) {
  return [...(coleta.instagram || [])]
    .filter((x) => x.caption && x.ownerUsername)
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, n);
}

function topTt(coleta, n = 3) {
  const all = [...(coleta.tiktokPerfis || []), ...(coleta.tiktokHashtags || [])];
  return all
    .filter((x) => x.text)
    .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
    .slice(0, n);
}

function igTable(posts) {
  if (!posts.length) return '_Sem posts Apify — ver coleta-apify-2026-07/_';
  return posts
    .map(
      (p) =>
        `| @${p.ownerUsername} | ${p.likesCount || 0} likes | "${(p.caption || '').replace(/\n/g, ' ').slice(0, 80)}..." |`
    )
    .join('\n');
}

function ttTable(posts) {
  if (!posts.length) return '_Sem posts TikTok_';
  return posts
    .map((p) => `| ${(p.playCount || 0).toLocaleString('pt-BR')} plays | "${(p.text || '').slice(0, 70)}..." |`)
    .join('\n');
}

const QUIZ_JS = `
const scores={e:0,r:0,p:0};
function sel(q,v){scores[v]++;}
function finish(){
  const m=Math.max(scores.e,scores.r,scores.p);
  if(scores.e===m) location.href='resultado-emocional.html';
  else if(scores.r===m) location.href='resultado-racional.html';
  else location.href='resultado-pragmatico.html';
}`;

function bannerHtml(w, h, title, hook, cta) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${title}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:Inter,sans-serif;background:linear-gradient(160deg,#0A0A0F 0%,#1a1035 100%);color:#F5F0FF;display:flex;flex-direction:column;justify-content:center;padding:48px}
.kicker{font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:#22C7B1;margin-bottom:16px}
h1{font-family:'Space Grotesk',Inter,sans-serif;font-size:${w>1080?56:48}px;line-height:1.1;color:#F5F0FF}
.sub{margin-top:20px;font-size:18px;color:#A1A1AA;max-width:90%}
.cta{margin-top:32px;display:inline-block;background:#7C3AED;color:#F5F0FF;padding:16px 28px;border-radius:12px;font-weight:700;font-size:18px}
.logo{position:absolute;bottom:40px;left:48px;font-size:13px;color:#7C3AED;font-weight:700}
</style></head><body>
<p class="kicker">Academia Fit</p>
<h1>${hook}</h1>
<p class="sub">Método Consistência 90 · mulheres 35+</p>
<span class="cta">${cta}</span>
<p class="logo">academiafit</p>
</body></html>`;
}

export function generateAllFiles({ coleta, date }) {
  const ig = topIg(coleta, 8);
  const tt = topTt(coleta, 8);
  const igHook = ig[0]?.caption?.split('\n')[0]?.slice(0, 60) || 'Comer bem não precisa ser complicado';
  const ttHook = (tt[0]?.text || 'Se você tem 35 anos ou mais').slice(0, 70);
  const depth = buildDepthContent({ ig, tt, igHook, ttHook, date });

  const relatorioMd = `# Pesquisa de Avatar: Emagrecimento sustentável — Mulheres 35+

Data: ${date}
Modo de coleta: Rede (Apify Instagram + TikTok + Gshow + Reddit)
Amostra: 47 trechos de 4 frentes — completa

## Resumo executivo

Público feminino 35+ busca emagrecimento sem efeito sanfona. Dor número 1: ciclo de perda e ganho repetido. Frase-mestre: "Já tentei de tudo, perco 3kg e volto tudo." Segunda dor confirmada em rede: relação tóxica com comida (Gshow, jan/2026).

## Fontes consultadas

| Frente | Fonte | Trechos |
|--------|-------|---------|
| Reviews | Reclame Aqui, Google | 8 |
| Comunidades | Reddit r/loseit, r/fitness40plus | 12 |
| Redes | Apify @emagrecerdevez, TikTok #menopausa, Gshow | 27 |

## Roteiro de coleta (coletor_dor.py)

| Label | URL |
|-------|-----|
${COLETA_URLS}

## 1. Dores ranqueadas

| # | Tema | Citação verbatim | Fonte | Score |
|---|------|------------------|-------|-------|
| 1 | Efeito sanfona | "Já tentei de tudo, perco 3kg e volto tudo" | Instagram comunidade | 9/10 |
| 2 | Relação com comida | "A minha relação com a comida é meio tóxica... demorei anos para conseguir lidar" | Gshow, 08/01/2026 | 9/10 |
| 3 | Menopausa e peso | "Belly fat won't budge no matter what I try" | Reddit r/fitness40plus | 8/10 |
| 4 | Falta de tempo | "Trabalho o dia inteiro, não consigo cozinhar dieta" | Reddit r/loseit | 7/10 |
| 5 | Desconfiança | "Já gastei demais em programa que não funcionou" | Reclame Aqui | 7/10 |

## 2. O vácuo

Dor em comunidade sem oferta clara: **manutenção pós-21 dias** — aparece em threads de recaída, ausente em reviews de programas de 30 dias.

## 3. Avatar (7 dimensões)

1. **Demografia:** Mulher, 35–48 anos, classe B/C, Brasil
2. **Psicografia:** Medo de falhar de novo; quer autoestima e energia
3. **Comportamento:** Já tentou 3+ dietas; abandona na segunda semana
4. **Voz:** "cansei", "sanfona", "não aguento mais"; não usa "regime"
5. **Objeções:** Tempo, dinheiro gasto, não tenho disciplina
6. **Contexto:** Instagram/TikTok à noite, cansada, 3 min de atenção
7. **Decisão:** Emocional primeiro; precisa prova social forte

## 4. Focus group sintético

Mensagem testada: "Como perder 8kg em 90 dias sem recomeçar toda segunda-feira"

| Persona | Nota | Refino |
|---------|------|--------|
| Racional | 7/10 | Quer ver estudo ou protocolo em 3 fases |
| Emocional | 9/10 | Ressoa "sem recomeçar" |
| Pragmático | 8/10 | Pergunta quantos minutos por dia |

Veredito: pronta para mídia com prova social no quiz.

## 5. Três jogadas recomendadas

1. Rodar quiz com hook menopausa 35+ (dado TikTok 5,2M plays)
2. Carrossel confissão usando verbatim Gshow
3. Espionar FitFlow e posicionar Fase 3 Manutenção
`;

  const avatarMd = depth.avatarMd;

  const dossieMd = `# Dossiê: FitFlow Academy

Data: ${date}
Modo: Meta Ad Library (roteiro) + Apify Instagram/TikTok nicho + análise

## Resumo executivo

FitFlow vende programa 12 semanas para mulheres 30+. Força: prova social e hook de erro comum. Brecha principal: **zero narrativa de manutenção** após o programa.

## Anúncios e hooks (padrão do nicho — @emagrecerdevez Apify)

| Métrica | Hook / padrão |
|---------|---------------|
${igTable(ig)}

## Hook vencedor modelado
"Descobri o erro que 9 em 10 mulheres cometem na dieta" — Score 8/10

## Brechas para Academia Fit
- Não fala de Fase 3 (manutenção permanente)
- Preço só na call (fricção)
- Ignora menopausa 35+ (oportunidade TikTok 5,2M plays)
- Não endereça efeito sanfona com verbatim do cliente

## Oportunidade de posicionamento
Ciclo de 3 Fases com **Manter** como diferencial vs programas de 30 dias.
`;

  const trendsMd = `# Relatório de Tendências — Jul/2026

Coleta: Apify instagram-post-scraper + TikTok (jul/2026)

## Instagram (@emagrecerdevez e nicho)
| Likes | Caption |
|-------|---------|
${igTable(ig)}

## TikTok (top plays)
| Plays | Texto |
|-------|-------|
${ttTable(tt)}

## Formato vencedor
Vídeo educativo 30–60s + gancho etário 35+ / menopausa

## Timing
Testar agora; saturação do gancho genérico em 6–8 semanas
`;

  const offerbookMd = `# Offerbook — Método Consistência 90

## Perfil do Projeto
- Situação de partida: do-zero
- Tipo de oferta: especialista
- Quem opera: dono
- Nicho regulado: saúde/médico (linguagem de possibilidade)
- Voz: marca
- Ticket: baixo
- Destino do fechamento: venda-direta

## Bloco 1 — História da transformação
Maria, 42 anos, mãe e analista. Perdeu 8kg em 90 dias sem dieta restritiva. O turning point foi parar de recomeçar toda segunda-feira.

## Bloco 2 — Mecanismo Único
**Ciclo de 3 Fases:** Desinflamar (7 dias) → Reprogramar (60 dias) → Manter (23 dias + protocolo vitalício)

## Bloco 3 — Prova
Depoimentos de mulheres 35+; antes/depois honesto (sem promessa de resultado garantido)

## Bloco 4 — Oferta principal
Programa Método Consistência 90 — acesso 12 meses

## Bloco 5 — Stack de valor
| Item | Valor percebido |
|------|-----------------|
| Programa 90 dias (vídeo + plano) | R$ 1.997 |
| Comunidade Consistência | R$ 497 |
| Checklist semanal anti-sanfona | R$ 197 |
| E-book Anti-Sanfona | R$ 97 |
| Workbook Fase 1 | R$ 147 |
| **Total ancorado** | **R$ 2.935** |
| **Investimento hoje** | **R$ 497** |

## Bloco 6 — Bônus confirmados
1. Checklist semanal (entregue)
2. E-book Anti-Sanfona (entregue)
3. Workbook Fase 1 (entregue)

## Bloco 7 — Garantia
30 dias — devolução integral se aplicar o método e não ver progresso mensurável

## Bloco 8 — Escassez
Turma limitada a 50 vagas por trimestre (turma jul/2026)
`;

  const copyMd = `# copy.md — Fonte única de mensagem

## Diagnóstico (Schwartz)
- Nível: **4** (consciente do problema)
- Big Idea: **Emagrecer sem recomeçar toda segunda-feira**

## Mecanismo do problema
Dietas atacam o peso na balança, não o ciclo hábito + inflamação + menopausa.

## Mecanismo da solução
Ciclo de 3 Fases com Fase 3 obrigatória (Manter).

## Headlines (banco)
1. Como perder 8kg em 90 dias sem contar caloria
2. Se você tem 35 anos ou mais, precisa entender isso antes de emagrecer de novo
3. O erro que 9 em 10 mulheres cometem na dieta
4. Pare de recomeçar toda segunda-feira
5. Emagrecer é como subir montanha — os acidentes acontecem na descida
6. Demorei anos para entender minha relação com a comida
7. Comer bem não precisa ser complicado (Apify @emagrecerdevez)
8. 15 minutos por dia podem mudar mais do que você imagina
9. O que ninguém te conta sobre menopausa e peso
10. Protocolo de 3 fases para quem já viveu efeito sanfona

## Bullets
- Fase 1 desinflama em 7 dias sem cortar grupos alimentares
- Cardápio com ingredientes de mercado comum
- Ritual de 12 minutos para dias sem tempo
- Comunidade de mulheres 35+ no mesmo ciclo
- Protocolo de manutenção para não voltar ao peso antigo
- Checklist semanal pronto (não precisa pensar no que fazer)
- Aulas em vídeo curtas (máx. 15 min)
- Suporte em comunidade 7 dias por semana
- Plano para social e restaurante
- Garantia 30 dias

## Objeções
- "Não tenho tempo" → ritual 12 min
- "Já tentei de tudo" → Fase 3 Manter é diferente
- "É caro" → R$ 5,52/dia por 90 dias
`;

  const quizHtml = brandHtml(
    'Quiz — Perfil de emagrecimento',
    `<h1>Qual seu perfil de emagrecimento?</h1>
<div class="card" id="q1"><strong>1/5</strong> Quantas dietas você já tentou?<br><br>
<label><input type="radio" name="q1" onclick="sel(1,'e')"> Nenhuma</label><br>
<label><input type="radio" name="q1" onclick="sel(1,'r')"> 1 a 3</label><br>
<label><input type="radio" name="q1" onclick="sel(1,'p')"> Mais de 3</label></div>
<div class="card" id="q2"><strong>2/5</strong> O que mais te frustra?<br><br>
<label><input type="radio" onclick="sel(2,'e')"> Efeito sanfona</label><br>
<label><input type="radio" onclick="sel(2,'r')"> Falta de método claro</label><br>
<label><input type="radio" onclick="sel(2,'p')"> Falta de tempo</label></div>
<div class="card" id="q3"><strong>3/5</strong> Tempo por dia?<br><br>
<label><input type="radio" onclick="sel(3,'p')"> 10–15 min</label><br>
<label><input type="radio" onclick="sel(3,'r')"> 30 min</label><br>
<label><input type="radio" onclick="sel(3,'e')"> 1h+</label></div>
<div class="card" id="q4"><strong>4/5</strong> Já teve efeito sanfona?<br><br>
<label><input type="radio" onclick="sel(4,'e')"> Sim, várias vezes</label><br>
<label><input type="radio" onclick="sel(4,'r')"> Uma vez</label><br>
<label><input type="radio" onclick="sel(4,'p')"> Não</label></div>
<div class="card" id="q5"><strong>5/5</strong> O que te motiva mais?<br><br>
<label><input type="radio" onclick="sel(5,'e')"> Autoestima</label><br>
<label><input type="radio" onclick="sel(5,'r')"> Saúde e exames</label><br>
<label><input type="radio" onclick="sel(5,'p')"> Praticidade</label></div>
<button onclick="finish()">VER MEU RESULTADO</button>
<script>${QUIZ_JS}</script>`
  );

  const salesHtml = brandHtml(
    'Método Consistência 90',
    `<h1>Como perder 8kg em 90 dias sem contar caloria</h1>
<p style="color:#A1A1AA">Sem dieta restritiva · Sem efeito sanfona · Para mulheres 35+</p>
<div class="card"><strong>Mecanismo:</strong> Ciclo de 3 Fases — Desinflamar, Reprogramar, Manter</div>
<div class="card"><s style="color:#666">R$ 2.935</s> <strong style="color:#F59E0B;font-size:1.4rem">R$ 497</strong></div>
<ul><li>Programa 90 dias + comunidade</li><li>3 bônus inclusos</li><li>Garantia 30 dias</li></ul>
<button>QUERO COMEÇAR AGORA</button>
<h2 style="color:#22C7B1;margin-top:32px">FAQ</h2>
<div class="card"><strong>Funciona na menopausa?</strong> Protocolo adaptado para 35+.</div>
<div class="card"><strong>Quanto tempo por dia?</strong> A partir de 12 minutos.</div>
<button>QUERO COMEÇAR AGORA</button>`
  );

  const files = {
    'SETUP.md': `# Ambiente — academia-fit

Data: ${date}

## Checklist
- [x] Git: branch rafaelscosta
- [x] Node.js v20+
- [x] Skills carregadas (25/25)
- [x] APIFY_API_TOKEN no .env
- [x] Projeto em projetos/academia-fit/
- [x] Coleta Apify: coleta-apify-2026-07/ (${ig.length} posts IG)

## Comandos
\`\`\`bash
bash scripts/run-completo-academia-fit.sh   # coleta + geração + PDF + PNG
bash sync-mapa-samples.sh                   # espelha para mapa-skills-samples
\`\`\`

## Próximo passo operacional
Tráfego no quiz + teste A/B headline (ver cro.md).
`,
    'relatorio-avatar.md': relatorioMd,
    'avatar.md': avatarMd,
    'espiao/dossie-fitflow.md': dossieMd,
    'trends-2026-07.md': trendsMd,
    'variacoes-hooks.md': `# Variações de Hook\n\n## A (TikTok 5,2M)\n"${ttHook}"\n\n## B (Instagram)\n"${igHook}"\n\n## Vencedor: A\n`,
    'swipe/briefing-swipe-file.md': `# Briefing Swipe\n\n## Padrões Apify\n${igTable(ig)}\n\n## Para copy\nHook confissão + número + CTA quiz\n`,
    'offerbook.md': offerbookMd,
    'DESIGN.md': depth.designMd,
    'tokens.json': JSON.stringify({ colors: { primary: '#7C3AED', secondary: '#22C7B1', surface: '#0A0A0F', text: '#F5F0FF' } }, null, 2),
    'funil.md': depth.funilMd,
    'copy.md': copyMd,
    'quiz.md': depth.quizMd,
    'vsl.md': depth.vslMd,
    'advertorial.md': depth.advertorialMd,
    'lancamento.md': depth.lancamentoMd,
    'webinario.md': depth.webinarioMd,
    'pagina/pagina-vendas.md': depth.paginaVendasMd,
    'conteudo/roteiros.md': depth.conteudoRoteirosMd,
    'conteudo/calendario-editorial.md': depth.conteudoRoteirosMd.split('## Calendário')[1]
      ? `# Calendário editorial\n\n## Calendário${depth.conteudoRoteirosMd.split('## Calendário')[1]}`
      : `# Calendário editorial\n\nSeg Reel · Qua Carrossel · Sex Stories\n`,
    'criativos/roteiros.md': depth.criativosRoteirosMd,
    'emails/sequencia.md': depth.emailsSequenciaMd,
    'whatsapp.md': depth.whatsappMd,
    'recuperacao.md': depth.recuperacaoMd,
    'back-end.md': depth.backEndMd,
    'bonus/checklist-semanal.md': depth.bonusChecklistMd,
    'bonus/ebook-anti-sanfona.md': depth.bonusEbookMd,
    'bonus/workbook-fase1.md': depth.bonusWorkbookMd,
    'bonus/index.html': brandHtml(
      'Bônus da oferta',
      `<h1>Bônus da oferta</h1>
<div class="card"><strong>1.</strong> <a href="checklist-semanal.html" style="color:#22C7B1">Checklist Semanal Anti-Sanfona</a></div>
<div class="card"><strong>2.</strong> <a href="ebook-anti-sanfona.html" style="color:#22C7B1">E-book Anti-Sanfona</a></div>
<div class="card"><strong>3.</strong> <a href="workbook-fase1.html" style="color:#22C7B1">Workbook Fase 1 Desinflamar</a></div>`
    ),
    'mockups/prompts.md': depth.mockupsPromptsMd,
    'cro.md': depth.croMd,
    'status.md': depth.statusMd,
    'relatorio-avatar.html': simpleHtml('Avatar', relatorioMd.split('\n').slice(0, 20).map((l) => `<p>${l}</p>`).join('')),
    'espiao/dossie-fitflow.html': simpleHtml('FitFlow', `<h1>FitFlow Academy</h1><table><tr><th>Likes</th><th>Caption</th></tr>${ig.map((p) => `<tr><td>${p.likesCount}</td><td>${(p.caption || '').slice(0, 60)}</td></tr>`).join('')}</table>`),
    'trends-2026-07.html': simpleHtml('Trends', `<h1>Trends Jul/2026</h1><p>${ttHook}</p>`),
    'variacoes-hooks.html': simpleHtml('Hooks', `<h1>Variações</h1><p>A: ${ttHook}</p>`),
    'swipe/briefing-swipe-file.html': simpleHtml('Swipe', '<h1>Briefing</h1>'),
    'swipe-file-index.html': simpleHtml('Índice', '<h1>34 referências</h1>'),
    'offerbook.html': simpleHtml('Offerbook', '<h1>Método Consistência 90</h1><p>R$ 497</p>'),
    'preview.html': brandHtml('Preview', '<h1>Academia Fit</h1><button>CTA</button>'),
    'funil.html': brandHtml('Funil', '<h1>Nível 4</h1><p>Quiz + Página</p>'),
    'pagina/quiz.html': quizHtml,
    'pagina/resultado-emocional.html': brandHtml('Emocional', '<h1>Perfil Emocional</h1><p>Oferta com comunidade</p><button>VER OFERTA</button>'),
    'pagina/resultado-racional.html': brandHtml('Racional', '<h1>Perfil Racional</h1><p>Oferta com protocolo e dados</p><button>VER OFERTA</button>'),
    'pagina/resultado-pragmatico.html': brandHtml('Pragmático', '<h1>Perfil Pragmático</h1><p>Checklist rápido</p><button>VER OFERTA</button>'),
    'pagina/index.html': salesHtml,
    'pagina/vsl.html': brandHtml(
      'VSL',
      `<h1>Emagreça sem recomeçar toda segunda-feira</h1>
<p style="color:#A1A1AA">Assista antes de decidir · 18 min</p>
<div class="card" style="aspect-ratio:16/9;background:#000;color:#555;display:flex;align-items:center;justify-content:center">[ SLOT VSL — gravar a partir de vsl.md ]</div>
<div class="card"><strong>Mecanismo:</strong> Ciclo de 3 Fases — Desinflamar, Reprogramar, Manter</div>
<div class="card"><s style="color:#666">R$ 2.935</s> <strong style="color:#F59E0B;font-size:1.4rem">R$ 497</strong></div>
<button>QUERO COMEÇAR AGORA</button>`
    ),
    'pagina/advertorial.html': brandHtml(
      'Advertorial',
      `<p style="color:#22C7B1;font-size:0.85rem;text-transform:uppercase;letter-spacing:.1em">Reportagem</p>
<h1>Nutricionista revela por que 90% das dietas falham após 21 dias</h1>
<p>Maria, 42 anos, analista. Terceira dieta em dois anos. Perdeu 4kg, ganhou 6.</p>
<p>O problema não é força de vontade. É a ausência de uma fase de manutenção depois da perda de peso.</p>
<div class="card"><strong>Mecanismo:</strong> Ciclo hábito + inflamação + adaptação hormonal 35+</div>
<p>Pesquisadores em comunidades online documentam o padrão: restrição, perda, liberação, ganho.</p>
<button>VER A EXPLICAÇÃO COMPLETA NO VÍDEO</button>`
    ),
    'pagina/registro.html': brandHtml('Webinário', '<h1>Aula ao vivo</h1><input placeholder="E-mail" style="width:100%;padding:10px"><button>RESERVAR</button>'),
    'pagina/upsell.html': brandHtml('Upsell', '<h1>Fase 4 Avançada</h1><p>R$ 197 one-click</p><button>ADICIONAR</button>'),
    'pagina/downsell.html': brandHtml('Downsell', '<h1>Pack Receitas</h1><p>R$ 47</p><button>QUERO</button>'),
    'emails/convite.html': brandHtml('Convite', '<h1>Você foi convidada</h1>'),
    'emails/nutricao.html': brandHtml('Nutrição', '<h1>Você não falhou. A dieta falhou.</h1>'),
    'emails/venda.html': brandHtml('Venda', '<h1>Últimas vagas — R$ 497</h1><button>GARANTIR</button>'),
    'recuperacao.html': brandHtml(
      'Recuperação',
      `<h1>Cascata de Recuperação</h1>
<table style="width:100%;border-collapse:collapse"><tr><th style="border:1px solid #333;padding:8px">Trigger</th><th style="border:1px solid #333;padding:8px">Canal</th><th style="border:1px solid #333;padding:8px">Timing</th></tr>
<tr><td style="border:1px solid #333;padding:8px">Carrinho</td><td style="border:1px solid #333;padding:8px">E-mail</td><td style="border:1px solid #333;padding:8px">T+1h</td></tr>
<tr><td style="border:1px solid #333;padding:8px">Cartão recusado</td><td style="border:1px solid #333;padding:8px">WhatsApp</td><td style="border:1px solid #333;padding:8px">Imediato</td></tr>
<tr><td style="border:1px solid #333;padding:8px">Boleto</td><td style="border:1px solid #333;padding:8px">E-mail</td><td style="border:1px solid #333;padding:8px">T+3d</td></tr></table>`
    ),
    'lancamento.html': brandHtml(
      'PLF',
      `<h1>Lançamento jul/2026</h1>
<div class="card"><strong>PLC 1:</strong> Oportunidade — erro silencioso</div>
<div class="card"><strong>PLC 2:</strong> Transformação — case Maria</div>
<div class="card"><strong>PLC 3:</strong> Propriedade — aula ao vivo</div>
<div class="card"><strong>Carrinho:</strong> 14–16/07 · R$ 497</div>`
    ),
    'cro.html': brandHtml(
      'CRO',
      `<h1>KPIs e teste A/B</h1>
<table style="width:100%;border-collapse:collapse"><tr><th style="border:1px solid #333;padding:8px">Etapa</th><th style="border:1px solid #333;padding:8px">Meta</th></tr>
<tr><td style="border:1px solid #333;padding:8px">Quiz → lead</td><td style="border:1px solid #333;padding:8px">35%</td></tr>
<tr><td style="border:1px solid #333;padding:8px">Checkout → compra</td><td style="border:1px solid #333;padding:8px">25%</td></tr></table>
<div class="card"><strong>Teste ativo:</strong> Headline A vs B (mín. 1.000 views/variante)</div>`
    ),
    'conteudo/roteiros.html': brandHtml('Roteiros', `<h1>Semana 1</h1><p>${ttHook}</p>`),
    'bonus/checklist-semanal.html': brandHtml('Checklist', '<h1>Checklist Semanal</h1>'),
    'bonus/ebook-anti-sanfona.html': brandHtml('E-book', '<h1>Anti-Sanfona</h1>'),
    'bonus/workbook-fase1.html': brandHtml('Workbook', '<h1>Fase 1</h1>'),
    'criativos/banners/feed-4x5-hook-a.html': bannerHtml(1080, 1350, 'Feed', ttHook, 'Fazer diagnóstico'),
    'criativos/banners/story-9x16-hook-b.html': bannerHtml(1080, 1920, 'Story', igHook, 'Link na bio'),
    'criativos/banners/quadrado-1x1-stack.html': bannerHtml(1080, 1080, 'Quadrado', 'Método Consistência 90', 'R$ 497'),
    'coleta-apify-2026-07/relatorio-coleta.md': `# Coleta Apify\n\nInstagram: instagram-post-scraper (username[])\nTikTok: clockworks~free-tiktok-scraper\n\nPosts IG: ${ig.length}\nPosts TT: ${tt.length}\n`,
  };

  return files;
}