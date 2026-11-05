// Ações disparadas pelos botões (atributo data-act). Cada ação altera o estado;
// depois dela o main.js redesenha a tela. Retornar `false` evita o redesenho.

// usa de data.js: CLIENTE, CONSERVACAO, ERP_PROXIMAS_LEITURAS, JANELAS_RETIRADA, MERCADO, ONG
// usa de format.js: brl, num, textoValidade
// usa de rules.js: precoComDesconto
// usa de state.js: S, criarItemDeEstoque, novoId, reiniciarEstado
// usa de ui.js: consumirAlvoPush, esconderPush, mostrarPush, toast
// usa de views/client.js: maximoReservavel
// usa de views/market.js: esquecerIndicadores
// usa de business.js: aplicarCenario

const buscar = (lista, id) => lista.find((x) => x.id === id);

function registrarEtapa(etapa, log) {
  S.etapa = etapa;
  S.log = log;
}

function gerarCodigoRetirada() {
  let codigo;
  do {
    codigo = `ZF-${1000 + Math.floor(Math.random() * 9000)}`;
  } while (S.reservas.some((r) => r.codigo === codigo));
  return codigo;
}

/* ---------- operações de domínio ---------- */

function publicarOferta(item, { pct, qtd, janela, doarSobra }) {
  item.status = 'publicado';
  const oferta = {
    id: novoId(),
    itemId: item.id,
    doMercado: true,
    loja: MERCADO.nome,
    dist: MERCADO.dist,
    nome: item.nome,
    cat: item.cat,
    e: item.e,
    un: item.un,
    kg: item.kg,
    preco: precoComDesconto(item.preco, pct),
    orig: item.preco,
    pct,
    janela,
    validade: textoValidade(item.dias),
    conservacao: CONSERVACAO[item.cat],
    disp: qtd,
    ofertados: qtd,
    doarSobra,
    nova: true,
    encerrada: false,
  };
  S.ofertas.unshift(oferta);
  S.destaque.add(oferta.id);

  registrarEtapa(4, `<b>${MERCADO.nome}</b> aprovou <b>${item.nome}</b> com -${pct}%. Clientes próximos foram avisados.`);
  toast(`Oferta publicada: ${item.nome} (-${pct}%)`);
  mostrarPush('Nova oferta perto de você',
    `${item.e} ${item.nome} por ${brl(oferta.preco)} (-${pct}%) no ${MERCADO.nome}`, oferta.id);
}

function registrarDoacao({ nome, e, un, kg }, qtd, origem) {
  S.doacoes.push({ id: novoId(), nome, e, un, qtd, kg: qtd * kg, origem, status: 'aguardando' });
  registrarEtapa(5, `Doação de <b>${qtd} ${un} de ${nome}</b> aprovada. ${ONG} recebeu o alerta para coleta.`);
  toast('Doação aprovada e ONG notificada');
}

function abrirOferta(id) {
  const oferta = buscar(S.ofertas, id);
  if (!oferta) return;
  oferta.nova = false;
  S.abaCliente = 'ofertas';
  S.sheet = { tipo: 'oferta', id };
  S.quantidade = 1;
}

/* ---------- ações ligadas aos botões ---------- */

const acoes = {
  // topo
  mudarModo(el) {
    S.modo = el.dataset.modo;
    history.replaceState(null, '', `#${S.modo}`);
  },
  reiniciar() {
    reiniciarEstado();
    esquecerIndicadores();
    esconderPush();
    toast('Demonstração reiniciada');
  },

  // simulador de negócio
  aplicarCenario(el) {
    aplicarCenario(el.dataset.k);
  },

  // painel do mercado
  abaMercado(el) {
    S.abaMercado = el.dataset.k;
  },
  lerErp() {
    S.horaLeituraErp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const leitura = ERP_PROXIMAS_LEITURAS[S.proximaLeituraErp];
    if (!leitura) {
      registrarEtapa(1, 'Nova leitura do ERP: nenhum item novo perto do vencimento.');
      toast('Leitura concluída: nenhum item novo perto do vencimento');
      return;
    }
    S.proximaLeituraErp++;
    for (const dados of leitura) {
      const item = criarItemDeEstoque(dados);
      S.itens.push(item);
      S.destaque.add(item.id);
    }
    S.abaMercado = 'sugestoes';
    registrarEtapa(3, `Leitura do ERP às ${S.horaLeituraErp}: <b>${leitura.length} novos itens</b> detectados e sugestões geradas.`);
    toast(`${leitura.length} novos itens detectados no estoque`);
  },
  aprovarSugestao(el) {
    const item = buscar(S.itens, el.dataset.id);
    publicarOferta(item, { pct: item.sugestao.pct, qtd: item.qtd, janela: JANELAS_RETIRADA[1], doarSobra: true });
  },
  doarItem(el) {
    const item = buscar(S.itens, el.dataset.id);
    item.status = 'doado';
    registrarDoacao(item, item.qtd, 'Sugestão do sistema');
  },
  abrirAjuste(el) {
    const item = buscar(S.itens, el.dataset.id);
    S.modal = {
      itemId: item.id,
      pct: item.sugestao.pct || 40,
      qtd: item.qtd,
      janela: item.dias <= 0 ? JANELAS_RETIRADA[0] : JANELAS_RETIRADA[1],
      doarSobra: true,
    };
  },
  publicarAjuste() {
    const { itemId, ...opcoes } = S.modal;
    S.modal = null;
    publicarOferta(buscar(S.itens, itemId), opcoes);
  },
  fecharModal() {
    S.modal = null;
  },
  fecharModalPeloFundo(el, ev) {
    if (ev.target !== el) return false; // clique dentro do modal
    S.modal = null;
  },
  encerrarOferta(el) {
    const oferta = buscar(S.ofertas, el.dataset.id);
    oferta.encerrada = true;
    if (oferta.disp > 0) {
      const sobra = oferta.disp;
      oferta.disp = 0;
      registrarDoacao(oferta, sobra, 'Sobra de oferta');
    } else {
      toast('Oferta encerrada');
    }
  },
  confirmarRetirada(el) {
    const r = buscar(S.reservas, el.dataset.id);
    r.status = 'retirado';
    registrarEtapa(5, `Retirada confirmada: <b>${r.codigo}</b>. ${brl(r.total)} recuperados e ${num(r.kg)} kg de comida salvos.`);
    toast(`Retirada ${r.codigo} confirmada`);
  },
  registrarColeta(el) {
    const d = buscar(S.doacoes, el.dataset.id);
    d.status = 'coletado';
    registrarEtapa(5, `${ONG} coletou <b>${d.qtd} ${d.un} de ${d.nome}</b>.`);
    toast('Coleta registrada');
  },

  // app do cliente
  abaCliente(el) {
    S.abaCliente = el.dataset.k;
    S.sheet = null;
  },
  filtrarCategoria(el) {
    S.categoria = el.dataset.k;
  },
  abrirOferta(el) {
    abrirOferta(el.dataset.id);
  },
  abrirPush() {
    const id = consumirAlvoPush();
    if (!id) return false;
    S.categoria = 'Todos';
    abrirOferta(id);
  },
  alterarQuantidade(el) {
    const oferta = buscar(S.ofertas, S.sheet.id);
    const nova = S.quantidade + Number(el.dataset.d);
    S.quantidade = Math.min(maximoReservavel(oferta), Math.max(1, nova));
  },
  reservar() {
    const oferta = buscar(S.ofertas, S.sheet.id);
    const qtd = S.quantidade;
    if (!oferta || oferta.disp < qtd) return;

    oferta.disp -= qtd;
    oferta.nova = false;
    const reserva = {
      id: novoId(),
      codigo: gerarCodigoRetirada(),
      ofertaId: oferta.id,
      doMercado: oferta.doMercado,
      nome: oferta.nome,
      e: oferta.e,
      cat: oferta.cat,
      loja: oferta.loja,
      janela: oferta.janela,
      qtd,
      total: oferta.preco * qtd,
      economia: (oferta.orig - oferta.preco) * qtd,
      kg: oferta.kg * qtd,
      cliente: CLIENTE.abreviado,
      status: 'aguardando',
    };
    S.reservas.push(reserva);
    S.sheet = { tipo: 'confirmacao', id: reserva.id };

    if (oferta.doMercado) {
      S.destaque.add(reserva.id);
      registrarEtapa(5, `${CLIENTE.nome} reservou <b>${qtd}× ${oferta.nome}</b> (código ${reserva.codigo}). A reserva já aparece no painel do mercado.`);
      toast(`Nova reserva ${reserva.codigo}: ${qtd}× ${oferta.nome}`);
    } else {
      registrarEtapa(5, `${CLIENTE.nome} reservou <b>${qtd}× ${oferta.nome}</b> na ${oferta.loja}.`);
    }
  },
  fecharSheet() {
    const eraConfirmacao = S.sheet?.tipo === 'confirmacao';
    S.sheet = null;
    if (eraConfirmacao) S.abaCliente = 'reservas';
  },
};

/* ---------- campos do modal (atualizados sem redesenhar) ---------- */

function atualizarCampoDoModal(campo, input) {
  if (campo === 'pct' || campo === 'qtd') S.modal[campo] = Number(input.value);
  if (campo === 'janela') S.modal.janela = input.value;
  if (campo === 'doarSobra') S.modal.doarSobra = input.checked;
}

function fecharCamadaDoTopo() {
  if (S.modal) S.modal = null;
  else if (S.sheet) S.sheet = null;
  else return false;
}
