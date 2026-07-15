---
status: Ready
story_id: "16.W2.1"
title: "Descoberta segura de artefatos e proveniência"
epic: 16
wave: "W2"
parent_epic: "docs/stories/epic-16/EPIC-16-CANONICAL-PROJECT.md"
effort: 8h
deploy_type: none
appetite: 1d
hill_phase: executing
confidence_level: know-how
involves_ui: true
task_mode: CRIAR
cli: codex
executor: "@dev"
quality_gate: "@architect"
model: "sonnet"
repo_target: "cohort-de-marketing"
accountable: "Rafael Costa"
depends_on: ["16.W1.1"]
consumes_artifacts_of: ["16.W1.1"]
entity_input:
  entity_type: "ProjectBrief"
  description: "ProjectBrief v1 validado e regras públicas de unlock da W1."
  status_expected: "canonical-v1"
entity_output:
  entity_type: "ArtifactIndex"
  description: "Índice reproduzível, confinado e sem conteúdo bruto dos artefatos do projeto."
  status_expected: "verified-or-pending-confirmation"
file_scope: shared
touched_paths:
  - "data/skill-unlock-rules.json"
  - "scripts/project-artifact-index.mjs"
  - "scripts/project-artifact-index.test.mjs"
  - "briefing.html"
  - "aula-03/materiais/briefing.html"
  - "docs/stories/epic-16/STORY-16.W2.1-artifact-discovery-provenance.md"
  - "docs/stories/epic-16/evidence/STORY-16.W2.1.md"
affected_paths:
  - "data/skill-unlock-rules.json"
  - "scripts/project-artifact-index.mjs"
  - "scripts/project-artifact-index.test.mjs"
  - "briefing.html"
  - "aula-03/materiais/briefing.html"
  - "docs/stories/epic-16/STORY-16.W2.1-artifact-discovery-provenance.md"
  - "docs/stories/epic-16/evidence/STORY-16.W2.1.md"
---

# STORY-16.W2.1 - Descoberta segura de artefatos e proveniência

> **Depends On:** `16.W1.1`
> **Estimated Effort:** 8h

## Story

**As a / Como** operador que retoma um projeto local
**I want / Quero** descobrir artefatos por um indexador confinado e verificável
**so that / Para** usar evidência real de progresso sem expor conteúdo ou confiar em declarações manuais.

## Acceptance Criteria

- [ ] AC1: Dado um `projetos/{slug}/` válido, o indexador lê exclusivamente os globs declarados em `skill-unlock-rules.json`; arquivo fora desses globs não aparece no resultado.
- [ ] AC2: Cada entrada do índice contém tipo, path POSIX relativo ao projeto, SHA-256 do arquivo, tamanho em bytes, origem e estado de confirmação; duas execuções sem mudança geram saída semanticamente idêntica.
- [ ] AC3: Path absoluto, traversal e symlink cujo destino escape de `projetos/{slug}/` falham fechado, com erro tipado que não ecoa conteúdo sensível.
- [ ] AC4: Artefato apenas inferido permanece `pending_confirmation` e não satisfaz requisito crítico enquanto a regra declarar confirmação obrigatória; a confirmação explícita altera somente o estado da entrada correspondente.
- [ ] AC5: O índice serializado não contém conteúdo bruto, credenciais ou paths absolutos; fixtures adversariais provam a recusa e as duas cópias do briefing consomem o mesmo contrato.

## Tasks

- [ ] Confirmar o baseline `06e2b64`, a dependência `16.W1.1` como `Done` e ausência de PR cobrindo o escopo.
- [ ] Congelar fixtures e testes para projeto válido, ausente, duplicado, traversal, path absoluto e symlink de escape.
- [ ] Implementar o indexador e a integração do briefing somente dentro da File List aprovada.
- [ ] Rodar testes unitários, reprodutibilidade, scan de conteúdo sensível e smoke HTTP das duas cópias.
- [ ] Registrar evidência sanitizada, atualizar checkboxes, File List real e epic state no fan-in.

## File List proposta

- `data/skill-unlock-rules.json`
- `scripts/project-artifact-index.mjs`
- `scripts/project-artifact-index.test.mjs`
- `briefing.html`
- `aula-03/materiais/briefing.html`
- `docs/stories/epic-16/STORY-16.W2.1-artifact-discovery-provenance.md`
- `docs/stories/epic-16/evidence/STORY-16.W2.1.md`

A File List é a allow-list inicial e corresponde a `touched_paths` e
`affected_paths`. Criação ou alteração fora dela exige atualizar a story e
repetir a validação de arquitetura antes de implementar.

## Dev Notes

- Baseline integrado: `06e2b64`. O ProjectBrief v1 da `16.W1.1` já compõe a branch; não reaplique commits da W1.
- O helper CLI é a única superfície autorizada a ler o filesystem. O browser importa o índice validado e não recebe acesso irrestrito a diretórios.
- Normalize e compare paths antes de abrir arquivos; resolva symlinks e prove que o destino real permanece sob a raiz selecionada.
- Hash, tamanho e proveniência são metadados. Não armazene bytes, snippets, secrets ou paths da máquina na evidência.
- `data/skill-unlock-rules.json` é compartilhado com a `16.W2.3`; a sequência da wave impede escrita concorrente.
- `deploy_type: none`: não há publicação externa; o smoke local continua obrigatório.

## Executor Assignment

```yaml
executor: "@dev"
quality_gate: "@architect"
model: "sonnet"
quality_gate_tools: ["node:test", "filesystem-adversarial-fixtures", "http-smoke"]
repo_target: "cohort-de-marketing"
```

## Validação

- Fixtures de projeto válido, ausente, duplicado, traversal, absoluto e symlink de escape.
- SHA-256 e índice semanticamente estáveis em duas execuções.
- Teste que prova ausência de conteúdo bruto e paths absolutos no índice.
- Smoke HTTP nas duas cópias distribuídas do briefing.

## Stop Conditions

- Descoberta exigir varrer fora de `projetos/{slug}/`.
- Regra de unlock não distinguir existência de confirmação.
- Índice precisar persistir conteúdo bruto ou credencial.

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-07-15 | @po | Contrato enriquecido e validado para execução na PUB-16 W2. |
