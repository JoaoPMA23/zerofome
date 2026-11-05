# zeroFome — Protótipo (MVP)

Protótipo navegável do **zeroFome**, plataforma que se integra ao estoque/ERP de estabelecimentos para identificar produtos próximos ao vencimento, sugerir descontos ou doações e, após a aprovação do comerciante, avisar consumidores e ONGs.

O protótipo mostra as duas visões conectadas:

- **Visão do mercado**: painel do estabelecimento com itens em risco, sugestões automáticas (desconto ou doação), aprovação, ofertas ativas, reservas e doações.
- **Visão do cliente**: app do consumidor com ofertas próximas, detalhes (validade, conservação, retirada), reserva e código de retirada.

## Como usar

Abra o `index.html` no navegador (duplo clique funciona) ou acesse a versão publicada no GitHub Pages.

- **Lado a lado**: as duas visões juntas, ideal para apresentação.
- **Mercado** / **Cliente**: cada visão isolada. Links diretos: `#mercado` e `#cliente`.
- **Negócio** (`#negocio`): simulador do modelo de negócio. Ajuste lojas, perda mensal, desconto, comissão, mensalidade e custo fixo para ver a receita recuperada pelas lojas, a receita e o resultado do zeroFome, o ponto de equilíbrio e o impacto em alimento salvo. Tem cenários prontos (conservador, base e otimista).
- **Simular leitura do ERP**: traz novos itens próximos do vencimento.
- **Reiniciar**: volta a demonstração ao estado inicial.

Roteiro sugerido: aprovar uma sugestão no mercado → a oferta aparece no app do cliente → reservar → confirmar a retirada no painel → encerrar uma oferta e doar a sobra.

> Todos os dados são fictícios e a integração com o ERP é simulada. Nenhuma compra ou reserva real é feita.

## Estrutura

```
index.html              estrutura da página
assets/css/
  base.css              cores, tipografia, topo, faixa do fluxo e colunas
  components.css        botões, etiquetas, estados vazios e avisos
  market.css            painel do mercado e modal de ajuste
  client.css            app do cliente (moldura do celular, cards, reserva)
  simulator.css         simulador de modelo de negócio
assets/js/
  main.js               inicialização, eventos e redesenho
  state.js              estado da demonstração
  actions.js            o que cada botão faz
  rules.js              sugestão de desconto/doação e indicadores
  business.js           premissas, cenários e cálculo do modelo de negócio
  data.js               dados fictícios (estoque, lojas, ONG)
  format.js             formatação de moeda, peso e prazos
  ui.js                 toasts e notificação no celular
  views/                desenho de cada parte da tela (mercado, cliente, modal, fluxo, simulador)
```

Não há etapa de build nem dependências. Ao publicar uma mudança, aumente o `?v=` dos links em `index.html` para que o navegador não use arquivos antigos do cache. Os scripts são arquivos comuns carregados em ordem pelo `index.html` (cada um usa o que foi carregado antes); o topo de cada arquivo lista o que ele usa dos outros.
