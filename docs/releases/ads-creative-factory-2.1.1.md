# Ads Creative Factory 2.1.1

## Release

Patch de acessibilidade e seguranca visual validado no fluxo integrado do Ads
Studio: Brand Pack criado no painel, geracao real via Codex CLI, revisao humana e
promocao persistida.

## Correcao

Brand Packs com identidade originalmente clara podiam fornecer `foreground`
escuro ao arquetipo `dark_editorial`, reduzindo a legibilidade de headline e
CTA. A versao 2.1.1:

- deriva superficie e cores de texto acessiveis para temas claro e escuro;
- prioriza cores do pack que ja atingem contraste AA;
- usa preto/branco neutros somente quando nenhuma cor declarada atinge 4.5;
- transforma contraste abaixo do minimo em `fail` bloqueante, nao `warn`;
- mantem o contrato agnostico, sem identidade default e sem chave de API.

## Evidencia upstream

- merge privado: `f5622a4dafde015b82125287921f456eb57ee57b`;
- job real: `b2295c21-16db-4c81-8acd-033855ddd8e9`;
- modelo: `codex-cli-image-gen`;
- contraste dos dois criativos promovidos: 18.204 e 16.391;
- dimensoes: 1080x1350 nos dois PNGs;
- estado final: revisao 5 `approved`;
- 98 testes Python e 550 testes JS/TS aprovados no upstream.

## Verificacao publica

O pacote permanece limitado aos 39 arquivos allow-listed, com hashes,
proveniencia, licencas e redistribuicao verificados. A publicacao final de
anuncios continua sendo uma decisao humana.
