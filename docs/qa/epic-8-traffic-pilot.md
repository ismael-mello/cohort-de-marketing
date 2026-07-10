# Relatório de piloto E2E — Squad de Tráfego

Story: **8.W3.1**

Base: `4f05847f6d172cadf2e83befe69fed0d74d55f6c`

Execução: 2026-07-10T16:39:10.841Z → 2026-07-10T16:42:41.940Z

Fixture: `story-8-w3-1-traffic-pilot` (workspace `81000000-0000-0000-0000-000000000031`, projeto `82000000-0000-0000-0000-000000000031`, campanha `84000000-0000-0000-0000-000000000031`)

## Resultado executivo

- Fixture Supabase real, sem demo auth: **PASS**.
- Meta não mutada: **PASS**; campanha permaneceu `draft`, etapa 1.
- Cinco skills executadas pela interface e materializadas após revisão humana: **PASS**.
- Retomada após reload: **PASS**.
- Evidência visual desktop/mobile no mesmo estado: **PASS**.

## Tempos, jobs, decisões e hashes

| Skill | Run DB | Tempo | Status | Decisões outbox | Artefatos / hash DB |
|---|---|---:|---|---|---|
| zelador | e5136f17-717f-4579-a3cb-20a75604ec6a | 21704 ms | done | approve/done | trafficTrackingAudit.json: 8a4ce3a200b66f9c9ddd621b8f5e435824395d336d2ee1cfb3c2c166654ea899 |
| briefista | 1bfb0cc9-acf2-45db-a685-350e1dd24171 | 40583 ms | done | approve/done | briefista.bateria_gerada: 8820b0a3a3385f5c31072717d5f82c50fd898d2aa99cd715fae05f10f499db06 |
| estruturador | fd2b4085-b7ea-4161-8f1d-489b99b099eb | 23440 ms | done | approve/done | generated/estruturador/fd2b4085-b7ea-4161-8f1d-489b99b099eb.yaml: 61dfcb267a4744b2473b5c01e109810e072328e06b4c9239821fb632c39091c8 |
| leitor-de-metricas | 5622e4b0-5fb6-4af1-bace-d284fb5476be | 37968 ms | done | approve/done | generated/leitor-de-metricas/trafficMetricReading.yaml: 3977d386587a18c4e8a6c174d09c3b9981cb74614fac58cfc0fbad73d4971f61 |
| diagnosticador | aa8cdea5-d777-4ce8-99ae-74bb27d3e694 | 44323 ms | done | approve/done | generated/diagnosticador/trafficDiagnosis.yaml: 33fed22273a19bbe07546b8ddbb273e57a032e9b1dbe5a589c4a514edfa8bb84 |

O hash de proposta é o agregado canônico gravado no run/outbox. Os hashes de arquivo acima são reconciliados durante o E2E com o SHA-256 do conteúdo materializado no filesystem. O JSON preserva os paths e os jobs duráveis, incluindo tentativas, steps e logs.

## Retomada, retry e recusas

| Checkpoint | Momento | Hidratação |
|---|---|---|
| Zelador crítico pronto para revisão | 2026-07-10T16:39:39.532Z | sim |
| recusa do Zelador persistida | 2026-07-10T16:39:41.890Z | sim |
| após recusa e retry do Zelador | 2026-07-10T16:39:45.007Z | sim |
| Zelador pronto para revisão | 2026-07-10T16:40:04.641Z | sim |
| Zelador materializado | 2026-07-10T16:40:08.191Z | sim |
| Briefista pronto para revisão | 2026-07-10T16:40:47.063Z | sim |
| Briefista materializado | 2026-07-10T16:40:50.346Z | sim |
| Estruturador pronto para revisão | 2026-07-10T16:41:12.161Z | sim |
| Estruturador materializado | 2026-07-10T16:41:15.395Z | sim |
| Leitor de Metricas pronto para revisão | 2026-07-10T16:41:51.389Z | sim |
| Leitor materializado | 2026-07-10T16:41:54.997Z | sim |
| Diagnosticador pronto para revisão | 2026-07-10T16:42:37.736Z | sim |

- Recusa honesta: registrada — o Zelador foi recusado quando CAPI/deduplicação não estavam confirmadas; nenhum arquivo foi materializado para essa decisão.
- Retry: registrado para o job 6e8c909b-bbf3-4173-b743-194c005747d2, tentativa 2, seguido de cancelamento controlado.
- Guardas: token no BFF, Codex em `read-only`, revisão humana obrigatória e campanha recommend-only.

## Métricas e diagnóstico

O operador forneceu ao Leitor apenas valores nomeados: gasto, impressões, cliques, conversões, CPA do gerenciador e ROAS do gerenciador. Métricas marcadas como **Não fornecido** no artefato: **CTR, alcance, frequência, CPM**; a janela de atribuição também ficou ausente e o ROAS sem venda confirmada ficou **Estimado** com premissa. O E2E rejeita qualquer valor calculado para essas métricas e confirmou **zero derivações** no Diagnosticador. A saída final trouxe uma única alavanca, hipótese, critério de sucesso, critério de reversão e decisão humana de aprovação via outbox.

## Evidência visual

- Desktop: [traffic-pilot-desktop.png](../../apps/academia-lendaria-ads-studio/e2e/fixtures/traffic-pilot/evidence/traffic-pilot-desktop.png) — 1280×900, estado final do Diagnosticador.
- Mobile: [traffic-pilot-mobile.png](../../apps/academia-lendaria-ads-studio/e2e/fixtures/traffic-pilot/evidence/traffic-pilot-mobile.png) — 390×844, mesma revisão reidratada.
- Overlaps detectados: 0.
- Erros de console: 0.
- Falhas de rede: 0.

## Lacunas e limites honestos

- A campanha fixture é um registro local real em Supabase e permaneceu em `draft`; o E2E não acessa credenciais Meta nem simula publicação.
- Os arquivos de evidência são regeneráveis executando a spec e este script; o workspace e o projeto fixture são removidos no teardown.
- IDs de runs/jobs, timestamps e hashes mudam por execução; tenant, projeto, campanha e conteúdo de entrada são determinísticos.

## Paths observados

- Projeto filesystem: `/Users/rafaelcosta/Projects/cohort-de-marketing/.claude/worktrees/story-8.W3.1/projetos/story-8-w3-1-traffic-pilot` (temporário, removido no teardown).
- Evidência JSON: `/Users/rafaelcosta/Projects/cohort-de-marketing/.claude/worktrees/story-8.W3.1/apps/academia-lendaria-ads-studio/e2e/fixtures/traffic-pilot/evidence/run.json`.
- Screenshots: `/Users/rafaelcosta/Projects/cohort-de-marketing/.claude/worktrees/story-8.W3.1/apps/academia-lendaria-ads-studio/e2e/fixtures/traffic-pilot/evidence/traffic-pilot-desktop.png` e `/Users/rafaelcosta/Projects/cohort-de-marketing/.claude/worktrees/story-8.W3.1/apps/academia-lendaria-ads-studio/e2e/fixtures/traffic-pilot/evidence/traffic-pilot-mobile.png`.

Gerado por `scripts/traffic-pilot-report.mjs`; sem commit nesta execução.
