# Ads Creative Factory 2.2.1

## Hotfix

A versão 2.2.1 preserva transparência ao rasterizar e recolorir logos SVG antes
da composição. A correção impede que a área transparente do asset se transforme
em um retângulo opaco no criativo final.

## Evidência

- teste de regressão verifica alpha zero fora da marca e alpha positivo no mark;
- os mirrors `.claude` e `.agents` permanecem idênticos;
- um novo lote do piloto da Aula 3 deve usar um `catalog_hash` novo e não pode
  sobrescrever o manifesto produzido pela versão 2.2.0;
- revisão humana continua obrigatória mesmo quando os gates objetivos passam.

## Compatibilidade

Extension Packs com `min_factory_version: 2.2.0` permanecem compatíveis. Não há
alteração de schema, renderer mode ou comando público.
