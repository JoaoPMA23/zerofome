// Regras de negócio: sugestão de destino para cada item e indicadores do painel.

const precoComDesconto = (preco, pct) => Math.round(preco * (1 - pct / 100) * 100) / 100;

const percentualDesconto = (preco, original) => Math.round((1 - preco / original) * 100);

/**
 * Previsão simples de sobra: o que não sai pelo giro médio até o vencimento.
 * - vence hoje: sugere doação (não há tempo para vender);
 * - senão: desconto maior quanto mais perto do vencimento, +5 pontos se a sobra prevista for alta.
 */
function sugerirDestino(item) {
  const diasUteis = Math.max(item.dias, 0);
  const sobra = Math.max(0, Math.round(item.qtd - item.giro * diasUteis));

  if (item.dias <= 0) {
    return {
      tipo: 'doacao',
      pct: 0,
      sobra: sobra || item.qtd,
      motivo: 'Vence hoje: o tempo para vender é curto, a doação garante o destino.',
    };
  }

  let pct = item.dias <= 1 ? 50 : item.dias <= 2 ? 40 : item.dias <= 4 ? 25 : 15;
  if (sobra / item.qtd > 0.6) pct += 5;

  return {
    tipo: 'desconto',
    pct,
    sobra,
    motivo: `Giro médio de ${item.giro} ${item.un}/dia: sem ação, sobram ~${sobra} ${item.un}.`,
  };
}

function calcularIndicadores(estado) {
  const pendentes = estado.itens.filter((i) => i.status === 'pendente');
  const reservasDoMercado = estado.reservas.filter((r) => r.doMercado);
  const kgVendido = estado.reservas.reduce((soma, r) => soma + r.kg, 0);
  const kgDoado = estado.doacoes.reduce((soma, d) => soma + d.kg, 0);

  return {
    itensEmRisco: pendentes.length,
    valorEmRisco: pendentes.reduce((soma, i) => soma + i.sugestao.sobra * i.preco, 0),
    receita: reservasDoMercado.reduce((soma, r) => soma + r.total, 0),
    reservas: reservasDoMercado.length,
    kgSalvo: kgVendido + kgDoado,
    kgDoado,
    doacoes: estado.doacoes.length,
  };
}
