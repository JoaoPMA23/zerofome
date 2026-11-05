// Ponto de entrada: monta a tela, liga os eventos e redesenha após cada ação.

import { acoes, atualizarCampoDoModal, fecharCamadaDoTopo } from './actions.js';
import { S, modoDaUrl, reiniciarEstado } from './state.js';
import { renderCliente } from './views/client.js';
import { renderFluxo } from './views/flow.js';
import { renderMercado } from './views/market.js';
import { atualizarResumo, renderModal } from './views/modal.js';

const $ = (id) => document.getElementById(id);

const dom = {
  stage: $('stage'),
  seletorModo: document.querySelectorAll('#seg [data-modo]'),
  etapas: $('flow'),
  log: $('flowlog'),
  mercado: $('market'),
  modal: $('modalroot'),
  cliente: { app: $('app'), tabbar: $('tabbar'), sheet: $('sheet'), sheetFundo: $('sheetbg') },
};

function render() {
  dom.stage.className = `stage ${S.modo}`;
  document.body.className = `m-${S.modo}`;
  dom.seletorModo.forEach((b) => b.classList.toggle('on', b.dataset.modo === S.modo));

  renderFluxo(dom.etapas, dom.log);
  renderMercado(dom.mercado);
  renderCliente(dom.cliente);
  renderModal(dom.modal);

  // destaques (piscar/animar) valem só para este render
  S.destaque.clear();
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  const acao = el && acoes[el.dataset.act];
  if (!acao) return;
  if (acao(el, ev) === false) return;
  render();
});

function aoEditarModal(ev) {
  const campo = ev.target.dataset?.campo;
  if (!campo || !S.modal) return;
  atualizarCampoDoModal(campo, ev.target);
  atualizarResumo(dom.modal);
}
document.addEventListener('input', aoEditarModal);
document.addEventListener('change', aoEditarModal);

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && fecharCamadaDoTopo() !== false) render();
});

window.addEventListener('hashchange', () => {
  const modo = modoDaUrl();
  if (modo) {
    S.modo = modo;
    render();
  }
});

reiniciarEstado();
render();
