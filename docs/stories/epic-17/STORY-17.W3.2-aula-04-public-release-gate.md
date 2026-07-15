---
status: InProgress
story_id: "17.W3.2"
title: "Gate público da Aula 4"
epic: 17
wave: "W3"
parent_epic: "docs/stories/epic-17/EPIC-17-AULA-04-DATA-FOUNDATION.md"
effort: 8h
deploy_type: none
appetite: 1d
hill_phase: uphill
confidence_level: know-how
involves_ui: false
task_mode: VALIDAR
cli: codex
model: opus
executor: "@qa"
quality_gate: "@architect"
repo_target: "marketingLendario/cohort-de-marketing"
accountable: "Rafael Costa"
depends_on: ["17.W3.1"]
consumes_artifacts_of: ["17.W1.1", "17.W1.2", "17.W2.1", "17.W2.2", "17.W2.3", "17.W3.1"]
entity_input:
  entity_type: "Aula04StudentWalkthroughV1"
  description: "Contratos W1/W2 e módulo W3.1 integrados, com exemplo sintético de três semanas, decisão histórica aprovada e próximo sign-off pendente."
  status_expected: "implemented-and-locally-verified"
entity_output:
  entity_type: "Aula04PublicReleaseGateV1"
  description: "Gate local reproduzível que prova compatibilidade Aula 3, walkthrough, contratos, mirrors, distribuição e privacidade antes do fan-in."
  status_expected: "release-ready-for-independent-signoff"
artifact_contract:
  type: "release-gate-evidence"
  path: "docs/stories/epic-17/evidence/STORY-17.W3.2.md"
  release_manifest: "docs/releases/aula-04-data-loop-v1.md"
  required_signoffs: ["@po", "@qa", "@architect"]
touched_paths:
  - "scripts/aula-04-release-gate.test.mjs"
  - "docs/releases/aula-04-data-loop-v1.md"
  - "docs/stories/epic-17/STORY-17.W3.2-aula-04-public-release-gate.md"
  - "docs/stories/epic-17/evidence/STORY-17.W3.2.md"
  - "docs/stories/epic-17/EPIC-17-EVIDENCE.md"
affected_paths:
  - "scripts/aula-04-release-gate.test.mjs"
  - "docs/releases/aula-04-data-loop-v1.md"
  - "docs/stories/epic-17/STORY-17.W3.2-aula-04-public-release-gate.md"
  - "docs/stories/epic-17/evidence/STORY-17.W3.2.md"
  - "docs/stories/epic-17/EPIC-17-EVIDENCE.md"
fan_in_paths:
  - "docs/stories/epic-17/epic-17-state.json"
---

# STORY-17.W3.2 - Gate público da Aula 4

## Status

InProgress — contrato e arquitetura materializados; execução autorizada após `17.W3.1` atingir `Done` e ser integrada em `d571775`.

## Story

**Como** mantenedor da distribuição pública do Cohort de Marketing

**Quero** executar um gate local e reproduzível sobre a Aula 4 integrada

**Para que** contratos, exemplo, compatibilidade com a Aula 3, privacidade e decisão humana permaneçam comprováveis antes de qualquer fan-in ou publicação.

## Dependências e baseline

- Baseline autorizada: `wave/gate-0/public-baseline@d571775af4f8a9998af3d4c5d8c241e0033295be`.
- `17.W3.1`: `Done`, QG3 rodada 3 `PASS 98/100`, integrada localmente.
- Branch/worktree: `wave/17-w3/story-17.W3.2` em `.claude/worktrees/story-17.W3.2`.
- PR coverage em 2026-07-15: nenhum PR aberto cobre `17.W3.2` ou o gate público da Aula 4.

## Acceptance Criteria

- [ ] AC1: A primeira linha do exemplo W3.1 é um `WeeklyPanel 1.0.0` válido e compatível com o handoff da Aula 3: fonte opaca rastreável, janela literal, selo, confirmação humana e decisão `pending` são preservados na entrada do ledger sem inferência.
- [ ] AC2: Um cenário de uma semana com métrica `nao_fornecido` preserva `value: null`, janela nula e confirmação falsa no `WeeklyLedger 1.1.0`; fonte, janela ou confirmação inválida falha fechado nos gates W1/W2 existentes.
- [ ] AC3: O walkthrough público executa as três semanas sintéticas e produz exatamente seis artefatos; a decisão histórica permanece `approved`, o novo diagnóstico permanece `pending`, inconclusivo e sem alavanca ou mutação.
- [ ] AC4: Validators de Aula 4, catálogo, mirrors canônico/Codex e suites W1/W2/W3 passam sem alteração nos validators, contratos, skills ou exemplos integrados.
- [ ] AC5: O gate de distribuição valida links relativos, ausência de integração externa e File List exata; o scan de privacidade não encontra segredo, credencial, email, telefone/CPF/CNPJ shaped, path absoluto de máquina, payload privado ou arquivo de projeto real nos materiais liberáveis e outputs.
- [ ] AC6: `docs/releases/aula-04-data-loop-v1.md` registra contratos/versões, compatibilidade Aula 3, comandos, limitações e rollback local, sem declarar push, publicação ou deploy.
- [ ] AC7: Evidência sanitizada registra checkout limpo, contagens, validators, mirrors, walkthrough, scans e os vereditos sequenciais `@po READY` e `@qa PASS técnico`; a story permanece `InReview` até QG independente `@architect`.

## Arquitetura do gate

### Estado atual

```text
Aula 3 handoff
  -> WeeklyPanel 1.0.0
  -> WeeklyLedger 1.1.0
  -> HistoricalMetricsReading 1.0.0
  -> SourceReconciliation 1.0.0
  -> DecisionOutcomeDiagnosis 1.0.0
  -> decisão histórica approved + próxima decisão pending
```

Os componentes acima já estão implementados e aprovados. Esta story adiciona somente prova de release e documentação; não cria outro validator, contrato, conversor, motor ou configuração mutável.

### Opções consideradas

| Opção | Descrição | Trade-off | Decisão |
|---|---|---|---|
| A | Novo teste de release compõe APIs/CLIs existentes e reutiliza o exemplo W3.1 | Uma prova adicional, sem mudar runtime | Escolhida |
| B | Alterar `validate-aula-04-contracts.mjs` e `validate-skill-catalog.mjs` | Acopla release a validators já aprovados e amplia risco | Rejeitada |
| C | Gate somente documental | Menor delta, mas não prova Aula 3 → Aula 4 nem privacidade executável | Rejeitada |

### Componentes e interfaces

| Componente | Entrada | Saída/observação | Mutabilidade |
|---|---|---|---|
| `aula-04-release-gate.test.mjs` | fixtures públicas, exemplo W3.1, CLIs existentes | assertions Node determinísticas | somente temporários fora do repo |
| validators existentes | contratos e catálogo versionados | exit code/JSON ou `OK` | read-only |
| walkthrough W3.1 | exemplo público + diretório temporário vazio | seis artefatos públicos | somente output temporário |
| release manifest/evidence | versões e resultados sanitizados | documentação revisável | paths allow-listed |

### Decisão humana

“Até decisão registrada” significa que o input preserva a decisão histórica estruturada com `humanDecision.status: approved`, enquanto o diagnóstico gera uma nova decisão `pending`. O gate não registra automaticamente a próxima decisão, não altera a histórica e não executa mutação externa.

### Configuração e acoplamento

- Não há configuração mutável nova: caminhos são derivados de `import.meta.url`, artefatos são públicos/versionados e outputs usam `os.tmpdir()`.
- Nenhuma rede, Studio, API, browser automatizado, credencial ou serviço privado participa do gate.
- Skills/mirrors, validators, contratos e runtime W1/W2/W3 são dependências read-only.

## Test Strategy

- RED focal: ausência de `scripts/aula-04-release-gate.test.mjs` deve falhar antes de qualquer correção de runtime.
- Compatibilidade: primeira semana W3.1 e fixture `weekly-panel.metric-not-provided.valid.json` atravessam validator/builder sem perder fonte, janela, selo, valor nulo ou confirmação.
- E2E: runner gera seis outputs e preserva `approved -> pending` sem mutação.
- Distribuição: catálogo/mirrors, links locais, ausência de rede e arquivos liberáveis somente.
- Privacidade: probes positivos existentes permanecem verdes; scan negativo cobre materiais/outputs com padrões explícitos e não registra valores sensíveis na evidência.
- Regressão: suites Aula 4 adjacentes e gate Node completo controlado.

## Tasks

- [x] Confirmar baseline exata, W3.1 `Done`, autorização, worktree isolado e PR coverage vazio.
- [x] Mapear arquitetura, opções, contratos consumidores, riscos, testes e File List antes do código; registrar `@po READY`.
- [ ] Congelar RED focal do release gate antes do GREEN.
- [ ] Implementar somente o teste de gate e executar validators/runtime existentes em modo read-only.
- [ ] Produzir release manifest e evidência sanitizada dentro da File List.
- [ ] Executar focal, adjacente, full Node, checkout limpo, walkthrough, scans, `git diff --check` e auditoria da File List.
- [ ] Registrar `@qa PASS técnico` e mover para `InReview`; `@architect` permanece independente.
- [ ] Não editar `epic-17-state.json`; transição/fan-in é exclusiva de `@devops` após QG.

## File List

- `scripts/aula-04-release-gate.test.mjs`
- `docs/releases/aula-04-data-loop-v1.md`
- `docs/stories/epic-17/STORY-17.W3.2-aula-04-public-release-gate.md`
- `docs/stories/epic-17/evidence/STORY-17.W3.2.md`
- `docs/stories/epic-17/EPIC-17-EVIDENCE.md`

Esta é a allowlist exata do executor. Validators, schemas, skills, mirrors, exemplos, materiais W3.1 e `epic-17-state.json` são read-only. O state é reservado ao fan-in `@devops`; qualquer outro path exige rematerialização anterior à mudança.

## Validation Matrix

| Gate | Comando/prova | Resultado exigido |
|---|---|---|
| Focal | `node --test scripts/aula-04-release-gate.test.mjs` | compatibilidade, E2E, distribuição e privacidade verdes |
| Aula 4 | suites validator/ledger/history/reconciliation/diagnosis/walkthrough/release | zero falhas |
| Validators | `validate-aula-04-contracts.mjs` e `validate-skill-catalog.mjs` | exit 0; arquivos imutáveis |
| Walkthrough | runner sobre exemplo em output temporário vazio | seis outputs; `approved -> pending` |
| Full Node | matriz pública controlada | zero regressão |
| Checkout | worktree temporário detached no HEAD | mesmas contagens; status limpo |
| Privacy | scan de materiais liberáveis e outputs | zero achados; sem eco |
| File List | diff NUL-safe contra `d571775` | todo path pertence à allowlist |

## Riscos e mitigações

| Risco | Severidade | Mitigação |
|---|---|---|
| Usar fixture W1.1 com fonte textual no E2E | Alta | Reutilizar primeira semana W3.1 com `ref:<kind>:<id>`; fixture antiga fica apenas no validator |
| Interpretar `pending` como decisão ausente | Alta | Provar decisão histórica `approved` no request e nova decisão `pending` no diagnóstico |
| Scan ingênuo gerar falso positivo em métricas/IDs opacos | Média | Testar outputs reais e padrões contextuais já aprovados; evidência não inclui valores dos probes |
| Gate corrigir runtime durante validação | Alta | Stop imediato; validators/runtime permanecem read-only e correção volta à story proprietária |
| Checkout da integração conter worktrees operacionais | Média | Provar em worktree detached temporária criada do HEAD da story e removê-la ao final |

## Stop Conditions

- Qualquer teste exigir correção em validator, contrato, skill, mirror, exemplo ou runtime fora da File List.
- Alguma fonte não rastreável virar série histórica ou métrica ausente ganhar valor/janela/confirmação.
- Decisão histórica for reescrita, próxima decisão deixar de ser `pending` ou surgir alavanca/mutação automática.
- Evidência depender de segredo, PII, path absoluto, arquivo de projeto real, Studio, API, rede ou serviço privado.
- Validator, mirror, distribuição, walkthrough, privacy scan ou checkout limpo falhar.
- Sign-off `@architect` ser autoatribuído pelo executor.

## Vereditos

### Product Owner

- Reviewer: `@po`
- Veredito: `READY`
- Escopo: valor, interpretação da decisão humana, allowlist e critérios executáveis alinhados.
- Baseline: `d571775af4f8a9998af3d4c5d8c241e0033295be`.

### QA executor

- Reviewer: `@qa`
- Veredito: `PENDING`.

### Architect quality gate

- Reviewer: `@architect`
- Veredito: `PENDING — independente após handoff InReview`.

## Change Log

| Data | Agente | Mudança |
|---|---|---|
| 2026-07-15 | @po | Preflight confirmado, arquitetura/allowlist materializadas e story movida de `Ready` para `InProgress`. |
