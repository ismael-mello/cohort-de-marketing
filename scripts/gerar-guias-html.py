#!/usr/bin/env python3
"""Gera a versão HTML (para humanos) de cada guia em markdown (para a IA).

Uso, da raiz do repositório:
    python scripts/gerar-guias-html.py           # gera guias/**/*.html e guias/index.html
    python scripts/gerar-guias-html.py --check   # confere sem gerar: links, 8 blocos, erros, HTML desatualizado

Regra "html = humano · md = IA": edite sempre o .md e rode o script.
O .html sai ao lado do .md, com o mesmo nome; o guias/README.md vira guias/index.html.
Sem dependências: só a biblioteca padrão do Python 3.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUIAS = os.path.join(ROOT, 'guias')
MARCA = 'Gerado por scripts/gerar-guias-html.py'
RE_ERRO = re.compile(r'^\|\s*[*`]*[A-Z][A-Z0-9]{0,2}\d+[*`]*\s*\|', re.M)


def nome_do_cohort():
    """'Cohort de Produto', 'Cohort de Marketing'… lido do Guia do Aluno; senão, do nome da pasta."""
    gda = os.path.join(ROOT, 'GUIA-DO-ALUNO.html')
    if os.path.exists(gda):
        m = re.search(r'Cohort de [A-ZÀ-Ú][\wÀ-ú]+', open(gda, encoding='utf-8').read())
        if m:
            return m.group(0)
    return os.path.basename(ROOT).replace('-', ' ').title()


COHORT = nome_do_cohort()


def html_manual(caminho_html):
    """True se já existe um .html que NÃO foi gerado por este script (espelho feito à mão)."""
    if not os.path.exists(caminho_html):
        return False
    return MARCA not in open(caminho_html, encoding='utf-8').read()

# os 8 blocos do padrão; títulos podem vir numerados ("## 1. Pré-requisitos", "## 9. Testes de sucesso")
BLOCOS = [('**Estou perdido em:**', r'\*\*Estou perdido em:\*\*'),
          ('**O que você vai ter no final:**', r'\*\*O que você vai ter no final:\*\*'),
          ('**Fontes cruzadas:**', r'\*\*Fontes cruzadas:\*\*'),
          ('## Pré-requisitos', r'^##\s+(\d+\.\s+)?Pré-requisitos'),
          ('## Teste de sucesso', r'^##\s+(\d+\.\s+)?Testes? de sucesso'),
          ('## POSSÍVEIS ERROS', r'^##\s+(\d+\.\s+)?POSSÍVEIS ERROS'),
          ('## Pronto. Próximos passos', r'^##\s+Pronto\. Próximos passos')]


# ---------------------------------------------------------------- markdown -> html

def destino_html(href, pasta):
    """Troca link para .md de guia por .html (README.md vira index.html)."""
    if re.match(r'^[a-z]+:', href) or href.startswith('#'):
        return href
    caminho, _, ancora = href.partition('#')
    if not caminho.endswith('.md'):
        return href
    alvo = os.path.normpath(os.path.join(pasta, caminho))
    if not alvo.startswith(GUIAS) or not os.path.exists(alvo):
        return href
    novo = caminho[:-3] + '.html'
    if os.path.basename(caminho) == 'README.md':
        novo = caminho[:-len('README.md')] + 'index.html'
    return novo + ('#' + ancora if ancora else '')


def inline(texto, pasta):
    guardados = []

    def guarda(trecho):
        guardados.append(trecho)
        return '\x00%d\x00' % (len(guardados) - 1)

    texto = re.sub(r'`([^`]+)`', lambda m: guarda('<code>' + html.escape(m.group(1), quote=False) + '</code>'), texto)
    texto = html.escape(texto, quote=False)
    texto = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)',
                   lambda m: guarda('<a href="%s">' % html.escape(destino_html(html.unescape(m.group(2)), pasta)))
                   + m.group(1) + '</a>', texto)
    texto = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', texto)
    texto = re.sub(r'(?<![*\w])\*(?![\s*])(.+?)(?<![\s*])\*(?![*\w])', r'<em>\1</em>', texto)
    for _ in range(3):  # link dentro de código guardado, etc.
        texto = re.sub(r'\x00(\d+)\x00', lambda m: guardados[int(m.group(1))], texto)
    return texto


def celulas(linha):
    linha = linha.strip()
    if linha.startswith('|'):
        linha = linha[1:]
    if linha.endswith('|') and not linha.endswith('\\|'):
        linha = linha[:-1]
    partes, atual, em_codigo, i = [], '', False, 0
    while i < len(linha):
        c = linha[i]
        if c == '\\' and i + 1 < len(linha) and linha[i + 1] == '|':
            atual += '|'
            i += 2
            continue
        if c == '`':
            em_codigo = not em_codigo
        if c == '|' and not em_codigo:
            partes.append(atual.strip())
            atual = ''
        else:
            atual += c
        i += 1
    partes.append(atual.strip())
    return partes


def slug(texto):
    texto = re.sub(r'<[^>]+>', '', texto).lower()
    texto = re.sub(r'[^\w\s-]', '', texto)
    return re.sub(r'\s+', '-', texto.strip())


RE_ITEM = re.compile(r'^(\s*)([-*]|\d+\.)\s+(.*)$')
RE_TABELA_SEP = re.compile(r'^\s*\|?[\s:|-]+\|[\s:|-]*$')


def comeca_bloco(linhas, i):
    l = linhas[i]
    s = l.strip()
    return (not s or s.startswith('```') or re.match(r'^#{1,6}\s', l) or s.startswith('>')
            or RE_ITEM.match(l) or s == '---'
            or (s.startswith('|') and i + 1 < len(linhas) and RE_TABELA_SEP.match(linhas[i + 1])))


def blocos(linhas, pasta):
    out, i = [], 0
    while i < len(linhas):
        l = linhas[i]
        s = l.strip()
        if not s:
            i += 1
            continue
        if s.startswith('```'):
            recuo = len(l) - len(l.lstrip())
            lang = s[3:].strip()
            corpo = []
            i += 1
            while i < len(linhas) and not linhas[i].strip().startswith('```'):
                corpo.append(linhas[i][recuo:] if linhas[i][:recuo].strip() == '' else linhas[i])
                i += 1
            i += 1
            out.append('<div class="code"><button class="copiar" type="button">copiar</button>'
                       '<pre data-lang="%s"><code>%s</code></pre></div>'
                       % (html.escape(lang), html.escape('\n'.join(corpo), quote=False)))
            continue
        m = re.match(r'^(#{1,6})\s+(.*)$', l)
        if m:
            n = len(m.group(1))
            conteudo = inline(m.group(2).strip(), pasta)
            out.append('<h%d id="%s">%s</h%d>' % (n, slug(conteudo), conteudo, n))
            i += 1
            continue
        if s == '---':
            out.append('<hr>')
            i += 1
            continue
        if s.startswith('|') and i + 1 < len(linhas) and RE_TABELA_SEP.match(linhas[i + 1]):
            cab = celulas(l)
            i += 2
            linhas_t = []
            while i < len(linhas) and linhas[i].strip().startswith('|'):
                linhas_t.append(celulas(linhas[i]))
                i += 1
            th = ''.join('<th>%s</th>' % inline(c, pasta) for c in cab)
            trs = ''.join('<tr>%s</tr>' % ''.join('<td>%s</td>' % inline(c, pasta) for c in r) for r in linhas_t)
            out.append('<div class="tabela"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (th, trs))
            continue
        if s.startswith('>'):
            interno = []
            while i < len(linhas) and linhas[i].strip().startswith('>'):
                t = linhas[i].strip()[1:]
                interno.append(t[1:] if t.startswith(' ') else t)
                i += 1
            # cada linha de texto comum vira um parágrafo (os cabeçalhos dos guias são uma linha por item);
            # tabelas, listas e código dentro da citação são renderizados normalmente
            separado = []
            for k, t in enumerate(interno):
                comum = t.strip() and not re.match(r'^\s*(\||[-*]\s|\d+\.\s|```)', t)
                ant = interno[k - 1] if k else ''
                ant_comum = ant.strip() and not re.match(r'^\s*(\||[-*]\s|\d+\.\s|```)', ant)
                if k and comum and ant_comum:
                    separado.append('')
                separado.append(t)
            conteudo = blocos(separado, pasta)
            classe = ' class="aviso"' if interno and ('⚠️' in interno[0]) else ''
            out.append('<blockquote%s>%s</blockquote>' % (classe, ''.join(conteudo)))
            continue
        m = RE_ITEM.match(l)
        if m:
            base = len(m.group(1))
            ordenada = m.group(2)[0].isdigit()
            inicio = int(m.group(2)[:-1]) if ordenada else 1
            itens = []
            while i < len(linhas):
                m2 = RE_ITEM.match(linhas[i])
                if not m2 or len(m2.group(1)) != base or m2.group(2)[0].isdigit() != ordenada:
                    break
                conteudo = [m2.group(3)]
                i += 1
                while i < len(linhas):
                    prox = linhas[i]
                    if prox.strip() == '':
                        j = i + 1
                        if j < len(linhas) and linhas[j].startswith(' ' * (base + 2)) and linhas[j].strip():
                            conteudo.append('')
                            i += 1
                            continue
                        break
                    recuo = len(prox) - len(prox.lstrip())
                    if recuo > base:
                        conteudo.append(prox[min(recuo, base + 3):] if recuo >= base + 2 else prox.strip())
                        i += 1
                    elif not comeca_bloco(linhas, i):
                        conteudo.append(prox.strip())
                        i += 1
                    else:
                        break
                itens.append(conteudo)
            lis = []
            for conteudo in itens:
                caixa = ''
                if re.match(r'^\[[ xX]\]\s', conteudo[0]):
                    caixa = '<span class="caixa">%s</span> ' % ('☑' if conteudo[0][1] in 'xX' else '☐')
                    conteudo[0] = conteudo[0][4:]
                interno = blocos(conteudo, pasta)
                if len(interno) == 1 and interno[0].startswith('<p>'):
                    interno = [interno[0][3:-4]]
                lis.append('<li>%s%s</li>' % (caixa, ''.join(interno)))
            if ordenada:
                out.append('<ol%s>%s</ol>' % (' start="%d"' % inicio if inicio != 1 else '', ''.join(lis)))
            else:
                out.append('<ul>%s</ul>' % ''.join(lis))
            continue
        par = [s]
        i += 1
        while i < len(linhas) and not comeca_bloco(linhas, i):
            par.append(linhas[i].strip())
            i += 1
        out.append('<p>%s</p>' % inline(' '.join(par), pasta))
    return out


def converter(md, pasta):
    md = md.replace('\r\n', '\n')
    md = re.sub(r'<!--.*?-->', '', md, flags=re.S)
    return '\n'.join(blocos(md.split('\n'), pasta))


# ---------------------------------------------------------------- página

CSS = """
:root{--bg:#0a0a0d;--card:#111115;--raised:#26262b;--fg:#EFEBE4;--muted:#A09A92;--gold:#C9B298;--gold-hi:#E9DFD0;--gold-lo:#8D7556;--warn:#d97706;
--sans:'Inter Tight',system-ui,sans-serif;--serif:'Instrument Serif',Georgia,serif;--mono:'JetBrains Mono',ui-monospace,Menlo,monospace}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--gold-hi);text-decoration-color:var(--gold-lo);text-underline-offset:3px}a:hover{color:var(--gold)}
:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.topo{position:sticky;top:0;z-index:10;display:flex;gap:18px;align-items:center;padding:12px 28px;background:rgba(10,10,13,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--raised);font-size:.85rem}
.topo a{color:var(--muted);text-decoration:none}.topo a:hover{color:var(--gold)}.topo .area{margin-left:auto;color:var(--muted);font-family:var(--mono);font-size:.75rem}
.wrap{max-width:980px;margin:0 auto;padding:48px 28px 96px}
.cabeca{padding-bottom:28px;margin-bottom:32px;border-bottom:1px solid var(--raised)}
.cabeca .kicker{display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);padding:5px 14px;border:1px solid var(--gold-lo);border-radius:999px;margin-bottom:22px}
.cabeca h1{font-family:var(--serif);font-weight:400;font-size:clamp(2.3rem,5.5vw,3.6rem);line-height:1.04;letter-spacing:-.01em;margin:0}
.cabeca h1 em{color:var(--gold)}
main > h1{display:none}
h2{font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,3.4vw,2.3rem);line-height:1.1;margin:56px 0 16px;scroll-margin-top:70px}
h3{font-size:1.12rem;font-weight:600;margin:36px 0 10px;scroll-margin-top:70px}
h4{font-size:1rem;margin:28px 0 8px;color:var(--gold-hi)}
p{margin:14px 0}strong{color:var(--gold-hi);font-weight:600}
code{font-family:var(--mono);background:var(--raised);color:var(--gold-hi);padding:2px 7px;border-radius:4px;font-size:.84em;word-break:break-word}
blockquote{margin:22px 0;padding:14px 22px;background:var(--card);border-left:3px solid var(--gold);border-radius:8px}
blockquote p{margin:8px 0}blockquote.aviso{border-left-color:var(--warn);background:rgba(217,119,6,.07)}
.tabela{overflow-x:auto;margin:20px 0;border:1px solid var(--raised);border-radius:10px}
table{width:100%;border-collapse:collapse;font-size:.88rem}
th{text-align:left;padding:10px 14px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--card);border-bottom:1px solid var(--raised)}
td{padding:10px 14px;vertical-align:top;border-bottom:1px solid rgba(38,38,43,.7);line-height:1.5}
tr:last-child td{border-bottom:0}tbody tr:hover td{background:rgba(201,178,152,.04)}
td:first-child{color:var(--gold-hi)}
ul,ol{padding-left:24px}li{margin:6px 0}.caixa{color:var(--gold)}
.code{position:relative;margin:18px 0}
pre{margin:0;background:var(--card);border:1px solid var(--raised);border-radius:10px;padding:18px 20px;overflow-x:auto;font-family:var(--mono);font-size:.82rem;line-height:1.55;white-space:pre-wrap;word-break:break-word}
pre code{background:none;padding:0;color:var(--fg);font-size:inherit}
.copiar{position:absolute;top:8px;right:8px;font:600 .7rem var(--sans);letter-spacing:.06em;text-transform:uppercase;color:var(--gold);background:var(--bg);border:1px solid var(--gold-lo);border-radius:999px;padding:4px 12px;cursor:pointer}
.copiar:hover{border-color:var(--gold)}
hr{border:0;border-top:1px solid var(--raised);margin:40px 0}
.rodape{margin-top:72px;padding-top:20px;border-top:1px solid var(--raised);color:var(--muted);font-size:.85rem}
.busca{width:100%;margin:8px 0 4px;padding:14px 18px;font:inherit;color:var(--fg);background:var(--card);border:1px solid var(--raised);border-radius:10px}
.busca:focus{border-color:var(--gold);outline:none}
.busca-dica{color:var(--muted);font-size:.85rem;margin:0 0 24px}
@media (max-width:700px){body{font-size:16px}.wrap{padding:32px 16px 72px}.topo{padding:10px 16px}.topo .area{display:none}}
"""

JS = """
document.querySelectorAll('.copiar').forEach(function(b){b.addEventListener('click',function(){
var t=b.parentNode.querySelector('code').innerText;navigator.clipboard.writeText(t).then(function(){b.textContent='copiado';setTimeout(function(){b.textContent='copiar'},1600)})})});
var q=document.getElementById('busca');if(q){q.addEventListener('input',function(){var v=q.value.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');
document.querySelectorAll('tbody tr').forEach(function(tr){var s=tr.innerText.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');tr.style.display=!v||s.indexOf(v)>-1?'':'none'})})}
"""

PAGINA = """<!DOCTYPE html>
<!-- Gerado por scripts/gerar-guias-html.py a partir de {fonte}. Não edite este arquivo: edite o .md e rode o script. -->
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{titulo} · Guias · {cohort}</title>
{icone}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>
<nav class="topo">{menu}<span class="area">{area}</span></nav>
<main class="wrap">
<header class="cabeca"><span class="kicker">{kicker}</span><h1>{h1}</h1></header>
{extra}
{corpo}
<p class="rodape">Este guia também existe em markdown, para a IA ler: <a href="{md}">{md}</a>. No Claude Code: <code>@guias/{fonte_rel}</code>.</p>
</main>
<script>{js}</script>
</body>
</html>
"""


def titulo_de(md):
    m = re.search(r'^#\s+(.*)$', md, re.M)
    t = m.group(1).strip() if m else 'Guia'
    if ' — ' in t:
        nome, promessa = t.split(' — ', 1)
    else:
        nome, promessa = t, ''
    return nome, promessa


def gerar_um(caminho_md):
    pasta = os.path.dirname(caminho_md)
    md = open(caminho_md, encoding='utf-8').read()
    nome, promessa = titulo_de(md)
    eh_indice = os.path.basename(caminho_md) == 'README.md'
    rel = os.path.relpath(caminho_md, GUIAS).replace(os.sep, '/')
    profundidade = rel.count('/')
    raiz = '../' * (profundidade + 1)
    indice = '../' * profundidade + 'index.html'
    menu = ''
    if os.path.exists(os.path.join(ROOT, 'index.html')):
        menu += '<a href="%sindex.html">← Site da turma</a>' % raiz
    menu += '<a href="%s">Todos os guias</a>' % indice
    if os.path.exists(os.path.join(ROOT, 'GUIA-DO-ALUNO.html')):
        menu += '<a href="%sGUIA-DO-ALUNO.html">Guia do Aluno</a>' % raiz
    icone = '<link rel="icon" href="%sfavicon.png">' % raiz if os.path.exists(os.path.join(ROOT, 'favicon.png')) else ''
    saida = destino_do(caminho_md)
    if html_manual(saida):
        return None  # já existe um espelho feito à mão: não sobrescreve
    if eh_indice and pasta != GUIAS:
        eh_indice = False  # README de subpasta vira o index.html da subpasta, com cara de guia
    if eh_indice:
        kicker, h1 = COHORT + ' · guias', 'Estou perdido em X. <em>O que fazer?</em>'
        extra = ('<input id="busca" class="busca" type="search" placeholder="Busque o seu problema (ex.: git, skill, erro, métrica)…" aria-label="Buscar guia">'
                 '<p class="busca-dica">A busca filtra as linhas das tabelas abaixo.</p>')
        titulo = 'Índice'
    else:
        nome = re.sub(r'^GUIA\s*', '', nome).strip() or 'Guia'
        kicker = nome  # o CSS já mostra em maiúsculas; .title() estragava siglas (API, CAPI, MVP)
        h1 = html.escape(promessa[:1].upper() + promessa[1:]) if promessa else html.escape(nome)
        extra = ''
        titulo = kicker
    area = '' if eh_indice else os.path.basename(pasta)
    pagina = PAGINA.format(titulo=html.escape(titulo), cohort=html.escape(COHORT), icone=icone, menu=menu,
                           area=area, kicker=html.escape(kicker),
                           h1=h1, extra=extra, corpo=converter(md, pasta), md=os.path.basename(caminho_md),
                           fonte='guias/' + rel, fonte_rel=rel, css=CSS, js=JS)
    with open(saida, 'w', encoding='utf-8', newline='\n') as f:
        f.write(pagina)
    return saida


def destino_do(caminho_md):
    pasta, nome = os.path.split(caminho_md)
    return os.path.join(pasta, 'index.html' if nome == 'README.md' else nome[:-3] + '.html')


def todos_md():
    achados = []
    for base, _, arquivos in os.walk(GUIAS):
        for a in arquivos:
            if a.endswith('.md'):
                achados.append(os.path.join(base, a))
    return sorted(achados)


# ---------------------------------------------------------------- conferência

def checar():
    problemas = []
    for md in todos_md():
        texto = open(md, encoding='utf-8').read()
        rel = os.path.relpath(md, ROOT)
        for href in re.findall(r'\]\(([^)\s#]+)(?:#[^)]*)?\)', texto):
            if re.match(r'^[a-z]+:', href):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(md), href))):
                problemas.append('%s: link quebrado -> %s' % (rel, href))
        sem_codigo = re.sub(r'```.*?```|`[^`\n]*`', '', texto, flags=re.S)  # exemplo citado em código não conta
        if re.search(r'[A-Za-z]:\\Users\\|/Users/[^/\s]+/|/home/[^/\s]+/|file:///[A-Za-z]', sem_codigo):
            problemas.append('%s: caminho absoluto de máquina' % rel)
        if os.path.basename(md).startswith('guia-'):
            faltam = [nome for nome, padrao in BLOCOS if not re.search(padrao, texto, re.M)]
            if faltam:
                problemas.append('%s: faltam blocos %s' % (rel, faltam))
            if '## POSSÍVEIS ERROS' in texto:
                sec = texto.split('## POSSÍVEIS ERROS')[-1].split('## Pronto')[0]
                n = len(RE_ERRO.findall(sec))
                if n < 5:
                    problemas.append('%s: só %d erros no catálogo (mínimo 5)' % (rel, n))
        h = destino_do(md)
        if html_manual(h):
            pass  # espelho feito à mão: quem atualiza é a pessoa (a data do arquivo não é confiável num clone novo)
        elif not os.path.exists(h) or os.path.getmtime(h) < os.path.getmtime(md):
            problemas.append('%s: HTML ausente ou desatualizado (rode o script sem --check)' % rel)
    paginas = [os.path.join(ROOT, n) for n in os.listdir(ROOT) if n == 'index.html' or n.startswith('GUIA-DO-ALUNO')]
    paginas += [destino_do(m) for m in todos_md() if not html_manual(destino_do(m))]
    for p in paginas:
        if not os.path.exists(p):
            continue
        for href in re.findall(r'href="([^"#]+)', open(p, encoding='utf-8').read()):
            if re.match(r'^[a-z]+:', href) or href.startswith('//'):
                continue
            if not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(p), href))):
                problemas.append('%s: link quebrado -> %s' % (os.path.relpath(p, ROOT), href))
    return problemas


def main():
    if '--check' in sys.argv:
        problemas = checar()
        for p in problemas:
            print('PROBLEMA', p)
        print('%d guias conferidos, %d problema(s).' % (len(todos_md()), len(problemas)))
        sys.exit(1 if problemas else 0)
    feitos = 0
    for md in todos_md():
        saida = gerar_um(md)
        if saida is None:
            print('mantido (feito à mão)', os.path.relpath(destino_do(md), ROOT).replace(os.sep, '/'))
        else:
            feitos += 1
            print('gerado', os.path.relpath(saida, ROOT).replace(os.sep, '/'))
    problemas = checar()
    for p in problemas:
        print('AVISO', p)
    print('pronto: %d páginas geradas, %d aviso(s). Abra guias/index.html no navegador.' % (feitos, len(problemas)))


if __name__ == '__main__':
    main()
