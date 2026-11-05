// Tela "Negócio": simulador de modelo de negócio e impacto.
// O formulário é desenhado uma vez; ao mexer num controle, só os resultados são redesenhados
// (recriar os sliders no meio do arraste quebraria o movimento).

// usa de business.js: SIM, GRUPOS_SIMULADOR, ROTULO_CENARIO, simular
// usa de format.js: brl, brlInteiro, num, peso, plural

const CORES_DESTINO = {
  receitaLojas: '#1e8a55',
  economiaConsumidor: '#e8952f',
  valorDoado: '#4a78c2',
  continuaPerdido: '#c9cec7',
};

const ROTULOS_DESTINO = {
  receitaLojas: 'Receita recuperada pelas lojas',
  economiaConsumidor: 'Economia dos consumidores',
  valorDoado: 'Doado para ONGs',
  continuaPerdido: 'Continua perdido',
};

function formatarPremissa(valor, formato) {
  if (formato === 'brl') return brlInteiro(valor);
  if (formato === 'pct') return `${valor}%`;
  return num(valor, 0);
}

function renderSimulador(el) {
  const cenarios = Object.entries(ROTULO_CENARIO).map(([chave, rotulo]) =>
    `<button class="${SIM.cenario === chave ? 'on' : ''}" data-act="aplicarCenario" data-k="${chave}">${rotulo}</button>`).join('');

  const grupos = GRUPOS_SIMULADOR.map((grupo) => `
    <fieldset class="sim-group">
      <legend>${grupo.titulo}</legend>
      ${grupo.campos.map(controle).join('')}
    </fieldset>`).join('');

  el.innerHTML = `
    <div class="sim-head">
      <div>
        <h2>Modelo de negócio e impacto</h2>
        <p class="r-meta">Ajuste as premissas e veja, por mês, quanto as lojas recuperam, quanto o zeroFome fatura e quanta comida deixa de ir para o lixo.</p>
      </div>
      <div class="sim-cenarios" role="group" aria-label="Cenários">
        <span class="r-meta">Cenário</span>${cenarios}
      </div>
    </div>
    <div class="sim-grid">
      <form class="panel sim-inputs" onsubmit="return false">${grupos}</form>
      <section class="sim-out" id="sim-out" aria-live="polite"></section>
    </div>
    <p class="sim-nota">
      Valores padrão são hipóteses para discussão, não dados medidos. A perda é considerada a preço de venda;
      1 refeição = ${num(0.5)} kg de alimento. Contexto: o varejo e os serviços de alimentação perdem cerca de
      7,9 milhões de toneladas por ano no Brasil (Pacto Contra a Fome).
    </p>
    <div class="sim-tip" id="sim-tip" role="tooltip"></div>`;

  atualizarResultadosSimulador(el);
}

function controle(campo) {
  return `
    <label class="sim-field">
      <span class="fl"><span>${campo.rotulo}</span><b data-sim-out="${campo.chave}">${formatarPremissa(SIM[campo.chave], campo.formato)}</b></span>
      <input type="range" min="${campo.min}" max="${campo.max}" step="${campo.passo}" value="${SIM[campo.chave]}" data-sim="${campo.chave}">
      ${campo.ajuda ? `<small>${campo.ajuda}</small>` : ''}
    </label>`;
}

function atualizarResultadosSimulador(el) {
  // valores ao lado de cada slider e destaque do cenário
  for (const grupo of GRUPOS_SIMULADOR) {
    for (const campo of grupo.campos) {
      const saida = el.querySelector(`[data-sim-out="${campo.chave}"]`);
      if (saida) saida.textContent = formatarPremissa(SIM[campo.chave], campo.formato);
    }
  }
  el.querySelectorAll('.sim-cenarios button').forEach((b) => b.classList.toggle('on', b.dataset.k === SIM.cenario));

  const r = simular(SIM);
  el.querySelector('#sim-out').innerHTML = `
    ${blocoIndicadores(r)}
    ${blocoDestino(r)}
    <div class="sim-pair">
      ${blocoLoja(r)}
      ${blocoEquilibrio(r)}
    </div>
    ${blocoAnual(r)}`;
}

function tile(rotulo, valor, sub, classe = '') {
  return `<div class="sim-tile ${classe}"><div class="l">${rotulo}</div><div class="v tnum">${valor}</div><div class="s">${sub}</div></div>`;
}

function blocoIndicadores(r) {
  const lucro = r.resultado >= 0;
  const status = lucro
    ? `<span class="sim-status good">▲ Lucro</span>`
    : `<span class="sim-status bad">▼ Prejuízo</span>`;
  return `
    <div class="sim-tiles">
      ${tile('Receita recuperada pelas lojas', brlInteiro(r.destino.receitaLojas), 'por mês, vendendo o que iria para o lixo')}
      ${tile('Receita do zeroFome', brlInteiro(r.receitaZeroFome), `${brlInteiro(r.receitaComissao)} comissão + ${brlInteiro(r.receitaMensalidades)} mensalidades`)}
      ${tile('Resultado da operação', brlInteiro(r.resultado), `${status} receita menos custo fixo`, lucro ? 'pos' : 'neg')}
      ${tile('Alimento salvo', peso(r.kgSalvo), `${num(r.refeicoesDoadas, 0)} refeições doadas por mês`)}
    </div>`;
}

function blocoDestino(r) {
  const total = r.valorEmRisco;
  const partes = Object.entries(r.destino).filter(([, valor]) => valor > 0);
  const pct = (valor) => (total > 0 ? (valor / total) * 100 : 0);

  const barra = partes.map(([chave, valor]) => `
    <span class="seg-bar" style="width:${pct(valor)}%;background:${CORES_DESTINO[chave]}"
      data-tip="${ROTULOS_DESTINO[chave]}: ${brlInteiro(valor)} (${num(pct(valor), 0)}%)"></span>`).join('');

  const legenda = Object.entries(r.destino).map(([chave, valor]) => `
    <li><span class="sw" style="background:${CORES_DESTINO[chave]}"></span>
      <span class="nm">${ROTULOS_DESTINO[chave]}</span>
      <b class="tnum">${brlInteiro(valor)}</b><span class="pc tnum">${num(pct(valor), 0)}%</span></li>`).join('');

  return `
    <div class="panel sim-card">
      <h3>Para onde vai a perda de ${brlInteiro(total)} por mês</h3>
      <p class="r-meta">Soma da perda de todas as lojas parceiras, dividida pelo destino de cada real.</p>
      <div class="stack" role="img" aria-label="Destino da perda mensal">${barra}</div>
      <ul class="sim-legend">${legenda}</ul>
    </div>`;
}

function blocoLoja(r) {
  const { loja } = r;
  const vale = loja.ganho > 0;
  const retorno = loja.retorno ? `Cada R$ 1 pago ao zeroFome volta como ${brl(loja.retorno)} para a loja.` : 'A loja não paga nada ao zeroFome neste cenário.';
  const aviso = vale
    ? `<p class="sim-ok">✓ ${retorno}</p>`
    : `<p class="sim-alert">⚠ A loja paga mais do que recupera: neste cenário, o comerciante não teria motivo para usar o app.</p>`;
  return `
    <div class="panel sim-card">
      <h3>Para cada loja, por mês</h3>
      <dl class="sim-list">
        <div><dt>Recupera vendendo com desconto</dt><dd class="tnum">${brlInteiro(loja.recupera)}</dd></div>
        <div><dt>Paga ao zeroFome</dt><dd class="tnum">− ${brlInteiro(loja.paga)}</dd></div>
        <div class="total"><dt>Ganho líquido</dt><dd class="tnum">${brlInteiro(loja.ganho)}</dd></div>
      </dl>
      ${aviso}
    </div>`;
}

function blocoEquilibrio(r) {
  const lojas = SIM.lojas;
  const meta = r.lojasEquilibrio;
  const semReceita = !Number.isFinite(meta);
  const progresso = semReceita ? 0 : Math.min(100, (lojas / meta) * 100);
  const texto = semReceita
    ? 'Sem comissão nem mensalidade, a operação nunca cobre o custo fixo.'
    : lojas >= meta
      ? `Com ${lojas} ${plural(lojas, 'loja', 'lojas')}, a operação já cobre o custo fixo de ${brlInteiro(SIM.custoFixo)}.`
      : `Faltam ${meta - lojas} ${plural(meta - lojas, 'loja', 'lojas')} para cobrir o custo fixo de ${brlInteiro(SIM.custoFixo)}.`;
  return `
    <div class="panel sim-card">
      <h3>Ponto de equilíbrio</h3>
      <div class="sim-big tnum">${semReceita ? '—' : `${num(meta, 0)} ${plural(meta, 'loja', 'lojas')}`}</div>
      <div class="sim-progress" aria-hidden="true"><i style="width:${progresso}%"></i></div>
      <p class="r-meta">${texto} Cada loja gera ${brlInteiro(r.loja.paga)} por mês ao zeroFome.</p>
    </div>`;
}

function blocoAnual(r) {
  return `
    <div class="panel sim-card sim-year">
      <h3>Em 12 meses</h3>
      <div class="sim-year-grid">
        <div><b class="tnum">${brlInteiro(r.destino.receitaLojas * 12)}</b><span>recuperados pelas lojas</span></div>
        <div><b class="tnum">${brlInteiro(r.destino.economiaConsumidor * 12)}</b><span>economizados pelos consumidores</span></div>
        <div><b class="tnum">${peso(r.kgSalvo * 12)}</b><span>de alimento salvos</span></div>
        <div><b class="tnum">${num(r.refeicoesDoadas * 12, 0)}</b><span>refeições doadas</span></div>
      </div>
    </div>`;
}

/* ---------- dica ao passar o mouse na barra ---------- */

function ligarDicasDoGrafico(el) {
  el.addEventListener('pointermove', (ev) => {
    const tip = el.querySelector('#sim-tip');
    const alvo = ev.target.closest('[data-tip]');
    if (!tip) return;
    if (!alvo) {
      tip.classList.remove('show');
      return;
    }
    tip.textContent = alvo.dataset.tip;
    tip.style.left = `${ev.clientX + 12}px`;
    tip.style.top = `${ev.clientY + 14}px`;
    tip.classList.add('show');
  });
  el.addEventListener('pointerleave', () => el.querySelector('#sim-tip')?.classList.remove('show'));
}
