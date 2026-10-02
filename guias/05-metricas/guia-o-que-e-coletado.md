# GUIA — O que a Central de Dados coleta (e o que NÃO coleta)

> **Estou perdido em:** "o painel da Aula 4 pega o quê, de onde? Posso confiar? Por que falta métrica X?"
> **O que você vai ter no final:** o mapa exato do que entra no seu painel — métrica por métrica, com o selo de confiança de cada uma — e a lista honesta do que NÃO entra (e onde ver na mão se precisar).
> **Fontes cruzadas:** o próprio código do coletor (`scripts/painel-trafego-data.mjs`, `scripts/lib/hotmart.mjs`) · as regras de dados da Aula 4 (`aula-04/docs/regras-de-dados.md`) · referência de mercado (os limites da atribuição — por que Gerenciador ≠ caixa).

## Pré-requisitos (confira ANTES)

| Tipo | Pré-requisito | Não tem? Faça isso |
|---|---|---|
| 📖 Conhecimento | As 6 métricas básicas (CTR, CPM, CPA, ROAS, frequência, conversões) | leia [guia-conceitos-trafego](../02-conhecimento-minimo/guia-conceitos-trafego.md) → "O mundo das MÉTRICAS" (3 min) |
| 🔑 Chave | NENHUMA pra LER este guia. Pra coletar da SUA conta: `META_ACCESS_TOKEN` + `META_AD_ACCOUNT_ID` no `.env` (sem eles = Modo Exemplo, dados fictícios) | siga [guia-meta-api](../03-conexoes-e-apis/guia-meta-api.md) |
| 📄 Artefato | Pra dados que valham decisão: campanha própria com histórico (idealmente ~30 dias) | ainda sem? rode em Modo Exemplo SABENDO que é exemplo, e suba a primeira campanha ([guia-campanha-no-ar](../04-operacao/guia-campanha-no-ar.md)) |

## De onde vêm os dados (3 fontes)

1. **Meta Graph API** (com `META_ACCESS_TOKEN` + `META_AD_ACCOUNT_ID` no `.env`) — leitura da SUA conta de anúncios. Sem chaves: Modo Exemplo (dados fictícios, nunca trava).
2. **Hotmart** (opcional) — as vendas REAIS (caixa), sem nenhum dado pessoal de comprador.
3. **Orgânico** (opcional, avançado) — últimos 25 posts + comentários do IG/página, se o token de página existir; senão a aba fica "Em breve".

## O que ENTRA no painel (métrica por métrica)

| Grupo | Métricas | Selo |
|---|---|---|
| Desempenho pago | gasto, impressões, cliques, cliques no link, CTR, CPM, CPC, frequência, alcance | **Real** (literal da Meta) |
| Conversões | compras, carrinho, checkout iniciado, visualização de página de destino, leads | **Real** (eventos do seu pixel) |
| ROAS | ROAS de compra da Meta | **Estimado** SEMPRE (é atribuição, não caixa) |
| Séries | tudo acima por dia, por mês e por trimestre (trimestre só soma o que é somável — taxas não) | Real/Calculado |
| Campanhas | comparação campanha a campanha + status e datas | Real |
| Horários | mapa de calor dia × hora (impressões, cliques, gasto, CTR) | Real/Calculado |
| Audiência | idade × gênero e estado (UF) — impressões, cliques, gasto | Real |
| Vendas (Hotmart) | receita aprovada, ticket médio, estornos, % rastreada, por produto/origem/dia | Real (caixa) |
| Comparações | variação % entre períodos | **Calculado** (entre dois Reais) |

**As 3 regras de confiança:** (1) nada é calculado "por fora" — CTR/CPA/ROAS vêm da fonte ou não vêm; (2) dado ausente = "não fornecido", nunca zero; (3) ROAS só vira Real quando VOCÊ confere a venda no caixa — e atribuição ERRA mesmo: existe venda que o Gerenciador pendura na campanha errada (referência de mercado); é exatamente por isso que o painel cruza com o caixa da Hotmart.

## O que NÃO entra (honestidade total — e onde ver na mão)

| Não entra | Por quê | Onde ver se precisar |
|---|---|---|
| Desempenho **por posicionamento/dispositivo** (feed vs reels vs stories; celular vs desktop) | não coletado nesta versão | Gerenciador → Detalhamento → Por entrega |
| **Rankings de qualidade** do criativo (qualidade, engajamento, conversão) | não coletado | Gerenciador → colunas → rankings |
| **Métricas de vídeo** (25/50/75/100%, ThruPlay) | o método publica imagem estática; vídeo seu rodando não é lido | Gerenciador → colunas de vídeo |
| **CPA por criativo** (nível anúncio) no painel | painel para no nível campanha; o `--fadiga` do leitor olha CTR/frequência por anúncio | Gerenciador → aba Anúncios |
| Valor em R$ atribuído por evento | só o ROAS-razão é lido | Gerenciador → colunas |
| Alcance orgânico/insights de página | exige App Review da Meta (roadmap declarado) | Meta Business Suite → Insights |
| DMs/Direct | fora de escopo (janela de 24h + App Review) | — |

> Isso não é defeito escondido — é escolha documentada: **poucos números confiáveis > muitos números mal lidos.** O que faltar pra sua decisão da semana, olhe no Gerenciador com a coluna certa (tabela acima) e cole no `/leitor-de-metricas`.

## Teste de sucesso
`node scripts/painel-trafego-data.mjs --account` → `"modo": "api"` = coletando da sua conta. `"modo": "exemplo"` = sem chaves (guia da conexão: [../03-conexoes-e-apis/guia-meta-api.md](../03-conexoes-e-apis/guia-meta-api.md)).

## POSSÍVEIS ERROS — catálogo

| # | Sintoma | Causa | O que fazer (em ordem) |
|---|---|---|---|
| OC1 | O painel responde `"modo": "exemplo"` e mostra números que não são meus | faltam `META_ACCESS_TOKEN` e/ou `META_AD_ACCOUNT_ID` no `.env` | siga o [guia-meta-api](../03-conexoes-e-apis/guia-meta-api.md) (erro E13); até lá, trate tudo como exemplo |
| OC2 | O ROAS do painel não bate com a receita da Hotmart | o ROAS da Meta é atribuição (selo **Estimado**); a Hotmart é o caixa | para decidir, vale o caixa; o ROAS só vira Real quando você confere a venda na Hotmart |
| OC3 | Uma métrica aparece "não fornecido" em vez de 0 | a fonte não entregou o dado (regra 2: ausente nunca vira zero) | é proposital; se precisar do número, veja na fonte (tabela "O que NÃO entra") |
| OC4 | Procuro desempenho por posicionamento, métricas de vídeo, rankings de qualidade ou CPA por anúncio e não acho | não coletados nesta versão | olhe no Gerenciador com a coluna certa (tabela "O que NÃO entra") e cole no `/leitor-de-metricas` |
| OC5 | A aba Orgânico diz "Em breve" | sem o token de página | opcional e avançado: [guia-organico-tokens](../03-conexoes-e-apis/guia-organico-tokens.md) |
| OC6 | A tela de Vendas está vazia | a Hotmart é opcional e não está conectada | [guia-hotmart](../03-conexoes-e-apis/guia-hotmart.md) |
| OC7 | No trimestre, o CTR não é a soma dos meses | taxa não se soma (regra do coletor: trimestre só soma o que é somável) | correto; compare as taxas mês a mês, não somadas |

Se nada resolver: print do painel + "confira contra o guia o-que-e-coletado" no Claude ou no Codex, ou leve ao PS.

## Pronto. Próximos passos

| Agora | O quê |
|---|---|
| ▶️ Fazer | rode `/analista-de-dados` e abra o `painel-trafego.html` — as 7 telas mostram exatamente o que está listado aqui |
| 📖 Ler | os próximos guias de métricas desta pasta ([README](README.md)) conforme forem publicados |
| 🚑 Se travar | catálogo OC1–OC7 acima · painel respondeu `"modo": "exemplo"` sem você querer → falta chave/ID: [guia-meta-api](../03-conexoes-e-apis/guia-meta-api.md) (erro E13) |
