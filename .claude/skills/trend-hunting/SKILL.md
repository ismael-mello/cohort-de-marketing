---
name: trend-hunting
description: "Identifica tendencias emergentes no nicho usando Claude + Twitter/X + Apify. Mapeia formatos virais (Reels, carousels, threads), detecta timing antes da saturacao, gera 2+ variacoes de hook e identifica vencedor por engajamento. Output: relatorio de tendencias acionavel + variacoes prontas para teste. Triggers: 'tendencias', 'trends', 'trend hunting', '/trend-hunting', 'o que ta bombando', 'formato viral'."
user_invocable: true
---

# Trend Hunting (Caca de Tendencias)

## Posicao na Aula 01

Esta e a **Skill 3 de 5** da Aula 01 do Cohort de Marketing.

**Sequencia:** `/avatar-funil` -> `/espiao-do-concorrente` -> `/trend-hunting` (voce esta aqui) -> `/swipe-file` -> `/offerbook`.

### Gate de pre-requisito (executar ANTES de qualquer coisa)

Antes de comecar, **verifique no diretorio atual** se existe `relatorio-avatar.md`:

```
ls relatorio-avatar.md 2>/dev/null
```

**Se NAO existir**, exiba este aviso e pergunte:

> Detectei que voce ainda nao rodou `/avatar-funil` neste projeto. Sem avatar, as variacoes de hook saem genericas (sem ancora no que o seu cliente realmente diz).
>
> Recomendo voltar e rodar `/avatar-funil` primeiro. Quer continuar mesmo assim? (s/n)

Se o usuario responder `n`, encerre dizendo: *"Beleza. Rode `/avatar-funil [nicho]` e volte aqui depois."*

Se responder `s`, prossiga mas marque no relatorio que as variacoes nao foram ancoradas em avatar real.

**Se EXISTIR**, leia rapidamente o avatar (vocabulario do cliente, dor principal) e use essa linguagem nas variacoes de hook. Mencione: *"Encontrei seu avatar. Vou ancorar as variacoes na linguagem dele."*

---

Esta skill detecta **tendencias emergentes** no seu nicho ANTES de virarem saturadas. Mapeia formatos virais (Reels, carousels, threads, vsl curta), identifica timing de entrada e gera variacoes prontas para testar.

A regra: voce nao quer pegar tendencia no pico (todo mundo ja fez). Quer pegar **na rampa de subida** (timing de 2-3 semanas antes da saturacao).

---

## Quando usar

- Briefing semanal de criativos (alimenta /swipe-file e media buyer)
- Lancamento de oferta nova (escolher formato com tracao)
- Diagnostico de campanha que perdeu performance (saturacao de formato)
- Gatilhos: "tendencias", "o que ta bombando", "formato viral", "trend hunting"

## Como ativar

`/trend-hunting [nicho]` — ex.: `/trend-hunting marketing-digital-br`.

Se nao vier o nicho, **pergunte e PARE** ate receber.

---

## Pre-requisitos

1. **Nicho ou palavras-chave** definidas (5-10 termos)
2. **Acesso a Twitter/X** (busca publica, sem login obrigatorio)
3. **Apify MCP** (opcional, para scrape de TikTok/Instagram)
4. **Output do `/pesquisa-de-avatar`** (recomendado) — para filtrar tendencias relevantes ao perfil do cliente

---

## Pipeline (passo a passo)

### Etapa 1 — Definir palavras-chave de busca

Apartir do nicho, gerar 5-10 termos de busca em 3 categorias:

- **Termos diretos** (nome do nicho: "contabilidade", "escritorio contabil")
- **Termos de dor** (problemas: "perda de cliente", "atendimento lento")
- **Termos de solucao** (o que oferece: "automatizar contabilidade", "IA contabil")

### Etapa 2 — Scan em 4 fontes

**A. Twitter/X** (busca publica)
- Buscar cada termo
- Filtrar posts dos ultimos 14 dias com 100+ likes
- Capturar: texto do post, formato (thread, single, video), engajamento

**B. Instagram Reels** (via Apify ou manual)
- Buscar hashtags do nicho
- Capturar Reels com 50k+ views dos ultimos 14 dias
- Estrutura: hook (primeiros 3s), formato, narrativa, CTA

**C. TikTok** (via Apify ou manual)
- Mesmo processo dos Reels
- Atentar a formatos especificos de TikTok (POV, story, tutorial)

**D. LinkedIn** (se nicho B2B)
- Posts com 500+ reacoes ultimos 14 dias
- Formato: carousel PDF, post longo, video, enquete

### Etapa 3 — Identificacao de padroes

Agrupar achados em **padroes recorrentes**:

- **Padrao de hook** (3 primeiras linhas / 3 primeiros segundos)
- **Padrao de estrutura** (problema-agitacao-solucao, antes-depois, lista, narrativa, etc.)
- **Padrao de formato** (single image, carousel, video curto, video longo, thread)
- **Padrao de CTA** (link na bio, DM, comentar palavra, etc.)

Para cada padrao, registrar:
- 5 exemplos verbatim (com link)
- Engajamento medio
- Timing (quando comecou a aparecer)

### Etapa 4 — Classificacao por timing

Cada padrao em 1 das 4 fases:

- **Emergente** (1-3 semanas, baixo volume mas crescendo) — **timing ideal**
- **Em alta** (3-6 semanas, volume crescente) — ainda OK, mais saturado
- **Pico** (6-10 semanas, alto volume) — risco de saturacao
- **Declinio** (10+ semanas, queda de engajamento) — evitar

Output: 3-5 padroes na fase **emergente** + 2-3 na fase **em alta** para experimentar.

### Etapa 5 — Geracao de variacoes (2+ por padrao)

Para cada padrao escolhido, gerar 2-4 variacoes adaptadas ao seu nicho:

- **Variacao A** (replica do padrao com seu produto)
- **Variacao B** (adaptacao com angulo do seu ICP)
- **Variacao C** (opcional, hibrido com outro padrao em alta)

Cada variacao com:
- Hook (texto exato)
- Estrutura (bullet do conteudo)
- Formato (imagem, video, carousel, etc.)
- CTA

### Etapa 6 — Briefing para teste

Saida final: briefing acionavel para o Media Buyer ou Designer testar as variacoes em 2 plataformas (Meta + Google ou Meta + TikTok), com:

- Orcamento de teste sugerido (R$ 200-500 por variacao por 3 dias)
- Metrica vencedora (CTR + CPL + watch time)
- Criterio de vencedor (qual variacao escala, qual mata)

---

## Output

A skill gera 7 arquivos no total (MD + HTML + PDF dos 2 entregaveis visuais, mais o briefing):

**Trends (3 formatos):**
1. `trends-{nicho}-{data}.md` — relatorio completo com 4 fontes, padroes identificados, classificacao por timing
2. `trends-{nicho}-{data}.html` — versao visual
3. `trends-{nicho}-{data}.pdf` — versao para imprimir/compartilhar

**Variacoes (3 formatos):**
4. `variacoes-teste-{data}.md` — lista de variacoes prontas para teste, com hook + estrutura + CTA
5. `variacoes-teste-{data}.html` — versao visual em cards
6. `variacoes-teste-{data}.pdf` — versao para imprimir/compartilhar

**Briefing:**
7. `briefing-media-buyer.md` — briefing acionavel com orcamento e metricas (so MD, e arquivo de trabalho)

### Como gerar os 7 arquivos

**Passo 1 — Aplicar gate de brand-choice** (segue `_shared/brand-choice.md`):

```
ls .cohort-brand-choice 2>/dev/null
```

- Se existir, ler e usar a escolha salva (neutro ou design-md)
- Se nao existir, perguntar (3 opcoes) e salvar

**Passo 2 — Gerar os 3 MD** (trends, variacoes, briefing) conforme as etapas anteriores

**Passo 3 — Gerar os 2 HTML** copiando os templates:

Para `trends-{nicho}-{data}.html`, copiar `templates/trends.html` e substituir:
- `{{TITULO}}` — nicho (ex.: "Marketing digital para advogados")
- `{{SUBTITULO}}` — fontes + amostra (ex.: "Twitter/X + Reels + TikTok + LinkedIn · 47 padroes")
- `{{DATA}}` — data de hoje
- `{{MARCA}}` — vazio se neutro, ou nome do `DESIGN.md`
- `{{CONTEUDO}}` — secoes em HTML com `<h2>`, `<h3>`, `<table>`, `<blockquote class="padrao">`. Use os badges `<span class="timing emergente">`, `<span class="timing em-alta">` e `<span class="timing saturado">` ao lado dos padroes.

Para `variacoes-teste-{data}.html`, copiar `templates/variacoes.html` e substituir:
- `{{TITULO}}` — nicho
- `{{SUBTITULO}}` — quantidade de variacoes (ex.: "12 variacoes prontas para teste A/B")
- `{{CONTEUDO}}` — cada variacao envolvida em `<div class="variacao">`:

```html
<div class="variacao">
  <span class="numero">Variacao 1 — Formato: Reels POV</span>
  <p class="hook">"Voce nunca mais vai escrever uma peticao do zero depois de ver isso"</p>
  <ul class="estrutura">
    <li>0-3s: gancho visual (cliente bravo na delegacia)</li>
    <li>3-10s: revelacao (modelo de IA pronto)</li>
    <li>10-20s: demo rapida</li>
    <li>20-25s: CTA</li>
  </ul>
  <p class="meta"><strong>Tom:</strong> direto · <strong>Persona:</strong> advogado autonomo</p>
  <span class="cta">CTA: link na bio</span>
</div>
```

Se brand-choice = `design-md`, ler `DESIGN.md` e substituir os tokens em `:root` (cores e fontes) pelos do aluno.

**Passo 4 — Gerar os 2 PDF** rodando o script sobre cada HTML:

```
bash scripts/gerar_pdf.sh trends-{nicho}-{data}.html
bash scripts/gerar_pdf.sh variacoes-teste-{data}.html
```

**Passo 5 — Abrir HTML automaticamente** (so os 2 visuais, briefing-media-buyer fica em MD):

```
open trends-{nicho}-{data}.html
open variacoes-teste-{data}.html
```

(Windows: `start`. Linux: `xdg-open`.)

Diga ao usuario: *"Abri o trend report e as variacoes no seu navegador."*

---

## Prompts internos (Claude)

### Prompt 1 — Analise de Twitter/X

```
Voce e analista de tendencias de midia social. Vou colar 30 posts de Twitter/X do nicho [nicho] dos ultimos 14 dias com 100+ likes.

Identifique:
1. Os 5 padroes de hook mais recorrentes (texto literal do hook)
2. Para cada padrao: 3 exemplos verbatim com link
3. Engajamento medio (likes/replies/retweets)
4. Timing estimado (quando esse padrao apareceu na timeline)
5. Classificacao: emergente / em alta / pico / declinio

Posts:
[colar 30 posts com link]
```

### Prompt 2 — Geracao de variacoes

```
Tenho um padrao de tendencia emergente: [colar padrao + 3 exemplos]

Meu produto e: [briefing]
Meu ICP e: [colar 1 paragrafo do /pesquisa-de-avatar]

Gere 3 variacoes adaptadas:
- Variacao A: replica fiel do padrao com meu produto
- Variacao B: adaptacao com angulo do meu ICP
- Variacao C: hibrido (combina este padrao com outro complementar)

Para cada variacao:
- Hook (texto exato, primeiras 3 linhas ou 3 segundos)
- Estrutura completa (bullet do conteudo)
- Formato sugerido
- CTA

E recomende qual testar primeiro e por que.
```

---

## Regras

- **Sempre cite link da fonte.** Sem link, vira invencao.
- **Foque em conteudo organico**, nao em ads pagos (esses sao analisados pelo `/espiao-do-concorrente`).
- **Janela de tempo: 14 dias.** Mais que isso, ja e tendencia velha.
- **Engajamento minimo** para considerar: 100 likes (Twitter), 50k views (Reels/TikTok), 500 reacoes (LinkedIn).
- **Saida do timing classification** e o que importa. Padrao em "pico" entra como aviso, nao como recomendacao.

---

## Checklist de qualidade

**Fundacao**
- [ ] Nicho e palavras-chave definidos (5-10 termos)
- [ ] 4 fontes scaneadas (ou pelo menos 2 das mais relevantes ao formato)
- [ ] Janela de 14 dias respeitada

**Padroes**
- [ ] 5-10 padroes identificados com 3+ exemplos verbatim cada
- [ ] Engajamento medio documentado
- [ ] Timing classificado (emergente/em alta/pico/declinio)

**Variacoes**
- [ ] 2-4 variacoes geradas para cada padrao escolhido
- [ ] Hook, estrutura, formato, CTA preenchidos
- [ ] Adaptadas ao ICP (se ICP disponivel)

**Briefing**
- [ ] Orcamento de teste sugerido
- [ ] Metrica vencedora definida
- [ ] Criterio de vencedor explicito

---

## Anti-patterns (NUNCA fazer)

- Recomendar tendencia em "pico" como prioridade (vai dar fadiga rapido)
- Citar exemplo sem link de origem
- Generalizar de 5 posts para "a tendencia toda"
- Misturar conteudo organico com ads (usar /espiao-do-concorrente para ads)
- Pular Etapa 5 (variacoes) e mandar so o relatorio sem acionavel

---

## Conexao com outras skills

```
/avatar-funil (pre-requisito recomendado)
    ↓
/trend-hunting (esta skill)
    ↓ trends-{nicho}-{data}.md + variacoes-teste-{data}.md + briefing-media-buyer.md
/swipe-file (organiza criativos winners apos teste)
    ↓
/offerbook
```

## Anuncio de fechamento (proxima skill)

Apos gerar os 7 arquivos, **sempre** diga ao usuario em texto separado:

> Skill 3/5 entregue. Voce tem agora 7 arquivos:
> - trends-{nicho}-{data}.md / .html (abri pra voce) / .pdf
> - variacoes-teste-{data}.md / .html (abri pra voce) / .pdf
> - briefing-media-buyer.md
>
> **Proxima skill da Aula 01:** `/swipe-file capturar`
>
> Swipe file vai organizar os criativos vencedores do `/espiao` e do `/trend-hunting` numa biblioteca pesquisavel. Ela alimenta Copy e Media Buyer.

Nao pule esse anuncio — e o que orienta o aluno a seguir o trilho da Aula 01.
