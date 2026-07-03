# Changelog — Cohort de Marketing (material das aulas)

Registro das mudanças no material e nas skills. Mantido pela equipe; os alunos não precisam ler.

---

## 2026-07-03 — Ajustes nas skills a partir do test-drive completo (commit `66b9d54`)

Rodada de teste de ponta a ponta no projeto-cobaia `projetos/mentoria-ia-empresarios/`: todas as skills de peça foram exercitadas (inclusive os caminhos de falha de ferramenta). Dois SKILL.md ganharam regras novas e uma skill ganhou os scripts que faltavam.

### `/conteudo-funil` — galeria de PNGs no Book (regra nova)

- **Render de carrossel, passo 5 (obrigatório):** todo lote de PNGs gerado ganha uma galeria `projetos/{slug}/carrossel/index.html` na identidade do `DESIGN.md`, com link fixo "← Book do Funil"; o card do carrossel no Book aponta SEMPRE pra galeria (nunca pra slide HTML solto nem pra pasta). Carrosséis novos entram na mesma galeria, em seções.
- **Origem:** teste do carrossel C1; feedback da Érica: "cadê o PNG no Book?" — PNG pronto não pode ficar invisível pro dono.

### `/criativos-funil` — perguntas de ativação, banners estáticos e scripts próprios

- **Ativação, passo 3 (novo):** perguntas obrigatórias ANTES de gerar qualquer peça, com "PARE até responder" (o padrão da /conteudo-funil): rede/canal → tipo de peça (roteiros de vídeo, banners ou ambos) → formatos/posicionamentos → escopo. Depois delas, continua valendo 1 amostra antes do lote.
- **Seção nova "Banners estáticos":** pipeline HTML → PNG com os tokens do `DESIGN.md`; dimensão exata por posicionamento (feed 4:5 1080x1350 · stories/reels 9:16 1080x1920 · quadrado 1:1 1080x1080); nomenclatura por formato (`feed-*`, `story-*`) pra renderizar cada formato no tamanho certo; anatomia do banner estático (hook do banco do copy.md como texto dominante; base livre nos stories por causa do CTA nativo do Meta); compliance por rede; galeria obrigatória no Book (`criativos/banners/index.html`).
- **`scripts/` criada (correção de bug):** o SKILL.md referenciava `scripts/gerar_pdf.sh`, mas a pasta não existia. Entraram: `gerar_pdf.sh` (idêntico ao das demais skills — manter sincronizado) e `gerar_png.sh` **parametrizado** (`<pasta> [largura] [altura] [prefixo]`, um passe por formato) — resolve a limitação da janela fixa 1080x1350 que cortaria os 9:16.
- **Descrição do frontmatter:** a skill agora também é acionada por "criar banner de anúncio".
- **Origem:** teste dos criativos; feedbacks da Érica: "deveria me perguntar, como o de conteúdo pergunta", "pra qual rede também", "isso não tem na skill hoje né?".

### Achados de teste registrados (sem mudança de código)

- A cascata de fallback de coleta funcionou como desenhada: Apify (cota mensal estourada, avisada na hora) → Chrome ao vivo (extensão desconectada) → modelagem por dossiê/swipe com rótulo "métrica não obtida", sem número inventado.
- Os gates de adequação das skills de formato (webinário, advertorial, lançamento) seguraram corretamente a montagem por engano: as três peças foram estruturadas conscientemente como "gaveta" das Fases 2-3, com gates documentados no funil.md do projeto.

### Publicação (estado em 03/07)

- Commit `66b9d54` pronto na branch `aula-02-preparacao`, aguardando push pro repo **marketingLendario/cohort-de-marketing-aula-02** — que ainda **não existe** no GitHub (a conta `gh` local, legendsco888, não tem permissão de criar repositório na org). Destravar: criar o repo na org (sugestão: privado enquanto em preparação, sem README inicial) e rodar `git push aula02 aula-02-preparacao:main`.
- O repo da Aula 1 (`cohort-de-marketing`) permanece congelado — nenhum push pro `origin`.
