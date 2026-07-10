---
status: InProgress
story_id: "9.W3.1"
title: "Evidência de usabilidade e métricas do piloto"
epic: 9
wave: "W3"
parent_epic: "docs/stories/epic-9/EPIC-9-GO-LIVE-AULA-3.md"
deploy_type: none
appetite: 1d
hill_phase: figuring_out
confidence_level: low
involves_ui: false
executor: "@analyst"
quality_gate: "@po"
accountable: "Rafael Costa"
depends_on: ["9.W2.3"]
consumes_artifacts_of: ["9.W2.3"]
file_scope: exclusive
touched_paths:
  - "docs/qa/epic-9-field-usability.md"
  - "data/pilots/epic-9-field-observation.schema.json"
---

# STORY-9.W3.1 - Evidência de usabilidade e métricas do piloto

## Acceptance Criteria

1. Pelo menos um operador-alvo executa o roteiro sem assistência de desenvolvimento.
2. Registro contém tempos, hesitações, bloqueios, recuperações e resultado por etapa.
3. Nenhuma PII, senha, token ou conteúdo privado entra na evidência.
4. Achados são separados em blocker, correção pré-go-live e backlog.
5. Métricas não são convertidas em promessa antes do reality-check.

## Tasks

- [x] Preparar roteiro e consentimento de observação.
- [ ] Observar execução e registrar evidência estruturada.
- [ ] Classificar achados e recomendar gate.

## File List

| Arquivo | Operação |
|---|---|
| `data/pilots/epic-9-field-observation.schema.json` | ADD |
| `docs/qa/epic-9-field-usability.md` | ADD |
| `docs/stories/epic-9/STORY-9.W3.1-field-usability-evidence.md` | MODIFY |

## Analyst Record

### Infraestrutura preparada

- Protocolo de recrutamento, consentimento, não intervenção, medição por etapa,
  sanitização, classificação e reality-check documentado no relatório de campo.
- JSON Schema Draft 2020-12 fail-closed separa o estado `pending` de uma sessão
  `completed` e proíbe PII, segredos, conteúdo privado e gravação bruta.
- Formulário pendente contém as sete etapas da jornada e nenhum participante,
  sessão, tempo, evidência, achado ou conclusão humana inventada.

### Bloqueio factual

O AC1 requer uma pessoa real do público-alvo operando sem assistência de
desenvolvimento. Nenhuma sessão humana foi realizada nesta execução. Por isso,
a observação, a classificação factual e a recomendação final continuam abertas;
os passos exatos de coleta estão em `docs/qa/epic-9-field-usability.md`.

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-07-10 | @analyst | Preparados schema, protocolo, formulário, política de privacidade, classificação e gate; story mantida InProgress aguardando observação real. |
