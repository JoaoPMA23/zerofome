# zeroFome — Protótipo (MVP)

Protótipo navegável do **zeroFome**, plataforma que se integra ao estoque/ERP de estabelecimentos para identificar produtos próximos ao vencimento, sugerir descontos ou doações e, após a aprovação do comerciante, avisar consumidores e ONGs.

O protótipo mostra as duas visões conectadas:

- **Visão do mercado**: painel do estabelecimento com itens em risco, sugestões automáticas (desconto ou doação), aprovação, ofertas ativas, reservas e doações.
- **Visão do cliente**: app do consumidor com ofertas próximas, detalhes (validade, conservação, retirada), reserva e código de retirada.

## Como usar

Abra o `index.html` no navegador ou acesse a versão publicada no GitHub Pages.

- **Lado a lado**: as duas visões juntas, ideal para apresentação.
- **Mercado** / **Cliente**: cada visão isolada. Links diretos: `#mercado` e `#cliente`.
- **Simular leitura do ERP**: traz novos itens próximos do vencimento.
- **Reiniciar**: volta a demonstração ao estado inicial.

Roteiro sugerido: aprovar uma sugestão no mercado → a oferta aparece no app do cliente → reservar → confirmar a retirada no painel → encerrar uma oferta e doar a sobra.

> Todos os dados são fictícios e a integração com o ERP é simulada. Nenhuma compra ou reserva real é feita.
