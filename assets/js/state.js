// Estado único da demonstração. As views só leem; quem altera são as ações (actions.js).

// usa de data.js: CONSERVACAO, ERP_LEITURA_INICIAL, OFERTAS_VIZINHOS
// usa de rules.js: percentualDesconto, sugerirDestino

const MODOS = ['split', 'mercado', 'cliente'];

const S = {};

let sequencia = 1;
const novoId = () => `id${sequencia++}`;

function modoDaUrl() {
  const hash = location.hash.slice(1);
  return MODOS.includes(hash) ? hash : null;
}

function modoInicial() {
  return modoDaUrl() ?? (window.innerWidth < 560 ? 'cliente' : 'split');
}

function criarItemDeEstoque(dados) {
  return { ...dados, id: novoId(), status: 'pendente', sugestao: sugerirDestino(dados) };
}

function ofertaDeVizinho(dados) {
  return {
    ...dados,
    id: novoId(),
    doMercado: false,
    pct: percentualDesconto(dados.preco, dados.orig),
    conservacao: CONSERVACAO[dados.cat],
    ofertados: dados.disp,
    nova: false,
    encerrada: false,
  };
}

function reiniciarEstado() {
  const modo = S.modo ?? modoInicial();
  sequencia = 1;
  for (const chave of Object.keys(S)) delete S[chave];

  Object.assign(S, {
    modo,
    // painel do mercado
    abaMercado: 'sugestoes',
    itens: ERP_LEITURA_INICIAL.map(criarItemDeEstoque),
    proximaLeituraErp: 0,
    horaLeituraErp: '08:00',
    modal: null, // { itemId, pct, qtd, janela, doarSobra }
    // app do cliente
    ofertas: OFERTAS_VIZINHOS.map(ofertaDeVizinho),
    abaCliente: 'ofertas',
    categoria: 'Todos',
    sheet: null, // { tipo: 'oferta' | 'confirmacao', id }
    quantidade: 1,
    // compartilhado
    reservas: [],
    doacoes: [],
    etapa: 3,
    log: 'Leitura do ERP às 08:00: <b>6 itens</b> perto do vencimento.',
    // ids que devem piscar/animar só no próximo render
    destaque: new Set(),
  });
}
