# GUIA META API — do zero absoluto ao token funcionando

> **Estou perdido em:** "preciso conectar a conta de anúncios da Meta (app, token, IDs) e nunca fiz isso".
> **O que você vai ter no final:** alguém que NUNCA pegou nisso termina com `META_ACCESS_TOKEN` + IDs no `.env` e o teste respondendo `"modo":"api"`. Sem pulo lógico. Com TODOS os erros conhecidos catalogados no fim.
>
> **Fontes cruzadas:** (por que confiar) `aula-04/docs/tutorial-token-meta.md` e `configurar-chaves-meta.md` (repo) · `scripts/zelador-audit.mjs` e `painel-trafego-data.mjs` (código real) · guia visual `aula-03/materiais/guia-app-meta-integracoes.html` · 3 tutoriais externos em vídeo (integração Claude+Meta Ads via API; token permanente App+System User; criação de app na Meta do zero) · e os erros REAIS registrados no PS de 21/07.
> **Regra de leitura:** a Meta muda telas conforme a época E a conta (dois apps criados em meses diferentes têm menus diferentes — confirmado em fonte externa). Se o nome não bater, procure o equivalente; o caminho lógico não muda.

---

## 0. O que você vai ter no final

- Um **app** da Meta (de graça, em modo Desenvolvimento — não precisa publicar).
- Um **Usuário do Sistema** ("robô") com um **token que não expira** — de **leitura**, ou de **leitura + escrita** se você quiser publicar campanha via API (você escolhe na seção 0.1).
- Os **IDs** dos seus ativos gravados no `.env`.
- O teste `node scripts/painel-trafego-data.mjs --account` respondendo `"modo": "api"`.

**O que você NÃO vai precisar (ignore se a Meta oferecer):** política de privacidade, termos de uso, ícone 512px, publicar o app, App Review, webhooks — isso tudo é só para WhatsApp API/login social/orgânico em produção. Para LER a própria conta de anúncios, nada disso entra.

### 0.1 Você quer só LER, ou também ESCREVER (publicar campanha via API)?

Decida AGORA — muda 4 escolhas no meio do caminho, e refazer depois dá retrabalho. A fundação é a mesma; o que muda é só isto:

| # | Onde | Só LER | Também ESCREVER/publicar |
|---|---|---|---|
| 1 | Escopos do token (passo 6.3) | `ads_read` + `business_management` | **+ `ads_management`** |
| 2 | Função do Usuário do Sistema (passo 4.3) | Funcionário | **Administrador** |
| 3 | Permissão na conta de anúncios (passo 5.2) | "Ver desempenho" | **"Gerenciar campanhas"** |
| 4 | Pagamento (fundação, passo 6) | dispensável pra testar | **obrigatório** pra campanha ir ao ar |

Na dúvida, **gere já no modo ESCREVER**: o token serve pros dois e você não refaz nada. Prova de que o escrever funciona sem gastar nada: `node scripts/zelador-audit.mjs --testar-escrita` (passo 9.3 — cria e apaga um rótulo invisível).

> ⚠️ **Estrutura pronta ≠ campanha no ar.** Você monta tudo de graça, mas **anúncio rodando exige pagamento cadastrado e verba gastando** — não existe publicar de verdade sem gastar.

### 0.2 Quanto tempo isso leva (expectativa honesta)

| Etapa | Tempo real |
|---|---|
| Conta de desenvolvedor + app + Usuário do Sistema + ativos + token | **~40–60 min** se nada travar |
| Teste de LEITURA respondendo `"modo":"api"` | **mesmo dia**, quase sempre |
| Teste de ESCRITA (`--testar-escrita`) | mesmo dia **na maioria dos casos** — mas BM novo às vezes exige Verificação de Empresa (erros E6/E14), que leva **1+ dia útil e não fica pronta hoje** |
| Publicar campanha real | depende de pagamento + verba (não é o objetivo deste guia) |

**O que mais atrasa** não é o guia, é a Meta: SMS que não chega (E1/E2) e propagação de permissões (~2–5 min por atribuição, às vezes ~10). Reserve folga.

---

## 1. Pré-requisitos (a fundação — 15 min se já tiver, 1 dia se criar do zero)

| Tipo | Pré-requisito | Não tem? Faça isso |
|---|---|---|
| 📖 Conhecimento | Você sabe o que é API, app, token, escopo e Usuário do Sistema (2 frases de cada basta) | leia [guia-conceitos-trafego](../02-conhecimento-minimo/guia-conceitos-trafego.md) → "O mundo da API" (3 min) |
| 🔑 Conta | **Perfil pessoal do Facebook** real e usado (perfil novo só pra anunciar = risco de bloqueio) | use o seu perfil real |
| 🔑 Conta | **Business Manager (BM)** criado, com e-mail confirmado | siga [guia-meta-fundacao.md](guia-meta-fundacao.md) passo 1 (ou [super-guia B.3](super-guia-apis-e-ads.md)) |
| 🔑 Conta | **Conta de anúncios** dentro do BM (fuso São Paulo + moeda BRL — não mudam depois) | [guia-meta-fundacao.md](guia-meta-fundacao.md) passo 4 |
| 🔑 Conta | **Pagamento** cadastrado sem aviso vermelho — *(dispensável se você só vai TESTAR a API agora; obrigatório para campanha no ar)* | [guia-meta-fundacao.md](guia-meta-fundacao.md) passo 6 |
| 🔑 Conta | *(Recomendado — **NÃO bloqueia**, veja a caixa abaixo)* **Verificação de Empresa** — sobe o CNPJ (aceita MEI), a Meta cruza os dados e pode ligar/mandar SMS no telefone do CNPJ. Prazo: 1+ dias úteis. Destrava BMs novos que seguram o Usuário do Sistema (erro E6) | [guia-meta-fundacao.md](guia-meta-fundacao.md) passo 5 — dispare e **siga em frente sem esperar** |
| 🧰 Ferramenta | Projeto aberto no terminal com `.env` criado (é onde o token vai ser colado) | [guia-env-e-chaves](../01-pre-requisitos/guia-env-e-chaves.md) |

> ⚠️ **A Verificação de Empresa NÃO é uma porta que você precisa atravessar antes de continuar.** Ela roda sozinha em segundo plano, em dias. Dispare (ou nem dispare) e **vá direto para o passo 2**. Ela só volta a importar se o teste de ESCRITA do passo 9.3 reclamar de empresa não verificada (erro E14). **Não fique parado nela** — foi assim que um aluno perdeu horas em execução real (24/07).

> ⚠️ **Existem DOIS telefones diferentes nesta jornada — não confunda (a confusão nº 1 do fluxo):**
>
> | Qual | Vai para qual número | Você escolhe o número? | Trava o quê |
> |---|---|---|---|
> | **SMS da conta de desenvolvedor** (passo 2) | o **seu celular**, o de hoje | **Sim**, você digita | Trava o passo 2 — resolve na Central de Contas (erro E2) |
> | **Verificação de Empresa** (fundação, passo 5) | o telefone **cadastrado no CNPJ** na Receita, muitas vezes antigo | **Não**, vem do CNPJ | **Não trava nada agora** — e tem saída por documento (erro F11) |
>
> Se o telefone do CNPJ está velho e inalcançável, isso **não te impede** de gerar o token e ler/escrever. Siga.

---

## 2. Conta de desenvolvedor (primeira vez · 5–10 min)

1. Abra `developers.facebook.com` **logado no perfil que é admin do BM** (confira no canto superior direito).
2. **"Começar"/"Get Started"**. Se já aparece **"Meus apps"** no topo, você já tem conta — pule pro passo 3.
3. Assistente de 4 telas: **Registrar** (aceitar termos) → **Verificar conta** → **Contato** (confirmar e-mail) → **Sobre você** → pronto.
4. Na tela **"Verificar sua conta"**: escolha o **País (Brasil +55)**, digite o **seu celular de hoje** e clique **"Enviar SMS para verificação"** → chega um **código de 6 dígitos** → digite.
   - ⚠️ Apareceu em **vermelho** *"Você só pode concluir esta ação na Central de Contas"*? O número já está preso ao seu perfil. **O próprio aviso tem um link azul "Central de Contas" — clique NELE**, confirme/troque o número lá, e volte. É o erro **E2** (caso real, 24/07).
   - SMS não chega de jeito nenhum? Erro **E1** (o mais comum de todos).
   - 🅱️ **Plano B que está na mesma tela e quase ninguém vê:** no rodapé há *"Você também pode verificar sua conta **adicionando um cartão de crédito**"*. Isso verifica sua **identidade**, **não é cobrança e não é verba de anúncio** — é o atalho quando o SMS empaca.
5. Em **"Sobre você"** pode marcar qualquer opção (**Desenvolvedor** é a mais alinhada) — não muda permissão nenhuma, é só estatística da Meta.
6. Prova de sucesso: menu **"Meus apps"** visível no topo.

## 3. Criar o app (10 min) — com as TRÊS variações de tela conhecidas

1. **Meus apps → Criar app**.
2. Tela "Requisitos" (se aparecer) → Avançar.
3. **Tela de casos de uso** — três variações documentadas (as duas primeiras do repo, a terceira confirmada em fonte externa):
   - **Variação A (a mais comum hoje):** aparece uma tela de cartões — "Autenticar e solicitar dados com Login do Facebook", "Interação com o WhatsApp", "Gerenciar tudo em Anúncios", "Games", **"Outro"**. Clique em **"Outro"** → **Avançar**. ⚠️ **A Meta pergunta DE NOVO e você clica em "Outro" outra vez** — são **dois "Outro" seguidos**, em duas telas diferentes (confirmado em execução real 24/07). Só então → tipo de app: **"Negócios"/"Empresa"** → Avançar.
   - **Variação B (contas antigas):** direto "Que tipo de app?" → **Empresa**.
   - **Variação C:** cartão **"Anúncio e monetização"** (pode marcar as opções dele) → Avançar. Dá no mesmo destino.
4. **Detalhes:** nome sem acento/emoji, nunca com "Meta/Facebook/Insta" (ex.: `Cohort Trafego`) · seu e-mail.
5. ⚠️ **Portfólio empresarial (BM):** SELECIONE o seu BM aqui. Deixar em branco = a causa nº 1 da "lista de permissões vazia" lá na frente (erro E3). 
6. **Criar app** → a Meta pede senha/2FA (tenha o celular por perto) → confirme.
7. ⚠️ **O modo do app — o passo que mais gera erro, leia inteiro antes de clicar em nada.**

   **Onde fica:** uma **chavinha (liga/desliga) na barra do TOPO da página do app**, na mesma linha do nome do app, com o rótulo **"Em desenvolvimento"** / **"Desenvolvimento — Ativo"**.

   **O que fazer: NADA.** O app **já nasce em Desenvolvimento**, que é exatamente o modo certo. "Deixe em Desenvolvimento" significa **não encostar nessa chave**.

   | Modo | Quem pode usar | Exige política de privacidade, ícone, App Review? |
   |---|---|---|
   | **Desenvolvimento** (o seu) | só você e os SEUS ativos | **Não** — por isso você ignora tudo aquilo |
   | Ativo/Público | qualquer pessoa do mundo | **Sim**, tudo |

   ⚠️ **NÃO clique em "Ativar"/"Tornar público".** Ler e escrever na SUA conta funciona 100% em Desenvolvimento. Quem vira a chave leva o erro **E17** ("URL da Política de Privacidade inválido") — aconteceu em execução real (24/07), justamente por o guia antes não dizer onde a chave ficava nem avisar para não tocar nela.

   Banner "Acesso à API restrito"? → **"Ver ações necessárias"** → siga (erro E9).
8. **Configurações → Básico**: copie **ID do app** → `META_APP_ID=` · **"Mostrar"** na Chave Secreta (pede a senha de novo) → `META_APP_SECRET=`. Os outros campos (política, ícone, domínio) **ignore** — não são necessários pra leitura.
9. *(Cinto e suspensório, de fonte externa — opcional mas elimina uma classe de erros:)* atribua a conta de anúncios **também ao APP**: business settings → **Contas → Aplicativos** → selecione o app → **Atribuir ativos → Contas de anúncios** → sua conta → salvar.

## 4. Usuário do Sistema (o "robô" · 5 min)

1. `business.facebook.com/settings` (se abrir o Business Suite novo: engrenagem → "Configurações da empresa").
2. **Usuários → Usuários do sistema → Adicionar**.
3. Nome `leitor-trafego` · função: **decida pela seção 0.1** —
   - **Só LER** → **Funcionário** (menos poder = menos risco).
   - **Também ESCREVER/publicar** → **Administrador**. ⚠️ Escolher Funcionário aqui e querer publicar depois obriga a refazer o token.
4. Não deixou criar? Veja o erro **E6** (BM novo/limite).

## 5. Atribuir os ativos (⚠️ ANTES do token — a ordem é obrigatória)

Com `leitor-trafego` selecionado → **"Atribuir ativos"** (às vezes atrás do menu "..."):
1. Aba **Apps** → `Cohort Trafego` → chavinha **"Gerenciar app"** → Salvar. *(É este toggle que destrava os escopos do token. A mesma coisa pode ser feita pelo lado do app: no app → "Atribuir pessoas" → adicionar o usuário do sistema com "Gerenciar aplicativo" — é o MESMO vínculo por outra porta.)*
2. De novo → aba **Contas de anúncios** → sua conta → marque conforme a seção 0.1: **"Ver desempenho"** (só ler) **ou "Gerenciar campanhas"** (ler + publicar) → Salvar.
3. (Só p/ orgânico da Aula 4) aba **Páginas** → leitura → Salvar.
4. ⏱ **Espere 2–5 minutos** (propagação — gerar o token no segundo seguinte às vezes vem sem permissões).

> ⚠️ **Se ao terminar a atribuição do APP a Meta te jogar direto num assistente** com as etapas *"Selecionar app → Definir expiração → Atribuir permissões → Concluir"* e a mensagem **"Nenhuma permissão disponível"**: você caiu no gerador de token cedo demais, **antes** de atribuir a conta de anúncios e antes da propagação. **Cancele essa tela**, termine o item 2 acima, espere os 2–5 min, e só então volte pelo passo 6. (Caso real 24/07 — detalhes no erro **E3**.)

## 6. Gerar o token (2 min + atenção máxima ao copiar)

1. Usuário selecionado → **"Gerar novo token"** → escolha o app.
2. **Expiração: "Nunca"** (se só houver "60 dias", ok — anote no calendário).
3. **Escopos** (marque na tela "Atribuir permissões"), conforme a seção 0.1:
   - **Só LER:** `ads_read` ✅ + `business_management` ✅
   - **Ler + ESCREVER/publicar:** `ads_read` ✅ + `business_management` ✅ + **`ads_management`** ✅ (é este que libera publicar — estruturador Gates 2/3)

   Nada além disso é necessário. Lista vazia nessa tela? → erro **E3**.
4. **Gerar** → pode aparecer um pop-up de **verificação de conta/identidade** no meio (erro E7 — normal, complete e volte).
5. O token aparece **UMA única vez** → copie → cole no `.env` (como abrir o `.env`: item 8.0 abaixo) → salve → só então feche. ⚠️ **NUNCA** cole o token em grupo, print público ou GitHub — quem tem o token acessa a conta (nem no chat com o Claude/Codex: eles não precisam ver o token, só que ele esteja no `.env`).

## 7. Alternativa rápida (só pra testar HOJE, sem System User)

Fluxo das fontes externas, útil pra validar a conexão em 5 minutos — **mas expira**:
1. `developers.facebook.com/tools/explorer` → selecione o app → **"Generate Access Token"** (faz login, escolhe página/conta, aceita) → marque `ads_read`.
2. O token dura **~1–24 h**. Pra esticar: **Ferramentas → Depurador de Token** (`/tools/debug/accesstoken`) → colar → **"Estender token"** → vira ~30–60 dias.
3. Serve para o teste do passo 9. **Não** deixe o projeto dependendo dele: quando sumir do nada (e some), volte ao passo 4 e faça o definitivo.

## 8. Colar no `.env` e pegar os IDs dos ativos

**8.0 — Como abrir e editar o `.env`** (as linhas já existem no arquivo, você só preenche o depois do `=`):

| Sistema | Comando no terminal, dentro da pasta do projeto |
|---|---|
| Windows | `notepad .env` |
| macOS | `open -e .env` |
| Linux | `nano .env` |

Preencha três linhas, **sem espaço e sem aspas** depois do `=`:
```
META_ACCESS_TOKEN=<o token do passo 6>
META_APP_ID=<ID do app, passo 3.8>
META_APP_SECRET=<Chave Secreta, passo 3.8>
```
Salve e feche. Detalhes de `.env` em geral: [guia-env-e-chaves](../01-pre-requisitos/guia-env-e-chaves.md).

**8.1 — Os IDs (a máquina descobre sozinha):**

1. Automático: `node scripts/zelador-audit.mjs --gravar-env` → grava `META_AD_ACCOUNT_ID`, `META_PIXEL_ID`, `META_FACEBOOK_PAGE_ID`, `META_BUSINESS_MANAGER_ID` (Instagram é manual).
2. **Vários ativos?** O script **não grava nada** (nunca escolhe por você) — ele LISTA as opções no relatório pra você copiar a linha certa. Só contas: `node scripts/painel-trafego-data.mjs --listar-contas`.
3. Na mão (plano B): conta = número na URL do Ads Manager (`act=123...` → grave **só o número, sem `act_`**) · pixel = Events Manager → Fontes de dados · página = Página → Sobre → ID · BM = business settings → Informações da empresa · Instagram = business settings → Contas → Contas do Instagram.

## 9. Testes de sucesso (nesta ordem)

1. `node scripts/zelador-audit.mjs --gravar-env` → descobre e grava sozinho `META_AD_ACCOUNT_ID` e `META_BUSINESS_MANAGER_ID`. Saída esperada: linhas `✚ META_AD_ACCOUNT_ID=...  ("Nome da sua conta")`.
2. `node scripts/zelador-audit.mjs --json` → procure `✔ token_valido` (mostra **tipo SYSTEM_USER**, a **validade** e a **quantidade de escopos**). Confira a validade aqui: se aparecer "expira em ~59 dias", o token saiu de 60 dias e **não** de "Nunca" — funciona igual, só anote a data ou gere outro escolhendo **Nunca** (2 min, os ativos já estão atribuídos).
3. `node scripts/painel-trafego-data.mjs --account` → tem de responder **`"modo": "api"`**. (Respondeu `"exemplo"`? Falta `META_AD_ACCOUNT_ID` — erro **E13**.)
   > ✅ **Conta nova, sem campanha nenhuma, volta `"campanhas": []` e `"sem_dados": true` — e isso está CERTO.** Sem anúncio rodando não existe número para ler; o que este teste prova é a **conexão**, não a existência de dados. Ver erro **E18**.
4. Vai publicar via API? `node scripts/zelador-audit.mjs --testar-escrita` → procure **`✔ api_escrita_habilitada`** ("conta aceita escrita deste app — Estruturador pode publicar via API"). Cria e apaga um rótulo invisível: **não gasta nada**. Exige `ads_management` no token.
   > ℹ️ **`STATUS GERAL: CRITICO` no relatório do zelador não invalida nada disso.** Esse status soma itens de campanha no ar (pagamento, pixel, domínio, página) que você propositalmente ainda não fez. Os testes 3 e 4 são o que decide se a API está funcionando. Ver erro **E19**.

---

## POSSÍVEIS ERROS — o catálogo completo (todos os já registrados)

> Regra de ouro herdada do PS: **a Meta demora a persistir** (~10 min em algumas telas). Antes de concluir que quebrou: espere, atualize, refaça o passo. E se travar de vez: print da tela + "estou preso aqui, o que fazer? pesquise" pro Claude/Codex.

| # | Sintoma | Causa provável | O que fazer (em ordem) |
|---|---|---|---|
| **E1** | **SMS de verificação não chega** (caso real do PS — dias sem chegar; problema RECORRENTE nos fóruns oficiais da Meta, onde o sistema chega a **bloquear novos pedidos de código** após várias tentativas, por proteção anti-spam) | operadora × Meta; anti-spam após tentativas; bloqueador de SMS no celular | 1) confira o formato: tente **com e sem o 9º dígito**; 2) **espere 15+ min entre tentativas** (clicar "reenviar" seguidas vezes ativa o anti-spam e piora); 3) desative temporariamente **antivírus/bloqueador de SMS** do celular e confira sinal/armazenamento; 4) tente **outro número** de confiança; 5) procure a opção de confirmar por **e-mail ou WhatsApp** quando oferecida (a Central de Ajuda oficial indica o e-mail como alternativa ao SMS); 6) espere **algumas horas/1 dia** (a fila reseta); 7) persiste → suporte da Meta (`facebook.com/business/help`) com print |
| **E2** | Na tela "Verificar sua conta", o campo do celular fica com borda vermelha e o aviso **"Você só pode concluir esta ação na Central de Contas. Acesse a Central de Contas para enviar um novo código de confirmação por SMS"** (2 casos reais: PS e 24/07) | o número/2FA é gerenciado na Central de Contas (accountscenter) e não na tela atual | 1) **o próprio aviso vermelho tem um link azul "Central de Contas" — clique nele** (é o caminho mais curto; muita gente lê o aviso como "erro" e não percebe que é link); 2) ou abra direto `accountscenter.facebook.com` → **Detalhes pessoais / Informações de contato** → confirme o número, ou **remova o antigo e adicione o seu atual**; 3) volte à tela de developers e clique **"Enviar SMS para verificação"**; 4) empacou de vez? use o **cartão de crédito** oferecido no rodapé da MESMA tela ("Você também pode verificar sua conta adicionando um cartão de crédito") — verifica identidade, **não é cobrança nem verba de anúncio** |
| **E3** | **"Nenhuma permissão disponível — Atribua uma função do app ao usuário do sistema ou selecione outro app para continuar"** / lista de permissões VAZIA na etapa "Atribuir permissões" (caso real 24/07: a tela apareceu sozinha logo após atribuir o app, antes de atribuir a conta) | app não atribuído ao usuário do sistema; ou app criado SEM portfólio empresarial; ou simplesmente **propagação** (o mais comum) | 1) **cancele o assistente de token** — ele abriu cedo demais; 2) confira o passo 5.1: no `leitor-trafego`, aba **Aplicativos**, o app tem de estar listado com **"Gerenciar app" LIGADO** (se não estiver, ligue e Salve); 3) faça o passo 5.2 (conta de anúncios) — sem ele o token não serve pra nada mesmo; 4) app sem BM? vincule: business settings → Contas → Aplicativos → Adicionar → ID do app; 5) **espere 2–5 min** (às vezes ~10) e só então gere o token |
| **E4** | **"(#10) Permission Denied"** ao ler a conta | conta de anúncios não atribuída ao robô; ou propagação | refaça o passo 5.2 ("Ver desempenho"); aguarde minutos. **Atenção:** `#10` só no item de PAGAMENTO do zelador é **normal** com "Ver desempenho" (não vê cobrança) — o teste que vale é o `--account` responder `"modo":"api"` |
| **E5** | **Token morreu em horas/dias** | foi gerado no Graph Explorer (passo 7), não no System User | faça o definitivo (passos 4–6); o do Explorer é só pra teste |
| **E6** | **"Usuários do sistema" não deixa criar** / "disponível em breve" / limite atingido | BM recém-criado sem "idade"/verificação; ou limite de usuários do BM | 1) espere horas/1 dia e tente; 2) faça a **Verificação de Empresa** (CNPJ/MEI, seção 1) — destrava; 3) limite atingido: apague um usuário do sistema antigo sem uso |
| **E7** | Pop-up de **verificação de conta/identidade** no meio da geração do token | checagem de segurança padrão da Meta | complete (senha/2FA/selfie quando pedir) e refaça o "Gerar token" — o fluxo continua de onde parou |
| **E8** | **Nome do app recusado** sem explicação | acento/emoji, ou "Meta/Facebook/Insta/FB/IG" no nome | renomeie simples e sem marca: `Cohort Trafego` |
| **E9** | Banner **"Acesso à API restrito"** no painel do app | cadastro de dev incompleto | botão **"Ver ações necessárias"** → normalmente é só confirmar contato |
| **E10** | **A tela não bate com o guia** (menus diferentes) | a Meta muda a UI por época E por conta (confirmado: dois apps da mesma pessoa com menus diferentes) | procure o nome equivalente; use a busca do menu lateral; em último caso, print + "o guia diz X, minha tela mostra Y — me guie" pro Claude/Codex |
| **E11** | Pede **senha/2FA** no meio de qualquer passo | normal ao criar app, mostrar App Secret e gerar token | tenha o celular por perto; não é erro |
| **E12** | `--gravar-env` **não gravou nada** | mais de um ativo do mesmo tipo (ele nunca escolhe por você) | leia o relatório do zelador: ele lista as opções → copie a linha certa no `.env` |
| **E13** | Painel responde **"modo": "exemplo"** com token válido | falta `META_AD_ACCOUNT_ID` no `.env` | preencha (passo 8) e rode de novo |
| **E14** | Algo exige **empresa verificada** | BMs novos/casos de uso avançados | Verificação de Empresa (seção 1): CNPJ (aceita MEI), Meta liga no telefone do CNPJ com código; 1+ dias úteis |
| **E15** | Mudou algo e **não refletiu** | persistência lenta da Meta (~10 min) | espere, atualize a página, refaça o passo — antes de concluir que quebrou |
| **E16** | **Token "que não expira" morreu do nada** — erro `190 / OAuthException` ("Error validating access token: the session has been invalidated") | você **trocou a senha** do Facebook, fez logout forçado, ou a Meta invalidou por **evento de segurança** (atividade suspeita) — token permanente ≠ token imortal | 1) não perca tempo depurando: gere um **token novo** (passos 4–6, leva 2 min, os ativos continuam atribuídos); 2) troque no `.env` e rode o teste do passo 9; 3) se invalidar de novo em dias: confira alertas de segurança na conta (`accountscenter.facebook.com`) e ative 2FA |
| **E17** | **"URL da Política de Privacidade inválido — Você deve fornecer um URL válido da Política de Privacidade para que seu app fique ativo. Acesse Configuração do app → Básico"** (caso real 24/07) | você clicou na chavinha do topo tentando **ATIVAR / tornar o app público**. Modo Ativo exige política de privacidade, ícone e App Review; **Desenvolvimento não exige nada disso** | 1) **não preencha URL nenhuma e não tente ativar** — você não precisa do app público pra usar a SUA conta; 2) confirme que a chavinha do topo está em **"Em desenvolvimento"** (ela já vem assim; a ativação normalmente é **barrada** pelo próprio erro, ou seja o app continua em Desenvolvimento — nada quebrou); 3) se conseguiu ativar, **volte a chave para Desenvolvimento**; 4) a mensagem pode continuar aparecendo como aviso: **ignore**, ela não afeta ler nem escrever (passo 3.7) |
| **E18** | Teste do passo 9.3 responde `"modo":"api"` mas com **`"campanhas": []`, `"series"` vazias e `"sem_dados": true`** | a conta **não tem campanha nenhuma** (nunca rodou anúncio) — não há métrica para existir | **nada a corrigir: é o resultado CERTO.** `"modo":"api"` já prova a conexão. Os números aparecem sozinhos depois que uma campanha rodar e gastar. Quer ver o painel cheio antes disso? Use o **Modo Exemplo** da `/analista-de-dados` |
| **E19** | Zelador imprime **`STATUS GERAL (API): CRITICO`** mesmo com token válido e testes passando | o status geral soma itens de **campanha no ar** (pagamento aprovado, pixel, domínio verificado, página vinculada) que ainda não existem no seu setup | 1) **não é falha do token**: os itens que valem pra API são `✔ token_valido` e `✔ api_escrita_habilitada`, e eles estão verdes; 2) ⚠️ **mas atenção:** a skill `/estruturador` **se recusa a montar campanha enquanto o status for CRITICO** (ela exige pixel e fundação em ordem — é proteção, não bug). Ou seja: token OK ≠ pronto pra publicar pela skill; 3) para zerar o CRITICO quando for anunciar de verdade: pagamento ([guia-meta-fundacao](guia-meta-fundacao.md) passo 6), pixel/CAPI ([guia-pixel-capi](guia-pixel-capi.md)), domínio e página |
| **E20** | **"Empresa não verificada"** aparece nos avisos e você **não consegue** a verificação porque o **telefone do CNPJ é antigo** e o SMS/ligação nunca chega | a Meta usa o telefone do registro público do CNPJ, que você não escolhe | 1) **não trava ler nem gerar token** — siga o guia inteiro assim mesmo; 2) quando precisar mesmo (erro E14), verifique **por documento** em vez de telefone → [guia-meta-fundacao](guia-meta-fundacao.md) erro **F11** |

---

## Pronto. Próximos passos

| Agora | O quê |
|---|---|
| ▶️ Fazer | rode os testes do passo 9 (`--gravar-env`, `--json`, `--account` respondendo `"modo": "api"`, e `--testar-escrita` se for publicar) — só siga adiante com eles verdes |
| 📖 Ler | próximo da cadeia: [guia-pixel-capi.md](guia-pixel-capi.md) → [guia-criativos.md](../04-operacao/guia-criativos.md) → [guia-campanha-no-ar.md](../04-operacao/guia-campanha-no-ar.md) |
| ▶️ Se o objetivo era PUBLICAR via API | quem monta a campanha é a skill **`/estruturador`** (Gates 2/3) — este guia só entrega o token com poder de escrita. Ela exige `api_escrita_habilitada: true` **e** `zelador.status_geral` diferente de `CRITICO` (ver erro **E19**) |
| 🧭 Se ainda não vai investir | pare aqui: com `"modo":"api"` e `✔ api_escrita_habilitada` sua conexão está **completa**. Números só aparecem depois de campanha rodando (erro E18); enquanto isso, use o **Modo Exemplo** da `/analista-de-dados` para conhecer o painel |
| 🚑 Se travar | o catálogo E1–E20 acima (SMS que não chega, permissões vazias, política de privacidade, painel vazio, token que morreu...) — e a regra de ouro: a Meta demora ~10 min a persistir; espere antes de concluir que quebrou |
