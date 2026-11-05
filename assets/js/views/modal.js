// Modal "Ajustar oferta" do painel do mercado.

// usa de data.js: COR_CATEGORIA, JANELAS_RETIRADA, ONG
// usa de format.js: brl, prazo
// usa de rules.js: precoComDesconto
// usa de state.js: S

function renderModal(root) {
  if (!S.modal) {
    root.innerHTML = '';
    return;
  }
  const m = S.modal;
  const item = S.itens.find((i) => i.id === m.itemId);

  root.innerHTML = `
    <div class="modal-bg" data-act="fecharModalPeloFundo">
      <div class="modal" role="dialog" aria-modal="true" aria-label="Ajustar oferta">
        <header>
          <div class="thumb" style="background:${COR_CATEGORIA[item.cat]}">${item.e}</div>
          <div><h3>${item.nome}</h3><div class="r-meta">${prazo(item.dias)} · ${item.qtd} ${item.un} em estoque</div></div>
        </header>
        <div class="mb">
          <div>
            <div class="fl"><span>Desconto</span><b data-out="pct"></b></div>
            <input type="range" min="10" max="70" step="5" value="${m.pct}" data-campo="pct">
          </div>
          <div class="preview">
            <div><div class="r-meta">Preço no app</div><b class="tnum" data-out="preco"></b></div>
            <div class="end"><div class="r-meta">Receita se vender tudo</div><b class="tnum" data-out="receita"></b></div>
          </div>
          <div>
            <div class="fl"><span>Quantidade ofertada</span><b data-out="qtd"></b></div>
            <input type="range" min="1" max="${item.qtd}" step="1" value="${m.qtd}" data-campo="qtd">
          </div>
          <div>
            <div class="fl"><span>Janela de retirada</span></div>
            <select class="sel" data-campo="janela">
              ${JANELAS_RETIRADA.map((j) => `<option ${j === m.janela ? 'selected' : ''}>${j}</option>`).join('')}
            </select>
          </div>
          <label class="chk">
            <input type="checkbox" ${m.doarSobra ? 'checked' : ''} data-campo="doarSobra">
            <span><b>Doar o que não for vendido</b><small>Ao fim da janela, a sobra vai para ${ONG}.</small></span>
          </label>
        </div>
        <footer>
          <button class="btn btn-g" data-act="fecharModal">Cancelar</button>
          <button class="btn btn-p" data-act="publicarAjuste">Publicar oferta</button>
        </footer>
      </div>
    </div>`;

  atualizarResumo(root);
}

/**
 * Atualiza só os textos calculados, sem recriar o modal
 * (recriar quebraria o arraste dos sliders e fecharia o select).
 */
function atualizarResumo(root) {
  const m = S.modal;
  const item = S.itens.find((i) => i.id === m.itemId);
  const preco = precoComDesconto(item.preco, m.pct);
  const saida = (nome) => root.querySelector(`[data-out="${nome}"]`);

  saida('pct').textContent = `-${m.pct}%`;
  saida('qtd').textContent = `${m.qtd} ${item.un}`;
  saida('preco').textContent = brl(preco);
  saida('receita').textContent = brl(preco * m.qtd);
}
