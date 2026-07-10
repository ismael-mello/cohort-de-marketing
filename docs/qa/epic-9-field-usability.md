# Evidência de usabilidade em campo — Story 9.W3.1

Story: **9.W3.1**

Status da evidência: **PENDENTE — observação com operador-alvo não realizada**

Gate atual: **BLOCKED para conclusão da story; infraestrutura pronta para coleta**

## Estado factual

Nenhum participante ou sessão foi observado neste trabalho. Portanto, não há
tempos, hesitações, bloqueios, recuperações, achados ou conclusão humana a
reportar. Os testes técnicos da Story 9.W2.3 não substituem o aceite de campo.

O contrato validável está em
`data/pilots/epic-9-field-observation.schema.json`. O registro sanitizado da
sessão só deve ser criado após a observação e deve permanecer fora do git até
passar pela revisão de privacidade abaixo.

## Critério de participante

Selecionar ao menos uma pessoa que pertença ao público operador da Aula 3, não
tenha desenvolvido o Marketing Studio e consiga operar computador e navegador,
mas não dependa de terminal ou conhecimento de desenvolvimento. Não registrar
nome, e-mail, empresa, telefone, voz, imagem, IP ou identificador externo.

## Consentimento a ler antes da sessão

> Você concorda em participar de uma observação de usabilidade do Marketing
> Studio. Observaremos ações, tempos, hesitações, bloqueios e recuperações para
> melhorar o produto. Não gravaremos áudio, vídeo ou tela e não registraremos
> seu nome, contato, credenciais ou conteúdo privado. Você pode interromper a
> sessão a qualquer momento. Você autoriza o registro apenas dessas observações
> sanitizadas?

Só iniciar após um “sim” inequívoco. No JSON registrar apenas `consent:
"granted"`, nunca a fala, assinatura ou identidade da pessoa.

## Preparação segura

1. Usar o launcher e o projeto piloto local já validados pela Story 9.W2.3.
2. Confirmar que não há senha, token, `.env`, console, DevTools ou conteúdo
   privado visível. O operador não deve receber terminal.
3. Preparar um cronômetro fora da captura e uma cópia local não versionada do
   formulário JSON. Usar `field-AAAA-MM-DD-NN` como ID impessoal.
4. O observador não ensina, aponta controles ou corrige o fluxo. Se houver risco
   de segredo, perda de dados ou ação externa, interrompe e registra bloqueio.
5. Relembrar que Meta permanece recommend-only: não publicar, pausar, escalar ou
   alterar campanha externa durante esta observação.

## Roteiro e regra de medição

Dar somente esta instrução: “Abra o projeto da Aula 3 e conclua a rotina do
Squad de Tráfego até chegar a uma recomendação para decisão humana. Diga quando
considerar que terminou.”

Medir cada etapa do primeiro gesto intencional até o resultado visível:

| ID | Etapa | Resultado esperado |
|---|---|---|
| `open-project` | Abrir o Studio e o projeto | Projeto correto visível |
| `zelador` | Verificar saúde e tracking | Gate honesto, sem inventar evidência |
| `briefista-curation` | Gerar e fazer curadoria | Seleção/recusa humana registrada |
| `estruturador` | Estruturar campanha | Recomendação permanece draft |
| `manual-upload` | Entender o handoff manual | Nenhuma publicação automática |
| `leitor` | Informar/ler métricas | Ausentes continuam não fornecidas |
| `diagnosticador` | Obter e decidir recomendação | Uma alavanca e decisão humana |

Para cada etapa registrar segundos inteiros, resultado e contagens:

- **hesitação:** pausa observável de pelo menos 5 segundos procurando o próximo
  passo, releitura repetida ou tentativa sem ação; eventos contínuos contam uma vez;
- **bloqueio:** a pessoa não consegue avançar sem ajuda, abandona a etapa ou o
  sistema impede a ação; registrar impacto sanitizado;
- **recuperação:** após erro, hesitação ou bloqueio, volta ao fluxo sem ajuda de
  desenvolvimento; recuperação assistida não conta como autônoma;
- **resultado:** `success`, `partial` ou `failure`, sem inferir intenção.

Se houver assistência de desenvolvimento, registrar `provided`; isso invalida o
AC1 para essa sessão, mas a observação ainda pode gerar achados.

## Formulário inicial validável

Copiar este conteúdo para um arquivo temporário fora do repositório e substituir
valores somente durante uma sessão real. O estado abaixo é deliberadamente
`pending` e contém zero evidência inventada.

```json
{
  "schemaVersion": "1.0.0",
  "storyId": "9.W3.1",
  "status": "pending",
  "privacy": {
    "sanitized": true,
    "containsPii": false,
    "containsSecrets": false,
    "containsPrivateContent": false,
    "rawRecordingStored": false,
    "redactionNotes": []
  },
  "session": {
    "sessionId": null,
    "operatorProfile": "pending",
    "consent": "pending",
    "developmentAssistance": "not-observed",
    "startedAt": null,
    "endedAt": null
  },
  "steps": [
    { "id": "open-project", "label": "Abrir Studio e projeto", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "zelador", "label": "Executar Zelador", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "briefista-curation", "label": "Executar Briefista e curadoria", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "estruturador", "label": "Executar Estruturador", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "manual-upload", "label": "Reconhecer subida manual", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "leitor", "label": "Executar Leitor de Métricas", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] },
    { "id": "diagnosticador", "label": "Executar Diagnosticador e decidir", "status": "pending", "durationSeconds": null, "hesitationCount": null, "blockageCount": null, "recoveryCount": null, "result": "not-observed", "notes": [] }
  ],
  "findings": [],
  "recommendation": {
    "gate": "pending-field-observation",
    "basis": "Observação com operador-alvo ainda não realizada.",
    "metricsArePromises": false
  }
}
```

## Sanitização e validação

Antes de versionar qualquer resultado:

1. Remover identidade, contato, credenciais, URLs privadas, conteúdo de projeto
   privado, falas literais identificáveis, imagens e caminhos externos.
2. Converter notas em descrição comportamental curta. Não registrar hipótese
   psicológica nem atribuir causa sem evidência observável.
3. Confirmar manualmente os cinco flags de privacidade do schema.
4. Validar com um validador JSON Schema Draft 2020-12 e format-checking ativo.
5. Revisar o diff procurando padrões de segredo e PII antes do commit.

Exemplo com a ferramenta já disponível no app:

```bash
cd apps/academia-lendaria-ads-studio
npx ajv-cli validate --spec=draft2020 --all-errors \
  -s ../../data/pilots/epic-9-field-observation.schema.json \
  -d /caminho/temporario/observacao-sanitizada.json
```

O caminho `/caminho/temporario/...` é marcador de instrução, não evidência nem
arquivo esperado no repositório.

## Classificação e gate

Classificar somente achados observados:

| Classe | Critério | Gate |
|---|---|---|
| `blocker` | risco de segredo/dado, ação externa indevida, perda de estado ou impossibilidade de concluir jornada crítica | `block` |
| `pre-go-live` | jornada conclui, mas há ambiguidade, erro recuperável ou assistência incompatível com uso autônomo | `conditional-go` até corrigir e retestar |
| `backlog` | fricção sem impedir conclusão autônoma e segura | não bloqueia isoladamente |

`go` exige: operador-alvo, consentimento, zero assistência de desenvolvimento,
todas as etapas com resultado `success`, zero blocker aberto e revisão de
privacidade aprovada. Qualquer métrica desta sessão descreve apenas esta sessão;
não é promessa de desempenho, adoção ou resultado futuro. O reality-check deve
comparar o achado com o comportamento observado e explicitar a amostra de uma
sessão, sem extrapolação.

## Passos exatos para fechar a story

1. Recrutar um operador-alvo e executar o protocolo acima.
2. Preencher e validar o JSON sanitizado como `completed`.
3. Incorporar neste relatório apenas agregados e achados sanitizados.
4. Classificar cada achado e registrar o gate humano (`block`,
   `conditional-go` ou `go`) com reality-check.
5. Marcar as duas tarefas restantes da story somente após essa evidência existir
   e passar por revisão de privacidade e PO.

## Cobertura atual dos critérios

| AC | Estado | Evidência atual |
|---|---|---|
| AC1 | PENDENTE | requer operador-alvo real sem assistência de desenvolvimento |
| AC2 | PRONTO PARA COLETA | schema e protocolo exigem tempo, hesitação, bloqueio, recuperação e resultado por etapa |
| AC3 | PRONTO PARA COLETA | minimização, consentimento, sanitização e flags fail-closed definidos |
| AC4 | PRONTO PARA COLETA | taxonomia e regras de gate definidas; nenhum achado foi inventado |
| AC5 | PRONTO PARA COLETA | `metricsArePromises: false` e reality-check obrigatório no estado concluído |
