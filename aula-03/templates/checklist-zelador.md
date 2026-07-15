# Checklist do Zelador

Marque somente com evidência disponível.

> **Modo API:** se o seu `.env` tem as credenciais Meta (bloco META GRAPH API
> do `.env.example`), rode `node scripts/zelador-audit.mjs` — a maioria dos
> itens abaixo é confirmada automaticamente pela Graph API, e o script indica
> quais restam para conferência manual (tipicamente deduplicação e domínio).

- [ ] Pixel/dataset identificado
- [ ] Evento de conversão identificado
- [ ] Domínio verificado
- [ ] CAPI confirmada ou lacuna registrada
- [ ] Deduplicação confirmada
- [ ] UTMs definidas
- [ ] Checkout e destino conferidos
- [ ] Permissões e conta de anúncios conferidas
- [ ] Forma de pagamento conferida
- [ ] Janela de atribuição registrada
- [ ] Ausências e riscos registrados no Painel da Semana

Se um item crítico não puder ser comprovado, o resultado deve permanecer crítico ou pendente. Não marque saudável por presunção.
