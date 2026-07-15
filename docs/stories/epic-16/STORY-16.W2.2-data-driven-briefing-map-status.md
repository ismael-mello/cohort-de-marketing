---
status: Ready
story_id: "16.W2.2"
title: "Briefing, mapa e status orientados por catálogo"
epic: 16
wave: "W2"
parent_epic: "docs/stories/epic-16/EPIC-16-CANONICAL-PROJECT.md"
effort: 8h
deploy_type: none
appetite: 1d
hill_phase: executing
confidence_level: know-how
involves_ui: true
task_mode: REFATORAR
cli: codex
executor: "@dev"
quality_gate: "@qa"
model: "sonnet"
repo_target: "cohort-de-marketing"
accountable: "Rafael Costa"
depends_on: ["16.W1.1", "16.W2.1"]
consumes_artifacts_of: ["16.W1.1", "16.W2.1"]
entity_input:
  entity_type: "ArtifactIndex"
  description: "ProjectBrief v1, catálogo, regras de unlock e índice verificado da W2.1."
  status_expected: "verified-or-pending-confirmation"
entity_output:
  entity_type: "PublicSkillSurfaces"
  description: "Briefing, mapa e status derivados dos mesmos contratos públicos."
  status_expected: "catalog-driven"
file_scope: shared
touched_paths:
  - "briefing.html"
  - "mapa-skills.html"
  - "mapa-skills-artifacts.js"
  - "aula-03/materiais/briefing.html"
  - "aula-03/materiais/mapa-skills.html"
  - "aula-03/materiais/mapa-skills-artifacts.js"
  - "data/skill-catalog.json"
  - "data/skill-unlock-rules.json"
  - "scripts/validate-mapa-wiring.mjs"
  - "scripts/validate-skill-catalog.mjs"
  - "scripts/skill-surface-data-driven.test.mjs"
  - "docs/stories/epic-16/STORY-16.W2.2-data-driven-briefing-map-status.md"
  - "docs/stories/epic-16/evidence/STORY-16.W2.2.md"
affected_paths:
  - "briefing.html"
  - "mapa-skills.html"
  - "mapa-skills-artifacts.js"
  - "aula-03/materiais/briefing.html"
  - "aula-03/materiais/mapa-skills.html"
  - "aula-03/materiais/mapa-skills-artifacts.js"
  - "data/skill-catalog.json"
  - "data/skill-unlock-rules.json"
  - "scripts/validate-mapa-wiring.mjs"
  - "scripts/validate-skill-catalog.mjs"
  - "scripts/skill-surface-data-driven.test.mjs"
  - "docs/stories/epic-16/STORY-16.W2.2-data-driven-briefing-map-status.md"
  - "docs/stories/epic-16/evidence/STORY-16.W2.2.md"
---

# STORY-16.W2.2 - Briefing, mapa e status orientados por catálogo

> **Depends On:** `16.W1.1`, `16.W2.1`
> **Estimated Effort:** 8h

## Story

**As a / Como** aluno que consulta o briefing e o mapa do mesmo projeto
**I want / Quero** que todas as superfícies derivem skills, dependências e estados dos contratos canônicos
**so that / Para** receber a mesma leitura de progresso sem contagens ou regras duplicadas no HTML.

## Acceptance Criteria

- [ ] AC1: Briefing e mapa renderizam exatamente os IDs presentes em `skill-catalog.json`; inserir ou remover uma fixture de skill altera as superfícies sem editar literal de contagem no HTML.
- [ ] AC2: Edges, requisitos, artefatos e estados exibidos são derivados de `skill-catalog.json`, `skill-unlock-rules.json`, ProjectBrief v1 e ArtifactIndex; fixture com divergência faz o validator falhar.
- [ ] AC3: As cópias da raiz e de `aula-03/materiais/` permanecem byte a byte equivalentes para cada artefato distribuído alterado.
- [ ] AC4: Catálogo ou regra ausente, malformada ou com referência órfã produz erro único, acionável e fail-closed; nenhuma superfície renderiza mapa parcial como válido.
- [ ] AC5: O validator percorre todas as skills canônicas e falha quando qualquer ID, edge, requisito ou estado esperado não estiver representado; o browser smoke passa sem erro de console nas duas URLs.

## Tasks

- [ ] Confirmar o fan-in da `16.W2.1` como `Done` e ausência de PR cobrindo o escopo.
- [ ] Congelar testes para catálogo válido, skill ausente, edge órfã, regra inválida e paridade das cópias.
- [ ] Remover literais e regras concorrentes das superfícies dentro da File List aprovada.
- [ ] Rodar validators, testes de contrato, paridade byte a byte e browser smoke HTTP nas duas distribuições.
- [ ] Registrar evidência sanitizada, atualizar checkboxes, File List real e epic state no fan-in.

## File List proposta

- `briefing.html`
- `mapa-skills.html`
- `mapa-skills-artifacts.js`
- `aula-03/materiais/briefing.html`
- `aula-03/materiais/mapa-skills.html`
- `aula-03/materiais/mapa-skills-artifacts.js`
- `data/skill-catalog.json`
- `data/skill-unlock-rules.json`
- `scripts/validate-mapa-wiring.mjs`
- `scripts/validate-skill-catalog.mjs`
- `scripts/skill-surface-data-driven.test.mjs`
- `docs/stories/epic-16/STORY-16.W2.2-data-driven-briefing-map-status.md`
- `docs/stories/epic-16/evidence/STORY-16.W2.2.md`

A File List é a allow-list inicial e corresponde a `touched_paths` e
`affected_paths`. Criação ou alteração fora dela exige atualizar a story e
repetir a validação de arquitetura antes de implementar.

## Dev Notes

- A execução só inicia depois do fechamento da `16.W2.1`; consuma o ArtifactIndex entregue no fan-in, sem criar um segundo indexador no browser.
- Preserve as 31 skills e 41 edges do baseline como fixture de regressão, mas derive a quantidade corrente do catálogo em runtime e nos validators.
- `skill-catalog.json` define identidade e grafo; `skill-unlock-rules.json` define requisitos. O HTML não pode copiar essas estruturas como segunda fonte.
- Falha de fetch ou validação deve bloquear a interpretação do estado e explicar o artefato inválido sem expor ProjectBrief ou conteúdo local.
- Os arquivos de raiz e `aula-03/materiais/` são distribuições equivalentes, não implementações independentes.
- `deploy_type: none`: não há publicação externa; browser smoke local continua obrigatório.

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@qa"
model: "sonnet"
quality_gate_tools: ["node:test", "catalog-validators", "playwright"]
repo_target: "cohort-de-marketing"
```

## Validação

- Validação estrutural da fixture atual de 31 skills e 41 edges.
- Casos negativos para skill ausente, edge órfã, regra inválida e fetch ausente.
- Paridade byte a byte dos artefatos distribuídos alterados.
- Browser smoke por HTTP local nas duas URLs, sem erro de console.

## Stop Conditions

- Mudança reduzir detalhe hoje disponível no mapa.
- Solução duplicar catálogo ou regras dentro do HTML.
- Superfície aceitar estado parcial como se fosse canônico.

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-07-15 | @po | Contrato enriquecido e validado para execução sequencial na PUB-16 W2. |
