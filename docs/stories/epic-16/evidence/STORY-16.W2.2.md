# Evidência — Story 16.W2.2

## Resultado

As superfícies públicas de briefing e mapa agora consomem o mesmo contrato
composto por `skill-catalog.json`, `skill-unlock-rules.json`, ProjectBrief v1 e
ArtifactIndex v1. Nenhuma lista de skills, edge ou contagem permanece copiada no
HTML. Falhas de carga, referência órfã ou documento divergente bloqueiam a
renderização com um único erro acionável.

## Preflight

- Base da story: `f4ca009a646df7238adbb1d30228727bab92d72d`.
- Branch isolada: `wave/16-w2/story-16.W2.2`.
- Dependências `16.W1.1` e `16.W2.1`: `Done` no `epic-16-state.json`.
- `gh pr list --state open --limit 100 --json ...`: `[]`; nenhum PR aberto cobre o escopo.
- Escopo alterado: somente paths declarados na allow-list da story.

## Test-first

- Commit RED: `29c23ac`.
- Antes da implementação: 6 testes executados; 5 falharam pelos contratos
  ausentes/literais e 1 passou pela paridade preexistente.
- Depois da implementação: `node --test scripts/skill-surface-data-driven.test.mjs`
  — 6/6 testes passando.
- Fixtures cobertas: inserção e remoção de skill, edge órfã, skill sem regra,
  requisito de artefato órfão e ArtifactIndex malformado.

## Validators

- `node scripts/validate-skill-catalog.mjs` — PASS; 31 skills, 41 edges e mirror canônico verificado.
- `node scripts/validate-mapa-wiring.mjs` — PASS; 69/69 `sampleUrl` válidas e HTTP PDF válido.
- `node scripts/validate-mapa-preview.mjs` — PASS; canvas 810x1138, screenshot gerada e zero `pageerror`.
- `git diff --check` — PASS.
- `cmp -s` entre raiz e `aula-03/materiais/` — PASS para briefing, mapa e artefatos JS.

## Browser smoke HTTP

Servidor local: `python3 -m http.server 8872 --bind 127.0.0.1`.

| URL | Skills | Edges | Console/Page errors |
|---|---:|---:|---:|
| `/mapa-skills.html` | 31 nós | 41 | 0 |
| `/aula-03/materiais/mapa-skills.html` | 31 nós | 41 | 0 |
| `/briefing.html` | 31 linhas | n/a | 0 |
| `/aula-03/materiais/briefing.html` | 31 linhas | n/a | 0 |

Os assets compartilhados e amostras usam URLs enraizadas no servidor para que a
distribuição de `aula-03/materiais/` não tente resolver fontes ou previews em uma
pasta inexistente.

## Segurança e proveniência

- O mapa lê apenas o ProjectBrief/ArtifactIndex persistido pelo briefing, sem
  renderizar conteúdo bruto dos artefatos.
- O ArtifactIndex só libera estado `done` para entradas confirmadas e com resumo
  coerente; índice de outro projeto ou schema divergente falha fechado.
- Nenhum segredo, caminho absoluto de máquina ou conteúdo privado foi registrado.

## Commits

- `29c23ac` — testes de contrato (RED).
- `dfa2819` — implementação catálogo-driven (GREEN).

