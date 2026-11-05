// Formatação de valores para exibição (pt-BR).

export const brl = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const num = (valor, casas = 1) => valor.toLocaleString('pt-BR', { maximumFractionDigits: casas });

export const plural = (n, singular, pluralForma) => (n === 1 ? singular : pluralForma);

export function prazo(dias) {
  if (dias <= 0) return 'Vence hoje';
  if (dias === 1) return 'Vence amanhã';
  return `Vence em ${dias} dias`;
}

export function textoValidade(dias) {
  if (dias <= 0) return 'Consumir hoje';
  if (dias === 1) return 'Validade: amanhã';
  return `Validade: ${dias} dias`;
}
