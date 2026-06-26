# Cohort de Marketing com Claude Code

> **Academia Lendária**
>
> Sua máquina de marketing com IA, rodando em 4 semanas.

Bem-vinda ao repositório oficial do **Cohort de Marketing**. Este repo contém todo o material das aulas ao vivo, skills do Claude Code, templates e exemplos. É clone-and-run: você clona, abre Claude Code, e começa a executar.

---

## Comece por aqui

```bash
git clone https://github.com/marketingLendario/cohort-de-marketing.git
cd cohort-de-marketing
claude
```

As skills em `.claude/skills/` carregam automaticamente. Digite `/` no Claude Code e veja as 6 skills disponíveis da Aula 01.

---

## Aulas do cohort

### Aula 1 · Pesquisa, Concorrentes e Ofertas com Claude Code

**Status:** disponível
**Onde:** [`aula-01/`](./aula-01/)

Mapear mercado, ler concorrentes e desenhar uma oferta que sai da gaveta. Skills usadas: `/avatar-funil`, `/espiao-do-concorrente`, `/trend-hunting`, `/swipe-file`, `/offerbook`.

**Comece pelo guia visual:** [`aula-01/GUIA-DO-ALUNO.html`](./aula-01/GUIA-DO-ALUNO.html)

### Aula 2 · Funil e Páginas

**Status:** em breve (publicada na semana da aula)

Estruturar o funil, gerar a página de venda e produzir uma bateria de criativos prontos para rodar.

### Aula 3 · Tráfego e Criativos

**Status:** em breve

### Aula 4 · Dados e Receita

**Status:** em breve

---

## As 6 skills da Aula 01

Instaladas em `.claude/skills/` na raiz. Carregam automaticamente.

### Pesquisa e Oferta

| Skill | O que faz |
|---|---|
| `/avatar-funil` | Pesquisa de avatar em 7 dimensões + focus group sintético (MD + HTML + PDF) |
| `/espiao-do-concorrente` | Dossiê multi-fonte de 1 concorrente (Meta Ad Library + Google Ads + redes + site + reviews) |
| `/trend-hunting` | Identifica tendências emergentes em 4 fontes antes da saturação |
| `/swipe-file` | Organiza criativos winners categorizados por tipo/formato/padrão |
| `/offerbook` | Livro da Oferta em 7 blocos (MD + DOCX usando template oficial) |

### Apoio (brand do entregável)

| Skill | O que faz |
|---|---|
| `/design-md` | Gera DESIGN.md com a sua brand (logo + cores + fontes). `/avatar-funil` e `/offerbook` usam pra renderizar HTML com a sua identidade. Opcional — se não rodar, sai com brand Academia Lendária. |

As skills da Aula 02 serão publicadas na semana da aula.

---

## Estrutura do repo

```
.
├── README.md                    este arquivo
├── .env.example                 template de chaves de API (copie para .env)
├── .gitignore
├── .claude/
│   └── skills/                  6 skills carregam automaticamente (Aula 01)
└── aula-01/                     Pesquisa, Concorrentes e Ofertas
    ├── README.md
    ├── GUIA-DO-ALUNO.html       leia primeiro
    ├── docs/                    workflow + handoff + SKILLS-INDEX (mapa de nomes)
    └── templates/               Template-Offerbook.docx
```

---

## Configuração (chaves de API opcionais)

```bash
cp .env.example .env
```

Abra o `.env` e preencha as chaves que quiser usar. Todas são opcionais — as skills funcionam em modo manual sem chaves. Cada chave tem instrução de onde pegar no `.env.example`.

---

## Regras de ouro do cohort

### Pesquisa antes da oferta

A regra-mãe: **pesquisa antes da oferta, oferta antes de copy, copy antes de ads**. Pular essa ordem queima verba.

### Voz do cliente, sempre verbatim

Toda seção com dados reais precisa de citação literal. Sem citação, marcar `[SUPOSIÇÃO]`. Persona inventada vira oferta que não vende.

### Brecha de ângulo > brecha de preço

Preço é copiável em 30 dias. História (ângulo) não se copia.

### Offerbook antes de qualquer copy

Nada de LP, e-mail ou ad antes do offerbook aprovado pelo dono do negócio.

---

## Suporte

- **"Tinha uma skill chamada X, qual é?":** consulte [`aula-01/docs/SKILLS-INDEX.md`](./aula-01/docs/SKILLS-INDEX.md) — mapa de nomes (aliases antigos → canônico)
- **Dúvidas técnicas:** abra issue neste repo
- **Dúvidas de conteúdo:** canal do cohort
- **Bug ou melhoria:** PR direto neste repo

---

**Construído com:** Academia Lendária + Claude Code
