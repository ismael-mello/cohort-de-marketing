# STORY-15.W1.1 — Preservar transparência de logo no piloto

## Status

Done

## Contexto

O primeiro lote operacional da Creative Factory 2.2.0 passou nos gates objetivos,
mas a inspeção humana encontrou o logo renderizado como um quadrado branco. O SVG
de origem possui fundo transparente; o rasterizador não declarava esse fundo antes
de ler o asset.

## Critérios de aceite

- [x] `recolor_asset()` preserva alpha de SVGs transparentes.
- [x] Teste de regressão cobre fundo transparente e pixels da marca recoloridos.
- [x] `.claude` e `.agents` permanecem byte a byte idênticos.
- [x] Release e manifesto são versionados como `2.2.1`.
- [x] Um novo lote usa hash próprio, sem sobrescrever o lote `2.2.0`.
- [x] A inspeção visual confirma a ausência do retângulo opaco.
- [x] Testes da skill, catálogo e validações de distribuição passam.

## File List

- `.claude/skills/ads-creative-factory/SKILL.md`
- `.claude/skills/ads-creative-factory/scripts/alib.py`
- `.claude/skills/ads-creative-factory/scripts/catalog_loader.py`
- `.claude/skills/ads-creative-factory/scripts/__tests__/test_factory_catalog_runtime.py`
- `.claude/skills/ads-creative-factory/source-manifest.json`
- `.agents/skills/ads-creative-factory/**`
- `scripts/generate-ads-creative-factory-manifest.mjs`
- `scripts/validate-skill-catalog.mjs`
- `docs/releases/ads-creative-factory-2.2.1.md`
- `docs/stories/epic-15/pilot-smoke-2.2.1.json`

## Resultado

O lote `aula-03-decisao-semanal-v2` executou com `factory_version: 2.2.1` e
`catalog_hash: 10779ba03badd5c6dca823698c0e120f6ecf732c22eb831f4097cabb38665040`.
Os arquétipos `al03.traffic-ledger` e `ugc_native` passaram os gates com
`ai_slop_score: 0` e `brand_adherence_pct: 100`. A revisão visual confirmou o
logo transparente e sem retângulo opaco. Publicação continua pendente de decisão
humana.
