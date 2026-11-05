// Formatação de valores para exibição (pt-BR).

const brl = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const num = (valor, casas = 1) => valor.toLocaleString('pt-BR', { maximumFractionDigits: casas });

const plural = (n, singular, pluralForma) => (n === 1 ? singular : pluralForma);

function prazo(dias) {
  if (dias <= 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  return `Vence em ${dias} dias`;
}

function textoValidade(dias) {
  if (dias <= 0) return 'Consumir hoje';
  if (dias === 1) return 'Validade: amanhã';
  return `Validade: ${dias} dias`;
}
