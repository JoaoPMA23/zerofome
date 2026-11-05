// Faixa com as 5 etapas do fluxo zeroFome e o último evento da demonstração.

import { ETAPAS_FLUXO } from '../data.js';
import { S } from '../state.js';

export function renderFluxo(elEtapas, elLog) {
  elEtapas.innerHTML = ETAPAS_FLUXO.map(({ titulo, descricao }, i) => {
    const n = i + 1;
    const classe = n === S.etapa ? 'on' : n < S.etapa ? 'done' : '';
    return `
      <div class="fstep ${classe}">
        <span class="n">${n < S.etapa ? '✓' : n}</span>
        <div><div class="t">${titulo}</div><div class="d">${descricao}</div></div>
      </div>`;
  }).join('');

  elLog.innerHTML = S.log ? `● ${S.log}` : '';
}
