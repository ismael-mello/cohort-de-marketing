/**
 * Exemplos ilustrativos de artefatos — todas as 25 skills.
 * Usados no mapa-skills.html para preview clicável.
 */
(function () {
  const SLUG = "academia-fit";
  const P = (rel) => `projetos/${SLUG}/${rel}`;

  const SAMPLES = "mapa-skills-samples/academia-fit";

  const md = (id, label, rel, content) => ({
    id, label, path: P(rel), format: "md",
    sampleUrl: `${SAMPLES}/${rel}`,
    content: content || null
  });
  const html = (id, label, rel, content) => ({
    id, label, path: P(rel), format: "html",
    sampleUrl: `${SAMPLES}/${rel}`,
    content: content || null
  });
  /** Artefato ilustrativo — sem arquivo em mapa-skills-samples (só content inline) */
  const mdInline = (id, label, rel, content) => ({
    id, label, path: P(rel), format: "md", sampleUrl: null, content
  });
  const htmlInline = (id, label, rel, content) => ({
    id, label, path: P(rel), format: "html", sampleUrl: null, content
  });
  const pdf = (id, label, rel, htmlId) => ({
    id, label, path: P(rel), format: "pdf",
    htmlId,
    sampleUrl: `${SAMPLES}/${rel}`
  });
  const docx = (id, label, rel, htmlId) => ({
    id, label, path: P(rel), format: "docx", htmlId,
    sampleUrl: null
  });
  const folder = (id, label, rel, content) => ({ id, label, path: P(rel), format: "folder", content });

  const miniHtml = (title, kicker, color, body) =>
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${title}</title><style>
      body{font-family:Inter,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:36px;line-height:1.55}
      .wrap{max-width:680px;margin:0 auto}
      .kicker{font:600 0.68rem Inter,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${color};border:1px solid ${color}55;padding:4px 12px;border-radius:999px;display:inline-block}
      h1{font-size:1.6rem;margin:14px 0 8px}h2{font-size:1rem;color:${color};margin:20px 0 8px}
      .card{background:#121218;border:1px solid #2a2a35;border-radius:12px;padding:14px 18px;margin:10px 0}
      blockquote{border-left:3px solid ${color};margin:12px 0;padding:10px 16px;background:#121218;color:#d4d4d8;font-style:italic}
      table{width:100%;border-collapse:collapse;font-size:0.85rem;margin:12px 0}th,td{border:1px solid #2a2a35;padding:8px}th{background:#1a1a22;color:${color}}
      .foot{color:#666;font-size:0.78rem;margin-top:32px}
    </style></head><body><div class="wrap">${body}<p class="foot">Exemplo ilustrativo · Cohort de Marketing</p></div></body></html>`;

  window.ARTIFACT_SAMPLES = {
    "comecar": [
      md("setup-md", "SETUP.md", "SETUP.md", `# Ambiente preparado — Cohort de Marketing

## Checklist
- [x] Git atualizado (branch rafaelscosta)
- [x] Node.js v20+
- [x] Skills carregadas (25/25)
- [x] APIFY_API_TOKEN no .env
- [ ] Primeiro projeto criado em \`projetos/\`

## Próximo passo único
Rode \`/avatar-funil\` com seu nicho ou produto.`)
    ],

    "avatar-funil": [
      md("avatar-md", "avatar.md", "avatar.md", `# Avatar: Personal Trainer Online — Mulheres 35+

Ancorado na dor número 1:
> "Já tentei de tudo, perco 3kg e volto tudo. Não aguento mais me olhar no espelho."
> Fonte: Instagram @coachmaria

| # | Dimensão | Conteúdo |
|---|----------|----------|
| 1 | Demografia | Mulher 35–48, classe B/C |
| 2 | Psicografia | Medo de falhar de novo; quer autoestima |
| 5 | Objeções | Tempo, dinheiro gasto, disciplina |

Leitura: falar de **consistência sem culpa**, não de força de vontade.`),
      html("avatar-html", "relatorio-avatar.html", "relatorio-avatar.html",
        miniHtml("Pesquisa de Avatar", "Pesquisa de Avatar", "#a78bfa",
          `<span class="kicker">Pesquisa de Avatar</span><h1>Mulheres 35+ — PT Online</h1>
           <h2>Dor #1 (verbatim)</h2><blockquote>"Já tentei de tudo, perco 3kg e volto tudo."</blockquote>
           <table><tr><th>Dimensão</th><th>Resumo</th></tr><tr><td>Objeções</td><td>Tempo, dinheiro, disciplina</td></tr></table>`)),
      pdf("avatar-pdf", "relatorio-avatar.pdf", "relatorio-avatar.pdf", "avatar-html")
    ],

    "espiao-do-concorrente": [
      md("dossie-md", "dossie-fitflow.md", "espiao/dossie-fitflow.md", `# Dossiê: FitFlow Academy

**Resumo:** vende emagrecimento 12 semanas. Brecha: não fala de manutenção pós-30 dias.

## Hook vencedor
"Descobri o erro que 9 em 10 mulheres cometem na dieta" — Score 8/10

## Brechas
- Zero narrativa de recaída
- Preço só na call
- Nicho homens 40+ livre`),
      html("dossie-html", "dossie-fitflow.html", "espiao/dossie-fitflow.html",
        miniHtml("Dossiê FitFlow", "Dossiê do Concorrente", "#22c7b1",
          `<span class="kicker">Dossiê do Concorrente</span><h1>FitFlow Academy</h1>
           <div class="card"><strong>Hook:</strong> "Descobri o erro que 9 em 10 mulheres cometem na dieta"</div>
           <div class="card" style="border-color:#23e16955"><strong style="color:#23e169">Brecha:</strong> Não fala de manutenção pós-emagrecimento</div>`)),
      pdf("dossie-pdf", "dossie-fitflow.pdf", "espiao/dossie-fitflow.pdf", "dossie-html")
    ],

    "trend-hunting": [
      md("trends-md", "trends-2026-07.md", "trends-2026-07.md", `# Relatório de Tendências — Jul/2026

## Formato em ascensão
**Carrossel "antes/depois honesto"** — engajamento 3.2x acima da média do nicho

## Hooks virais detectados
1. "Parei de contar caloria e..."
2. "O que ninguém te conta sobre menopausa e peso"

## Timing
Saturação estimada: 6–8 semanas. Testar agora.`),
      html("trends-html", "trends-2026-07.html", "trends-2026-07.html",
        miniHtml("Trends", "Trend Hunting", "#22c7b1",
          `<span class="kicker">Trend Hunting</span><h1>Tendências Jul/2026</h1>
           <div class="card"><strong>Formato:</strong> Carrossel antes/depois honesto (+220% engajamento)</div>
           <div class="card"><strong>Hook:</strong> "Parei de contar caloria e..."</div>`)),
      pdf("trends-pdf", "trends-2026-07.pdf", "trends-2026-07.pdf", "trends-html"),
      html("variacoes-html", "variacoes-hooks.html", "variacoes-hooks.html",
        miniHtml("Hooks", "Variações", "#22c7b1",
          `<span class="kicker">Trend Hunting</span><h1>Variações de Hook</h1>
           <div class="card"><strong>A:</strong> O erro silencioso que faz 9 em 10 mulheres voltarem ao peso antigo</div>
           <div class="card"><strong>B:</strong> Parei de me pesar todo dia. Em 90 dias perdi 8kg.</div>`)),
      pdf("variacoes-pdf", "variacoes-hooks.pdf", "variacoes-hooks.pdf", "variacoes-html"),
      md("variacoes-md", "variacoes-hooks.md", "variacoes-hooks.md", `# Variações de Hook — prontas pra teste

## Variação A (curiosidade)
"O erro silencioso que faz 9 em 10 mulheres voltarem ao peso antigo"

## Variação B (confissão)
"Parei de me pesar todo dia. Em 90 dias perdi 8kg."

## Vencedor provável
Variação A — baseado em engajamento de referências do nicho.`)
    ],

    "swipe-file": [
      md("briefing-md", "briefing-swipe-file.md", "swipe/briefing-swipe-file.md", `# Briefing Swipe File

## Padrões extraídos (não copiar literal)
- Hook tipo confissão + número específico
- CTA suave no carrossel (slide 7)
- Prova: foto real, não stock

## Para Copy
Usar estrutura confissão nos headlines do copy.md`),
      html("briefing-html", "briefing-swipe-file.html", "swipe/briefing-swipe-file.html",
        miniHtml("Swipe File", "Briefing", "#22c7b1",
          `<span class="kicker">Swipe File</span><h1>Briefing — padrões extraídos</h1>
           <div class="card">Hook tipo confissão + número específico</div>`)),
      pdf("briefing-pdf", "briefing-swipe-file.pdf", "swipe/briefing-swipe-file.pdf", "briefing-html"),
      html("index-html", "swipe-file-index.html", "swipe-file-index.html",
        miniHtml("Swipe File", "Biblioteca de Referências", "#22c7b1",
          `<span class="kicker">Swipe File</span><h1>Índice — 34 criativos</h1>
           <table><tr><th>Tipo</th><th>Qtd</th><th>Score médio</th></tr>
           <tr><td>Hook curiosidade</td><td>12</td><td>7.8</td></tr>
           <tr><td>Confissão</td><td>9</td><td>8.1</td></tr></table>`)),
      pdf("index-pdf", "swipe-file-index.pdf", "swipe-file-index.pdf", "index-html"),
      folder("swipe-folder", "swipe/{tipo}/", "swipe/",
        `# Pasta swipe/\n\n\`\`\`\nswipe/\n├── hooks/\n├── ctas/\n├── carrosseis/\n└── vsl-refs/\n\`\`\`\n\nCada criativo: .md + .html + metadados (fonte, score, padrão).`)
    ],

    "offerbook": [
      md("offerbook-md", "offerbook.md", "offerbook.md", `# Offerbook — Método Consistência 90

## Perfil do Projeto
- Destino: checkout direto · Voz: marca

## Mecanismo Único
**Ciclo de 3 Fases:** Desinflamar → Reprogramar → Manter

## Stack
| Item | Valor |
|------|-------|
| Programa 90 dias | R$ 1.997 |
| **Preço** | **R$ 497** |`),
      html("offerbook-html", "offerbook.html", "offerbook.html",
        miniHtml("Offerbook", "Livro da Oferta", "#f59e0b",
          `<span class="kicker">Offerbook</span><h1>Método Consistência 90</h1>
           <div class="card"><strong>Mecanismo:</strong> Ciclo de 3 Fases</div>
           <table><tr><td>Programa</td><td>R$ 1.997</td></tr><tr><td><strong>Preço</strong></td><td><strong style="color:#f59e0b">R$ 497</strong></td></tr></table>`)),
      pdf("offerbook-pdf", "offerbook.pdf", "offerbook.pdf", "offerbook-html"),
      docx("offerbook-docx", "offerbook.docx", "offerbook.docx", "offerbook-html")
    ],

    "design-md": [
      md("design-md", "DESIGN.md", "DESIGN.md", `# DESIGN.md — Academia Fit

## Cores
- primary: #7C3AED (violeta)
- on-deep: #F5F0FF
- background: #0A0A0F

## Tipografia
- display: Space Grotesk
- body: Inter

## Componentes
- border-radius: 16px
- CTA: fundo primary, texto on-deep`),
      html("preview-html", "preview.html", "preview.html",
        miniHtml("Brand Preview", "Design System", "#8b5cf6",
          `<span class="kicker">DESIGN.md</span><h1>Preview da Marca</h1>
           <div class="card" style="border-color:#7C3AED"><button style="background:#7C3AED;color:#F5F0FF;border:none;padding:10px 20px;border-radius:16px;font-weight:600">CTA primário</button></div>
           <p style="color:#999;font-size:0.85rem">tokens.json · preview.html · .cohort-brand-choice</p>`)),
      pdf("preview-pdf", "preview.pdf", "preview.pdf", "preview-html")
    ],

    "metodo-funil": [
      md("funil-md", "funil.md", "funil.md", `# Mapa de Execução — N12

## Diagnóstico: Nível 4
Peças prescritas: **quiz-funil** + pagina-vendas

## Você está aqui
copy-funil ✓ → **quiz-funil** (próximo)

## Ordem N12 adaptada
1–5 ✓ · 6–8 ✓ · 9 quiz · 10 conteúdo · 11 email · 12 recuperação · 13 cro`),
      html("funil-html", "funil.html", "funil.html",
        miniHtml("Funil", "Mapa de Execução", "#8b5cf6",
          `<span class="kicker">metodo-funil</span><h1>Diagnóstico: Nível 4</h1>
           <div class="card"><strong>Próximo:</strong> /quiz-funil</div>
           <div class="card"><strong>Peça principal:</strong> Quiz de diagnóstico</div>`)),
      pdf("funil-pdf", "funil.pdf", "funil.pdf", "funil-html")
    ],

    "copy-funil": [
      md("copy-md", "copy.md", "copy.md", `# copy.md — Fonte única

## Big Idea
**Emagrecer sem recomeçar toda segunda-feira**

## Headlines
1. Como perder 8kg em 90 dias sem contar caloria
2. O erro que 9 em 10 mulheres cometem na dieta

## Bullets
- Fase 1: cardápio anti-inflamação 7 dias
- Fase 3: protocolo de manutenção permanente`)
    ],

    "vsl-funil": [
      mdInline("vsl-md", "vsl.md", "vsl.md", `# Roteiro VSL — Método Consistência 90

## Hook (0:00–0:30)
"Se você já perdeu peso e voltou tudo, o problema não é você..."

## Mecanismo (2:00–5:00)
Ciclo de 3 Fases explicado com analogia da "sanfona hormonal"

## Stack + CTA (12:00–15:00)
Oferta R$ 497 · Garantia 30 dias · CTA abaixo do vídeo`),
      htmlInline("vsl-page", "pagina/vsl.html", "pagina/vsl.html",
        miniHtml("VSL", "Página de VSL", "#f43f5e",
          `<span class="kicker">VSL Direct Response</span><h1>Emagreça sem recomeçar toda segunda</h1>
           <div class="card" style="aspect-ratio:16/9;background:#000;display:flex;align-items:center;justify-content:center;color:#555">▶ Vídeo VSL</div>
           <button style="background:#f43f5e;color:#fff;border:none;padding:12px 24px;border-radius:12px;width:100%;font-weight:600;margin-top:12px">QUERO COMEÇAR AGORA</button>`))
    ],

    "advertorial-funil": [
      mdInline("adv-md", "advertorial.md", "advertorial.md", `# Advertorial — Estilo editorial

## Lead
"Nutricionista revela por que 90% das dietas falham após 21 dias"

## Narrativa
História da Maria, 42 anos, que descobriu que o problema era inflamação...

## Transição
"Foi quando encontrei o protocolo de 3 fases que mudou tudo..."`),
      htmlInline("adv-page", "pagina/advertorial.html", "pagina/advertorial.html",
        miniHtml("Advertorial", "Pré-venda editorial", "#f43f5e",
          `<span class="kicker" style="color:#888;border-color:#444">Saúde & Bem-estar</span>
           <h1>Nutricionista revela por que 90% das dietas falham</h1>
           <p style="color:#888;font-size:0.9rem">Por Redação · 5 min de leitura</p>
           <div class="card">Maria tinha 42 anos quando percebeu que o problema não era falta de força de vontade...</div>`))
    ],

    "lancamento-funil": [
      mdInline("lanc-md", "lancamento.md", "lancamento.md", `# Lançamento PLF — Método Consistência 90

## Pré-lançamento (7 dias)
- PLC 1: Oportunidade (O ciclo de 3 fases)
- PLC 2: Transformação (Cases reais)
- PLC 3: Propriedade (Por que só nós temos)

## Carrinho
Abre: 14/07 · Fecha: 16/07 · Escassez: 50 vagas`),
      htmlInline("lanc-html", "lancamento.html", "lancamento.html",
        miniHtml("Lançamento", "PLF", "#f43f5e",
          `<span class="kicker">Product Launch Formula</span><h1>Sequência de Lançamento</h1>
           <table><tr><th>Fase</th><th>Conteúdo</th></tr>
           <tr><td>PLC 1</td><td>Oportunidade</td></tr><tr><td>PLC 2</td><td>Transformação</td></tr><tr><td>Abertura</td><td>14/07 — 50 vagas</td></tr></table>`))
    ],

    "webinario-funil": [
      mdInline("web-md", "webinario.md", "webinario.md", `# Webinário — Roteiro completo

## Abertura (10 min)
Promessa: "Como perder 8kg em 90 dias sem dieta restritiva"

## 3 Segredos
1. Por que contar caloria sabota seu metabolismo
2. O ritual de 12 minutos
3. A fase que 99% das dietas ignoram

## Fechamento
Stack + escassez: vagas limitadas ao vivo`),
      htmlInline("web-reg", "pagina/registro.html", "pagina/registro.html",
        miniHtml("Registro", "Webinário", "#f43f5e",
          `<span class="kicker">Aula ao vivo</span><h1>Descubra o método de 3 fases</h1>
           <div class="card"><input placeholder="Seu melhor e-mail" style="width:100%;padding:10px;background:#1a1a22;border:1px solid #333;border-radius:8px;color:#fff"></div>
           <button style="background:#f43f5e;color:#fff;border:none;padding:12px;width:100%;border-radius:12px;font-weight:600">RESERVAR MINHA VAGA</button>`))
    ],

    "quiz-funil": [
      md("quiz-md", "quiz.md", "quiz.md", `# Quiz — Qual seu perfil de emagrecimento?

## Perguntas (5)
1. Quantas dietas você já tentou?
2. O que mais te frustra hoje?
3. Quanto tempo tem por dia?
4. Já teve efeito sanfona?
5. O que te motiva mais?

## Resultados
- **Emocional** → oferta com comunidade
- **Racional** → oferta com dados e protocolo
- **Pragmático** → oferta com checklist rápido`),
      html("quiz-page", "pagina/quiz.html", "pagina/quiz.html",
        miniHtml("Quiz", "Diagnóstico", "#f43f5e",
          `<span class="kicker">Quiz</span><h1>Qual seu perfil de emagrecimento?</h1>
           <div class="card"><strong>Pergunta 1/5</strong><p>Quantas dietas você já tentou?</p>
           <p style="color:#888">○ Nenhuma · ○ 1-3 · ○ Mais de 3</p></div>`)),
      pdf("quiz-pdf", "pagina/quiz.pdf", "pagina/quiz.pdf", "quiz-page"),
      html("quiz-resultado", "pagina/resultado-emocional.html", "pagina/resultado-emocional.html",
        miniHtml("Resultado", "Perfil Emocional", "#f43f5e",
          `<span class="kicker">Quiz</span><h1>Seu perfil: Emocional</h1>
           <div class="card">Você precisa de consistência sem culpa — oferta com comunidade e suporte.</div>`)),
      pdf("quiz-resultado-pdf", "pagina/resultado-emocional.pdf", "pagina/resultado-emocional.pdf", "quiz-resultado")
    ],

    "pagina-vendas-funil": [
      mdInline("pv-md", "pagina/pagina-vendas.md", "pagina/pagina-vendas.md", `# Página de Vendas — 16 elementos

1. Headline: Como perder 8kg em 90 dias sem contar caloria
2. Sub: Sem dieta restritiva, sem efeito sanfona
3. VSL embed
4. Mecanismo único (3 fases)
5. Stack de valor
6. Ancoragem R$ 2.691 → R$ 497
7. Garantia 30 dias
8. FAQ (7 objeções)
9. CTA repetido (4x)`),
      htmlInline("pv-page", "pagina/index.html", "pagina/index.html",
        miniHtml("Página de Vendas", "16 elementos", "#f43f5e",
          `<span class="kicker">Alta conversão</span><h1>Como perder 8kg em 90 dias sem contar caloria</h1>
           <p style="color:#888">Sem dieta restritiva · Sem efeito sanfona</p>
           <div class="card"><s style="color:#666">R$ 2.691</s> <strong style="color:#f59e0b;font-size:1.3rem">R$ 497</strong></div>
           <button style="background:#f43f5e;color:#fff;border:none;padding:12px;width:100%;border-radius:12px;font-weight:600">QUERO COMEÇAR</button>`))
    ],

    "conteudo-funil": [
      mdInline("cont-md", "conteudo/roteiros.md", "conteudo/roteiros.md", `# Roteiros de Conteúdo — Semana 1

## Reel 1 (Nível 5 — problema)
**Hook:** "Você não é preguiçosa. Sua dieta é que está errada."
**Corpo:** 3 sinais de dieta inflamatória
**CTA:** Salva pra assistir depois

## Carrossel 1 (Nível 4)
7 slides: O ciclo da sanfona explicado`),
      folder("cont-folder", "conteudo/", "conteudo/",
        `# Pasta conteudo/\n\n\`\`\`\nconteudo/\n├── roteiros.md\n├── roteiros.html\n├── carrosseis/\n└── calendario-editorial.md\n\`\`\``)
    ],

    "criativos-funil": [
      mdInline("cri-md", "criativos/roteiros.md", "criativos/roteiros.md", `# Criativos — modelados do FitFlow

## Vídeo 1 (feed 4:5)
**Hook:** "Descobri o erro que 9 em 10 mulheres cometem"
**Corpo:** adaptado ao Método Consistência 90
**CTA:** Link na bio

## Banner estático (1:1)
Headline + mockup do produto + CTA`),
      folder("cri-folder", "criativos/banners/", "criativos/banners/",
        `# Galeria de banners\n\n\`\`\`\ncriativos/banners/\n├── feed-4x5-hook-a.png\n├── stories-9x16-hook-b.png\n└── quadrado-1x1-stack.png\n\`\`\`\n\nGerados na identidade do DESIGN.md`)
    ],

    "email-funil": [
      html("email-nut", "emails/nutricao.html", "emails/nutricao.html",
        miniHtml("E-mail", "Nutrição", "#3b82f6",
          `<div style="max-width:480px;margin:0 auto"><div style="background:#7C3AED;padding:20px;text-align:center"><strong style="color:#fff">Academia Fit</strong></div>
           <div class="card"><h1 style="font-size:1.2rem">Maria, você não falhou. A dieta falhou.</h1>
           <p>Nos próximos 5 dias vou te mostrar por que...</p></div></div>`)),
      html("email-venda", "emails/venda.html", "emails/venda.html",
        miniHtml("E-mail", "Venda", "#3b82f6",
          `<div class="card"><h1 style="font-size:1.1rem">Últimas 12 vagas — Método Consistência 90</h1>
           <p>R$ 497 · Garantia 30 dias</p>
           <button style="background:#3b82f6;color:#fff;border:none;padding:10px 20px;border-radius:8px">GARANTIR MINHA VAGA</button></div>`)),
      pdf("email-nut-pdf", "emails/nutricao.pdf", "emails/nutricao.pdf", "email-nut"),
      pdf("email-venda-pdf", "emails/venda.pdf", "emails/venda.pdf", "email-venda")
    ],

    "whatsapp-funil": [
      mdInline("wa-md", "whatsapp/sequencia.md", "whatsapp/sequencia.md", `# Sequência WhatsApp

## T+0 — Confirmação de compra
"Oi Maria! 🎉 Bem-vinda ao Método Consistência 90. Seu acesso: [link]"

## T+1h — Carrinho abandonado
"Vi que você quase entrou! Ainda temos sua vaga. Quer que eu te ajude?"

## T+3d — Re-engajamento
"Maria, sumiu? Ainda dá tempo de começar a Fase 1 essa semana."`)
    ],

    "mockup-produto-funil": [
      mdInline("mock-md", "mockups/prompts.md", "mockups/prompts.md", `# Prompts de Mockup

## Capa do ebook
"Ebook cover, fitness program, purple brand #7C3AED, title 'Método Consistência 90', professional, 3D soft shadow"

## Bundle empilhado
"Stack of 3 digital products, fitness niche, violet branding, white background"`),
      folder("mock-folder", "mockups/imagens/", "mockups/imagens/",
        `# Imagens geradas\n\n\`\`\`\nmockups/imagens/\n├── capa-ebook.png\n├── bundle-bonus.png\n└── device-mockup.png\n\`\`\``)
    ],

    "bonus-funil": [
      mdInline("bonus-md", "bonus/checklist.md", "bonus/checklist.md", `# Bônus: Checklist Semanal Anti-Sanfona

## Semana 1
- [ ] Cardápio anti-inflamação (7 dias)
- [ ] Ritual de 12 min (3x/semana)
- [ ] Pesagem: apenas domingo

## Semana 2
- [ ] Introduzir Fase 2
- [ ] Primeira refeição livre planejada`),
      htmlInline("bonus-html", "bonus/ebook.html", "bonus/ebook.html",
        miniHtml("Bônus", "Checklist Semanal", "#64748b",
          `<span class="kicker">Bônus #2</span><h1>Checklist Semanal Anti-Sanfona</h1>
           <div class="card">☐ Cardápio anti-inflamação<br>☐ Ritual 12 min<br>☐ Pesagem domingo</div>`))
    ],

    "recuperacao-funil": [
      md("rec-md", "recuperacao.md", "recuperacao.md", `# Sequência de Recuperação

## Carrinho abandonado (T+1h)
Assunto: Você esqueceu algo importante

## Cartão recusado (imediato)
WhatsApp: "Quer tentar em 2x?"

## Boleto (T+3d)
Última chance com bônus extra`),
      html("rec-html", "recuperacao.html", "recuperacao.html",
        miniHtml("Recuperação", "Cascata", "#f59e0b",
          `<span class="kicker">recuperacao-funil</span><h1>Cascata de Recuperação</h1>
           <table><tr><th>Trigger</th><th>Canal</th><th>Timing</th></tr>
           <tr><td>Carrinho</td><td>E-mail</td><td>T+1h</td></tr>
           <tr><td>Cartão</td><td>WhatsApp</td><td>Imediato</td></tr></table>`)),
      pdf("rec-pdf", "recuperacao.pdf", "recuperacao.pdf", "rec-html")
    ],

    "backend-funil": [
      md("be-md", "back-end.md", "back-end.md", `# Back-end — Maximização de Ticket

## Upsell 1 (pós-compra, 3–7s)
**Programa Avançado Fase 4** — R$ 197 (one-click)

## OTO (janela 4h)
**Consultoria individual 30min** — R$ 297

## Downsell (recusou upsell)
**Pack de receitas premium** — R$ 47`),
      htmlInline("upsell-page", "pagina/upsell.html", "pagina/upsell.html",
        miniHtml("Upsell", "One-Click", "#f59e0b",
          `<span class="kicker" style="color:#23e169;border-color:#23e169">Compra confirmada!</span>
           <h1>Espere — oferta exclusiva</h1>
           <div class="card"><strong>Programa Avançado Fase 4</strong><p>De R$ 497 por <strong style="color:#f59e0b">R$ 197</strong></p></div>
           <button style="background:#f59e0b;color:#000;border:none;padding:12px;width:100%;border-radius:12px;font-weight:700">SIM, QUERO ADICIONAR</button>`))
    ],

    "cro-funil": [
      mdInline("cro-md", "cro.md", "cro.md", `# Plano CRO

## KPIs atuais
| Etapa | Taxa |
|-------|------|
| LP → Checkout | 2.1% |
| Checkout → Compra | 68% |

## Teste A/B #1 (em andamento)
**Elemento:** Headline
**Hipótese:** Ângulo "sanfona" > ângulo "caloria"
**Mínimo:** 1.000 views · 1 teste por vez`),
      htmlInline("cro-html", "cro.html", "cro.html",
        miniHtml("CRO", "Otimização", "#ef4444",
          `<span class="kicker">cro-funil</span><h1>Dashboard de KPIs</h1>
           <table><tr><th>Etapa</th><th>Taxa</th></tr>
           <tr><td>LP → Checkout</td><td>2.1%</td></tr><tr><td>Checkout → Compra</td><td>68%</td></tr></table>
           <div class="card"><strong>Teste ativo:</strong> Headline A vs B</div>`))
    ],

    "status-funil": [
      mdInline("status-md", "status-checklist.md", "status-checklist.md", `# Status do Funil — academia-fit

## Você está aqui
**copy-funil** ✓ concluído

## Próximo passo único
Rode \`/quiz-funil\` — monta quiz de diagnóstico segmentado

## Checklist
| Skill | Status |
|-------|--------|
| avatar-funil | ✓ |
| espiao-do-concorrente | ✓ |
| offerbook | ✓ |
| design-md | ✓ |
| metodo-funil | ✓ |
| copy-funil | ✓ |
| quiz-funil | ○ pendente |
| pagina-vendas-funil | ○ pendente |
| email-funil | ○ pendente |
| recuperacao-funil | ○ pendente |
| cro-funil | ○ pendente |`)
    ]
  };

  /** Fallback genérico para outputs não mapeados */
  window.buildGenericArtifact = function (skill, outputLabel, index) {
    const safeName = outputLabel.replace(/\{[^}]+\}/g, "exemplo").replace(/\*/g, "");
    const isFolder = /\/(\.\.\.)?$|\*\/$/.test(outputLabel);
    const ext = safeName.includes(".") ? safeName.split(".").pop().toLowerCase() : "md";
    const format = isFolder ? "folder" : ext === "html" ? "html" : ext === "pdf" ? "pdf" : ext === "docx" ? "docx" : "md";
    const path = P(outputLabel.replace(/\{[^}]+\}/g, "exemplo"));

    let content = null;
    if (format === "folder") {
      content = `# Pasta: ${outputLabel}\n\n\`\`\`\nprojetos/${SLUG}/\n└── ${outputLabel.replace(/\*/g, "exemplo")}\n\`\`\``;
    } else if (format === "md") {
      content = `# ${outputLabel}\n\nGerado por **/${skill.id}**\n\nCaminho: \`${path}\``;
    } else if (format === "html") {
      content = miniHtml(outputLabel, `/${skill.id}`, "#a78bfa",
        `<span class="kicker">/${skill.id}</span><h1>${outputLabel}</h1><p>Caminho: <code>${path}</code></p>`);
    }

    const base = { id: `generic-${skill.id}-${index}`, label: outputLabel, path, format, content, generic: true };
  if (format === "pdf") {
    base.sampleUrl = null;
    base.htmlId = null;
  }
  return base;
  };
})();