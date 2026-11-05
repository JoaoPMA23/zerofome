// Visão do mercado: painel do estabelecimento.

// usa de data.js: COR_CATEGORIA, MERCADO, ONG
// usa de format.js: brl, num, plural, prazo
// usa de rules.js: calcularIndicadores, precoComDesconto
// usa de state.js: S

// último valor exibido de cada indicador, para animar só o que mudou
const valoresAnteriores = {};

function renderMercado(el) {
  const ind = calcularIndicadores(S);
  const pendentes = S.itens.filter((i) => i.status === 'pendente');
  const ofertasDoMercado = S.ofertas.filter((o) => o.doMercado);
  const reservasAguardando = S.reservas.filter((r) => r.doMercado && r.status === 'aguardando').length;
  const doacoesAguardando = S.doacoes.filter((d) => d.status === 'aguardando').length;

  const abas = {
    sugestoes: () => abaSugestoes(pendentes),
    ofertas: () => abaOfertas(ofertasDoMercado),
    reservas: abaReservas,
    doacoes: abaDoacoes,
  };

  el.innerHTML = `
    ${cabecalho()}
    ${indicadores(ind)}
    <div class="tabs" role="tablist">
      ${botaoAba('sugestoes', 'Sugestões', pendentes.length, pendentes.length > 0)}
      ${botaoAba('ofertas', 'Ofertas ativas', ofertasDoMercado.length)}
      ${botaoAba('reservas', 'Reservas', reservasAguardando, reservasAguardando > 0)}
      ${botaoAba('doacoes', 'Doações', doacoesAguardando, doacoesAguardando > 0)}
    </div>
    <div class="tab-body">${abas[S.abaMercado]()}</div>`;
}

function cabecalho() {
  return `
    <div class="ph">
      <div class="store-av">${MERCADO.emoji}</div>
      <div>
        <h2>${MERCADO.nome}</h2>
        <div class="erp"><i></i>ERP conectado (simulado) · última leitura ${S.horaLeituraErp}</div>
      </div>
      <button class="btn btn-o btn-erp" data-act="lerErp">⟳ Simular leitura do ERP</button>
    </div>`;
}

function indicadores(ind) {
  const lista = [
    { chave: 'risco', classe: 'risk', rotulo: 'Itens em risco', valor: ind.itensEmRisco, sub: `${brl(ind.valorEmRisco)} podem virar perda` },
    { chave: 'receita', classe: 'good', rotulo: 'Receita recuperada', valor: brl(ind.receita), sub: `${ind.reservas} ${plural(ind.reservas, 'reserva', 'reservas')} pelo app` },
    { chave: 'kg', classe: 'good', rotulo: 'Alimento salvo', valor: `${num(ind.kgSalvo)} kg`, sub: 'vendido com desconto + doado' },
    { chave: 'doacoes', classe: 'good', rotulo: 'Doações', valor: ind.doacoes, sub: `${num(ind.kgDoado)} kg para ONG parceira` },
  ];

  const html = lista.map(({ chave, classe, rotulo, valor, sub }) => {
    const mudou = chave in valoresAnteriores && valoresAnteriores[chave] !== String(valor);
    valoresAnteriores[chave] = String(valor);
    return `
      <div class="kpi ${classe}">
        <div class="l">${rotulo}</div>
        <div class="v tnum ${mudou ? 'bump' : ''}">${valor}</div>
        <div class="s">${sub}</div>
      </div>`;
  }).join('');

  return `<div class="kpis">${html}</div>`;
}

function esquecerIndicadores() {
  for (const chave of Object.keys(valoresAnteriores)) delete valoresAnteriores[chave];
}

function botaoAba(chave, rotulo, contador, destacar = false) {
  return `
    <button class="${S.abaMercado === chave ? 'on' : ''}" data-act="abaMercado" data-k="${chave}">
      ${rotulo}<span class="cnt ${destacar ? 'hot' : ''}">${contador}</span>
    </button>`;
}

const vazio = (emoji, titulo, texto) =>
  `<div class="empty"><div class="e">${emoji}</div><b>${titulo}</b><br>${texto}</div>`;

/* ---------- Sugestões ---------- */

function abaSugestoes(pendentes) {
  if (!pendentes.length) {
    return vazio('✅', 'Nenhum item pendente.',
      'Tudo que estava perto do vencimento já tem destino. Use “Simular leitura do ERP” para trazer novos itens.');
  }
  const ordenados = [...pendentes].sort((a, b) => a.dias - b.dias);
  return `
    <p class="hint">O sistema leu o estoque e sugere uma ação para cada item. Você só aprova, ajusta ou troca o destino.</p>
    ${ordenados.map(linhaSugestao).join('')}`;
}

function linhaSugestao(item) {
  const { sugestao } = item;
  const corPrazo = item.dias <= 1 ? 'red' : item.dias <= 2 ? 'org' : '';
  const ehDoacao = sugestao.tipo === 'doacao';

  const blocoSugestao = ehDoacao
    ? `<div class="sug don">
         <div class="k">Sugestão</div><div class="m">Doar para ONG parceira</div>
         <div class="w">${sugestao.motivo}</div>
       </div>`
    : `<div class="sug">
         <div class="k">Sugestão</div>
         <div class="m">-${sugestao.pct}% → ${brl(precoComDesconto(item.preco, sugestao.pct))}<s>${brl(item.preco)}</s></div>
         <div class="w">${sugestao.motivo}</div>
       </div>`;

  const acoes = ehDoacao
    ? `<button class="btn btn-p btn-sm" data-act="doarItem" data-id="${item.id}">Aprovar doação</button>
       <button class="btn btn-o btn-sm" data-act="abrirAjuste" data-id="${item.id}">Vender com desconto</button>`
    : `<button class="btn btn-p btn-sm" data-act="aprovarSugestao" data-id="${item.id}">Aprovar</button>
       <button class="btn btn-o btn-sm" data-act="abrirAjuste" data-id="${item.id}">Ajustar</button>
       <button class="btn btn-g btn-sm" data-act="doarItem" data-id="${item.id}">Doar</button>`;

  return `
    <div class="row ${S.destaque.has(item.id) ? 'flash' : ''}">
      <div class="thumb" style="background:${COR_CATEGORIA[item.cat]}">${item.e}</div>
      <div>
        <div class="r-name">${item.nome}</div>
        <div class="r-meta">Lote ${item.lote} · ${item.qtd} ${item.un} em estoque · ${brl(item.preco)}/${item.un}</div>
        <div class="chips"><span class="chip ${corPrazo}">${prazo(item.dias)}</span><span class="chip">${item.cat}</span></div>
      </div>
      ${blocoSugestao}
      <div class="acts">${acoes}</div>
    </div>`;
}

/* ---------- Ofertas ativas ---------- */

function abaOfertas(ofertas) {
  if (!ofertas.length) {
    return vazio('🏷️', 'Nenhuma oferta publicada ainda.',
      'Aprove uma sugestão para ela aparecer no app dos clientes próximos.');
  }
  return `
    <p class="hint">Ofertas visíveis agora no app para clientes num raio de 2 km.</p>
    <table class="tbl">
      <thead><tr><th>Produto</th><th>Preço</th><th class="hide-m">Retirada</th><th>Reservado</th><th></th></tr></thead>
      <tbody>${ofertas.map(linhaOferta).join('')}</tbody>
    </table>`;
}

function linhaOferta(oferta) {
  const reservado = oferta.ofertados - oferta.disp;
  const progresso = oferta.ofertados ? (reservado / oferta.ofertados) * 100 : 0;
  const aviso = oferta.doarSobra && !oferta.encerrada ? 'Sobra vai para doação ao fim da janela' : '';
  const acao = oferta.encerrada
    ? '<span class="stat off">Encerrada</span>'
    : `<button class="btn btn-o btn-sm" data-act="encerrarOferta" data-id="${oferta.id}">
         ${oferta.disp > 0 ? 'Encerrar e doar sobra' : 'Encerrar'}
       </button>`;

  return `
    <tr>
      <td><b>${oferta.e} ${oferta.nome}</b><div class="r-meta">${aviso}</div></td>
      <td class="tnum"><b>${brl(oferta.preco)}</b> <span class="chip org">-${oferta.pct}%</span></td>
      <td class="hide-m">${oferta.janela}</td>
      <td class="tnum">${reservado} de ${oferta.ofertados} ${oferta.un}<div class="bar"><i style="width:${progresso}%"></i></div></td>
      <td class="end">${acao}</td>
    </tr>`;
}

/* ---------- Reservas ---------- */

function abaReservas() {
  const reservas = S.reservas.filter((r) => r.doMercado);
  if (!reservas.length) {
    return vazio('🧾', 'Nenhuma reserva ainda.',
      'Quando um cliente reservar pelo app, ela aparece aqui com o código de retirada.');
  }
  return `
    <p class="hint">Confira o código que o cliente mostra no celular e confirme a retirada.</p>
    <table class="tbl">
      <thead><tr><th>Código</th><th>Produto</th><th class="hide-m">Cliente</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>${[...reservas].reverse().map(linhaReserva).join('')}</tbody>
    </table>`;
}

function linhaReserva(r) {
  const aguardando = r.status === 'aguardando';
  return `
    <tr class="${S.destaque.has(r.id) ? 'flash' : ''}">
      <td><span class="code">${r.codigo}</span></td>
      <td><b>${r.qtd}× ${r.nome}</b><div class="r-meta">${r.janela}</div></td>
      <td class="hide-m">${r.cliente}</td>
      <td class="tnum">${brl(r.total)}</td>
      <td>${aguardando ? '<span class="stat wait">Aguardando</span>' : '<span class="stat ok">Retirado</span>'}</td>
      <td class="end">${aguardando ? `<button class="btn btn-p btn-sm" data-act="confirmarRetirada" data-id="${r.id}">Confirmar retirada</button>` : ''}</td>
    </tr>`;
}

/* ---------- Doações ---------- */

function abaDoacoes() {
  const ong = `
    <div class="ong"><span class="e">🤝</span>
      <div><b>${ONG}</b><br>ONG parceira · recebe alerta assim que você aprova uma doação.</div>
    </div>`;

  if (!S.doacoes.length) {
    return ong + vazio('📦', 'Nenhuma doação ainda.',
      'Itens que vencem hoje ou sobras de ofertas encerradas podem ser doados com um clique.');
  }
  return `${ong}
    <table class="tbl">
      <thead><tr><th>Produto</th><th>Quantidade</th><th class="hide-m">Origem</th><th>Status</th><th></th></tr></thead>
      <tbody>${[...S.doacoes].reverse().map(linhaDoacao).join('')}</tbody>
    </table>`;
}

function linhaDoacao(d) {
  const aguardando = d.status === 'aguardando';
  return `
    <tr>
      <td><b>${d.e} ${d.nome}</b></td>
      <td class="tnum">${d.qtd} ${d.un} · ${num(d.kg)} kg</td>
      <td class="hide-m">${d.origem}</td>
      <td>${aguardando ? '<span class="stat wait">ONG notificada</span>' : '<span class="stat ok">Coletado</span>'}</td>
      <td class="end">${aguardando ? `<button class="btn btn-o btn-sm" data-act="registrarColeta" data-id="${d.id}">Registrar coleta</button>` : ''}</td>
    </tr>`;
}
