// Avisos que não fazem parte do estado: toasts do painel e notificação push no celular.

const DURACAO_TOAST = 3200;
const DURACAO_PUSH = 5500;

let alvoPush = null;
let timerPush;

export function toast(mensagem) {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = mensagem;
  box.appendChild(el);
  setTimeout(() => el.remove(), DURACAO_TOAST);
}

export function mostrarPush(titulo, corpo, ofertaId) {
  const el = document.getElementById('push');
  alvoPush = ofertaId;
  el.innerHTML = `
    <span class="pi">🌱</span>
    <span>
      <span class="pt">zeroFome<span>agora</span></span>
      <span class="pb"><b>${titulo}</b><br>${corpo}</span>
    </span>`;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(timerPush);
  timerPush = setTimeout(esconderPush, DURACAO_PUSH);
}

export function esconderPush() {
  document.getElementById('push').classList.remove('show');
}

/** Devolve a oferta ligada ao push e limpa o alvo. */
export function consumirAlvoPush() {
  const id = alvoPush;
  alvoPush = null;
  esconderPush();
  return id;
}
