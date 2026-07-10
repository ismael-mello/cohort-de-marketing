# Relatório QA — Story 9.W2.3

Story: **9.W2.3**  
Status: **PASS**  
Data: **2026-07-10**

## Resultado

O ciclo real da Academia Lendária passou pelo launcher oficial, Supabase local
isolado, Playwright e Codex CLI autenticado localmente. O runner removeu
`OPENAI_API_KEY` e `CODEX_API_KEY` de todos os processos filhos.

## Evidência por critério

| AC | Evidência | Resultado |
|---|---|---|
| AC1 | Briefing importado pela UI; intake reconciliou 5 fontes reais e seus SHA-256 | PASS |
| AC2 | Zelador, Briefista, Estruturador, Leitor e Diagnosticador concluíram via Codex CLI | PASS |
| AC3 | Aprovações, curadoria, subida manual pendente, leitura e decisão humana registradas | PASS |
| AC4 | Nenhum request Meta/Facebook; logs sem handoff mutativo; campanha permaneceu `draft` | PASS |
| AC5 | Reloads entre etapas, logout/login em novo contexto e restart do launcher preservaram o estado | PASS |
| AC6 | CTA `unknown` bloqueou o Zelador; auditoria sem evidência foi rejeitada; métricas ausentes ficaram `null`/`nao_fornecido` | PASS |

## Execuções

| Skill | Estado | Duração |
|---|---|---:|
| Zelador | `done` | 31.918 ms |
| Briefista | `done` | 79.632 ms |
| Estruturador | `done` | 14.402 ms |
| Leitor de Métricas | `done` | 32.837 ms |
| Diagnosticador | `done` | 27.130 ms |

Cada artefato aprovado foi materializado e seu hash no filesystem coincidiu com
o `content_hash` persistido. CTR, CPM, alcance e frequência não foram derivados.

## Gates executados

| Comando | Resultado |
|---|---|
| `node e2e/story-9-w2-real-project.mjs` | PASS |
| `npm run lint -- e2e/story-9-w2-real-project.mjs` | PASS |
| `npm run typecheck` | PASS |
| `npm test -- use-project-workspace.test.ts` | PASS, 17/17 |
| `supabase test db` | PASS, 61/61 |
| `node scripts/validate-pilot-manifest.mjs` | PASS |
| `node --test scripts/validate-pilot-manifest.test.mjs` | PASS, 5/5 |
| `git diff --check` | PASS |

## QA visual

- Desktop: `/tmp/story-9-w2-real-project-evidence/journey-desktop.png`
- Mobile: `/tmp/story-9-w2-real-project-evidence/journey-mobile.png`
- `consoleErrors`, `pageErrors`, `networkFailures`, `badResponses`, `overflows`
  e `overlaps`: vazios.
- As duas capturas foram inspecionadas visualmente após a execução.

## Achados corrigidos no ciclo

1. A tabela `ads_campaigns`, consumida pelas telas reais, não existia nas
   migrations locais. Foi criada com status, etapa, vínculo opcional ao projeto
   e RLS por workspace. A FK composta impede vínculo com projeto de outro tenant.
2. O pacote não trazia a fundação `copy` exigida pelo Briefista. O manifesto
   agora congela `aula3-live-copy-corpo.md` como fonte real, com hash validado.
3. O detector visual contava elementos recortados pelo scroll horizontal como
   sobreposição. Agora ele compara somente os retângulos efetivamente visíveis.
4. A prova de ausência de publicação agora exige job durável para todas as skills,
   campanha única em `draft` e zero rotas de publish/Meta recebidas pelo BFF.

## Risco residual

O cancelamento imediato de um retry do Codex pode provocar `EPIPE` no BFF. Esse
fluxo não pertence aos ACs da Story 9.W2.3 e deve ser corrigido em story própria,
sem misturar a alteração concorrente já existente em `local-skill-runner.ts`.
