# zeroFome — Protótipo (MVP)

Protótipo navegável do **zeroFome**, plataforma que se integra ao estoque/ERP de estabelecimentos para identificar produtos próximos ao vencimento, sugerir descontos ou doações e, após a aprovação do comerciante, avisar consumidores e ONGs.

O protótipo mostra as duas visões conectadas:

- **Visão do mercado**: painel do estabelecimento com itens em risco, sugestões automáticas (desconto ou doação), aprovação, ofertas ativas, reservas e doações.
- **Visão do cliente**: app do consumidor com ofertas próximas, detalhes (validade, conservação, retirada), reserva e código de retirada.

## Como usar

Acesse a versão publicada no GitHub Pages ou rode localmente. O JavaScript usa módulos ES, então o `index.html` precisa ser servido por HTTP (abrir o arquivo direto com duplo clique não funciona):

```bash
python -m http.server 5173
```

Depois abra `http://localhost:5173`.

- **Lado a lado**: as duas visões juntas, ideal para apresentação.
- **Mercado** / **Cliente**: cada visão isolada. Links diretos: `#mercado` e `#cliente`.
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
assets/js/
  main.js               inicialização, eventos e redesenho
  state.js              estado da demonstração
  actions.js            o que cada botão faz
  rules.js              sugestão de desconto/doação e indicadores
  data.js               dados fictícios (estoque, lojas, ONG)
  format.js             formatação de moeda, peso e prazos
  ui.js                 toasts e notificação no celular
  views/                desenho de cada parte da tela (mercado, cliente, modal, fluxo)
```

Não há etapa de build nem dependências: os arquivos são servidos como estão.
