// Visão do cliente: app do consumidor.

// usa de data.js: CATEGORIAS_APP, CATEGORIA_APP, CLIENTE, COR_CATEGORIA
// usa de format.js: brl, num, plural
// usa de state.js: S

const LIMITE_POR_RESERVA = 5;

function renderCliente({ app, tabbar, sheet, sheetFundo }) {
  app.innerHTML = S.abaCliente === 'ofertas' ? telaOfertas() : telaReservas();
  tabbar.innerHTML = barraDeAbas();
  renderSheet(sheet, sheetFundo);
}

const maximoReservavel = (oferta) => Math.min(oferta.disp, LIMITE_POR_RESERVA);

/* ---------- Ofertas ---------- */

function telaOfertas() {
  const economia = S.reservas.reduce((soma, r) => soma + r.economia, 0);
  const kg = S.reservas.reduce((soma, r) => soma + r.kg, 0);

  const visiveis = S.ofertas
    .filter((o) => o.disp > 0 && !o.encerrada)
    .filter((o) => S.categoria === 'Todos' || CATEGORIA_APP[o.cat] === S.categoria)
    .sort((a, b) => b.nova - a.nova || b.doMercado - a.doMercado);

  const lista = visiveis.length
    ? visiveis.map(cardOferta).join('')
    : '<div class="empty"><div class="e">🔎</div>Nenhuma oferta nesta categoria agora.</div>';

  return `
    <div class="hello">
      <div><h3>Olá, ${CLIENTE.nome}</h3><div class="loc">📍 ${CLIENTE.bairro} · ofertas até ${CLIENTE.raio}</div></div>
      <div class="av">${CLIENTE.nome[0]}</div>
    </div>
    <div class="save">
      <div><div class="l">Você já economizou</div><div class="v tnum">${brl(economia)}</div></div>
      <div class="r"><div class="l">Comida salva</div><div class="v tnum">${num(kg)} kg</div></div>
    </div>
    <div class="pills">
      ${CATEGORIAS_APP.map((c) => `<button class="${S.categoria === c ? 'on' : ''}" data-act="filtrarCategoria" data-k="${c}">${c}</button>`).join('')}
    </div>
    <div class="sec">
      <h4>Ofertas perto de você</h4>
      <span>${visiveis.length} ${plural(visiveis.length, 'disponível', 'disponíveis')}</span>
    </div>
    ${lista}`;
}

function cardOferta(o) {
  const classes = ['ocard', o.nova && 'new', S.destaque.has(o.id) && 'flash'].filter(Boolean).join(' ');
  return `
    <button class="${classes}" data-act="abrirOferta" data-id="${o.id}">
      ${o.nova ? '<span class="newtag">NOVA</span>' : ''}
      <span class="thumb" style="background:${COR_CATEGORIA[o.cat]}">${o.e}</span>
      <span class="body">
        <span class="nm">${o.nome}</span>
        <span class="st">${o.loja} · ${o.dist}</span>
        <span class="pr"><b class="tnum">${brl(o.preco)}</b><s class="tnum">${brl(o.orig)}</s></span>
        <span class="when">🕒 ${o.janela}</span>
      </span>
      <span class="disc">-${o.pct}%</span>
    </button>`;
}

/* ---------- Reservas ---------- */

function telaReservas() {
  const lista = S.reservas.length
    ? [...S.reservas].reverse().map(cardReserva).join('')
    : '<div class="empty"><div class="e">🛍️</div><b>Nenhuma reserva ainda.</b><br>Escolha uma oferta e reserve para retirar no estabelecimento.</div>';

  return `
    <div class="hello"><div><h3>Minhas reservas</h3><div class="loc">Mostre o código no balcão para retirar</div></div></div>
    ${lista}`;
}

function cardReserva(r) {
  const status = r.status === 'aguardando'
    ? '<span class="stat wait">Aguardando retirada</span>'
    : '<span class="stat ok">Retirado ✓</span>';
  return `
    <div class="rcard">
      <div class="thumb" style="background:${COR_CATEGORIA[r.cat]}">${r.e}</div>
      <div class="body">
        <div class="r-name">${r.qtd}× ${r.nome}</div>
        <div class="r-meta">${r.loja} · ${r.janela}</div>
        <div class="line"><span class="code">${r.codigo}</span>${status}</div>
      </div>
      <div class="total tnum">${brl(r.total)}</div>
    </div>`;
}

function barraDeAbas() {
  const aguardando = S.reservas.filter((r) => r.status === 'aguardando').length;
  const aba = (chave, icone, rotulo, extra = '') =>
    `<button class="${S.abaCliente === chave ? 'on' : ''}" data-act="abaCliente" data-k="${chave}">
       <span class="ic">${icone}</span>${rotulo}${extra}
     </button>`;
  return aba('ofertas', '🏷️', 'Ofertas') +
    aba('reservas', '🧾', 'Reservas', aguardando ? `<span class="cnt hot">${aguardando}</span>` : '');
}

/* ---------- Bottom sheet ---------- */

function renderSheet(el, fundo) {
  const conteudo = S.sheet?.tipo === 'oferta' ? sheetOferta()
    : S.sheet?.tipo === 'confirmacao' ? sheetConfirmacao()
    : null;

  if (!conteudo) {
    el.classList.remove('show');
    fundo.classList.remove('show');
    return;
  }
  el.innerHTML = `<div class="grab"></div>${conteudo}`;
  el.classList.add('show');
  fundo.classList.add('show');
}

function sheetOferta() {
  const o = S.ofertas.find((x) => x.id === S.sheet.id);
  if (!o) return null;
  return `
    <div class="sh-im" style="background:${COR_CATEGORIA[o.cat]}">${o.e}<span class="disc">-${o.pct}%</span></div>
    <h3>${o.nome}</h3>
    <div class="sh-st">${o.loja} · ${o.dist} de você</div>
    <div class="sh-pr">
      <b class="tnum">${brl(o.preco)}</b><s class="tnum">${brl(o.orig)}</s>
      <span class="chip grn">Economize ${brl(o.orig - o.preco)}</span>
    </div>
    <div class="facts">
      <div class="fact"><span class="fi">📅</span><div><b>Validade</b>${o.validade}</div></div>
      <div class="fact"><span class="fi">❄️</span><div><b>Conservação</b>${o.conservacao}</div></div>
      <div class="fact"><span class="fi">🕒</span><div><b>Retirada</b>${o.janela} · ${o.loja}</div></div>
    </div>
    <div class="qty">
      <div><b>Quantidade</b><div class="r-meta">${o.disp} ${plural(o.disp, 'disponível', 'disponíveis')}</div></div>
      <div class="stp">
        <button data-act="alterarQuantidade" data-d="-1" aria-label="Menos">−</button>
        <span class="tnum">${S.quantidade}</span>
        <button data-act="alterarQuantidade" data-d="1" aria-label="Mais">+</button>
      </div>
    </div>
    <button class="btn btn-h btn-wide" data-act="reservar">Reservar · ${brl(o.preco * S.quantidade)}</button>
    <p class="r-meta note">Pagamento na retirada. Cancelamento gratuito até o início da janela.</p>`;
}

function sheetConfirmacao() {
  const r = S.reservas.find((x) => x.id === S.sheet.id);
  if (!r) return null;
  return `
    <div class="ok-big">
      <div class="ck">✓</div>
      <h3>Reserva confirmada!</h3>
      <div class="sh-st">${r.qtd}× ${r.nome} · ${r.loja}</div>
      <div class="cd">${r.codigo}</div>
      <div class="r-meta">Mostre este código no balcão · ${r.janela}</div>
      <div class="sh-pr center">
        <span class="chip grn">Você economizou ${brl(r.economia)} e salvou ${num(r.kg)} kg de comida</span>
      </div>
      <button class="btn btn-p btn-wide" data-act="fecharSheet">Ver minhas reservas</button>
    </div>`;
}
