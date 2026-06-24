# DESIGN.md — Cohort de Marketing com Claude Code
# Academia Lendár[IA] · academialendaria.ai/cohort-marketing
# Extraído via Playwright em 24/06/2026

---

## Identidade da Marca

**Nome do produto:** Cohort de Marketing com Claude Code
**URL de referência:** academialendaria.ai/cohort-marketing
**Tom visual:** dark premium · sem emoji · sem gradientes coloridos · hierarquia clara

---

## Paleta de Cores

### Cores principais
| Token | Hex | RGB | Uso |
|---|---|---|---|
| `--cor-fundo` | `#000000` | `rgb(0, 0, 0)` | Fundo da página (body) |
| `--cor-texto` | `#EDEBE6` | `rgb(237, 235, 230)` | Texto corrido, parágrafos |
| `--cor-titulo` | `#FAFAFA` | `rgb(250, 250, 250)` | Headlines, títulos |
| `--cor-cta-texto` | `#FEF5EC` | `rgb(254, 245, 236)` | Texto dos botões de CTA |

### Cores de destaque (accent)
| Token | Hex | RGB | Uso | Frequência na página |
|---|---|---|---|---|
| `--cor-champagne` | `#DCCBB6` | `rgb(220, 203, 182)` | Destaque principal, âncoras visuais | alta (23 ocorrências) |
| `--cor-champagne-escuro` | `#D2BEA7` | `rgb(210, 190, 167)` | Variação de destaque | média |
| `--cor-champagne-claro` | `#E8DAC9` | `rgb(232, 218, 201)` | Hover, elementos secundários | média |
| `--cor-cinza` | `#A3A3A3` | `rgb(163, 163, 163)` | Textos secundários, metadados | muito alta (27) |
| `--cor-cream` | `#EDEBE6` | `rgb(237, 235, 230)` | Corpo de texto | alta |

### Bordas dos botões
| Contexto | Borda |
|---|---|
| Botão primário (CTA quente) | `rgba(255, 255, 255, 0.16)` |
| Botão secundário | `rgba(255, 255, 255, 0.10)` |
| Background sutil | `rgba(255, 255, 255, 0.04)` |

---

## Tipografia

### Fontes
| Papel | Fonte | Peso | Tamanho referência |
|---|---|---|---|
| **Headline principal (H1)** | `Rajdhani` | 700 (Bold) | 64px |
| **Subtítulos (H2/H3)** | `Inter Tight` | 800 (ExtraBold) | 38px |
| **Corpo / parágrafos** | `Inter` | 400–500 | 16–18px |
| **CTAs / botões** | `Inter` ou `Inter Tight` | 600 | 16px |

### Stack completa
```css
--fonte-titulo: 'Rajdhani', 'Inter', sans-serif;
--fonte-subtitulo: 'Inter Tight', 'Inter Tight Fallback', sans-serif;
--fonte-corpo: 'Inter', -apple-system, 'Segoe UI', Roboto, sans-serif;
```

---

## Estilo dos Botões

### Botão primário (CTA de venda)
```
fundo: rgba(0, 0, 0, 0) — transparente
texto: #FEF5EC
borda: 1px solid rgba(255, 255, 255, 0.16)
```
Exemplo: "Entrar agora", "Entrar na Máquina de Receita"

### Botão secundário
```
fundo: rgba(255, 255, 255, 0.04) — dark glass
texto: #EDEBE6
borda: 1px solid rgba(255, 255, 255, 0.10)
```
Exemplo: "Ver preços", "Ver como funciona"

---

## Regras Visuais

- **Nunca usar emoji** — marcadores são numéricos ou traço
- **Nunca usar gradientes coloridos** — se houver gradiente é escuro/neutro
- **Destaques em champagne** (`#DCCBB6`) — nunca em amarelo ou laranja
- **Títulos em Rajdhani maiúsculo** para headline principal; Inter Tight para subtítulos
- **Fundo sempre preto** — nenhuma seção usa fundo claro
- **Textos secundários em cinza** (`#A3A3A3`) — metadados, labels, labels de preço
- **Cream** (`#EDEBE6`) para corpo corrido — nunca branco puro

---

## Logo e Marca

- **Nome curto:** Academia Lendár[IA]
- **Nome do produto:** Cohort de Marketing com Claude Code
- **Slogan implícito:** "Máquina de Receita com IA"
- **Logo:** arquivo em `app/public/avatar-academia.png`

---

## Exemplos de Copy da Página (referência de tom)

**Headline principal (verbatim da página):**
> "CONSTRUA SUA MÁQUINA DE RECEITA COM IA"

**Subtítulo (tom):**
> "Você não tem um problema de ferramenta."
> "8 semanas para sair de peças soltas para [resultado]"
> "Marketing sem vendas vira lead parado."

**Tom:** direto, sem rodeios, diagnóstico antes de solução, sem hype

---

*DESIGN.md gerado via Playwright em 24/06/2026 · academialendaria.ai/cohort-marketing*
*Para uso na skill /pagina-vendas — demo Aula de Funil · Érica · Semana de Marketing*
