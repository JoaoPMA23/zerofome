// Modelo de negócio do zeroFome: premissas editáveis, cenários e cálculo dos resultados mensais.
// Tudo aqui é estimativa para discussão; os valores padrão são hipóteses, não dados medidos.

const KG_POR_REFEICAO = 0.5;

const CENARIOS = {
  conservador: { lojas: 10, perdaMensal: 3000, cobertura: 40, vendido: 60, desconto: 50, comissao: 8, mensalidade: 79, custoFixo: 20000, precoKg: 15 },
  base: { lojas: 30, perdaMensal: 4000, cobertura: 60, vendido: 70, desconto: 40, comissao: 10, mensalidade: 99, custoFixo: 20000, precoKg: 15 },
  otimista: { lojas: 100, perdaMensal: 5000, cobertura: 75, vendido: 80, desconto: 35, comissao: 12, mensalidade: 129, custoFixo: 20000, precoKg: 15 },
};

const ROTULO_CENARIO = { conservador: 'Conservador', base: 'Base', otimista: 'Otimista' };

// Premissas atuais do simulador. Não é apagado pelo "Reiniciar" da demonstração.
const SIM = { cenario: 'base', ...CENARIOS.base };

const GRUPOS_SIMULADOR = [
  {
    titulo: 'Mercado',
    campos: [
      { chave: 'lojas', rotulo: 'Estabelecimentos parceiros', min: 1, max: 300, passo: 1, formato: 'int' },
      { chave: 'perdaMensal', rotulo: 'Perda mensal por loja', min: 500, max: 20000, passo: 500, formato: 'brl', ajuda: 'Valor, a preço de venda, do que hoje vence e é descartado.' },
      { chave: 'cobertura', rotulo: 'Parte da perda tratada no app', min: 10, max: 90, passo: 5, formato: 'pct', ajuda: 'Quanto da perda vira oferta ou doação aprovada.' },
      { chave: 'vendido', rotulo: 'Vendido com desconto', min: 0, max: 100, passo: 5, formato: 'pct', ajuda: 'O restante do que é tratado vai para doação.' },
      { chave: 'desconto', rotulo: 'Desconto médio', min: 10, max: 70, passo: 5, formato: 'pct' },
    ],
  },
  {
    titulo: 'Receita do zeroFome',
    campos: [
      { chave: 'comissao', rotulo: 'Comissão sobre vendas', min: 0, max: 20, passo: 1, formato: 'pct' },
      { chave: 'mensalidade', rotulo: 'Mensalidade por loja', min: 0, max: 400, passo: 1, formato: 'brl' },
      { chave: 'custoFixo', rotulo: 'Custo fixo mensal da operação', min: 0, max: 100000, passo: 1000, formato: 'brl', ajuda: 'Equipe, servidores, suporte e marketing.' },
    ],
  },
  {
    titulo: 'Premissas de impacto',
    campos: [
      { chave: 'precoKg', rotulo: 'Preço médio do alimento por kg', min: 5, max: 40, passo: 1, formato: 'brl' },
    ],
  },
];

function aplicarCenario(nome) {
  Object.assign(SIM, CENARIOS[nome], { cenario: nome });
}

function alterarPremissa(chave, valor) {
  SIM[chave] = Number(valor);
  SIM.cenario = null; // deixou de ser um cenário pronto
}

/** Resultados mensais a partir das premissas. */
function simular(p) {
  const valorEmRisco = p.lojas * p.perdaMensal;
  const valorTratado = valorEmRisco * (p.cobertura / 100);
  const valorVendido = valorTratado * (p.vendido / 100); // a preço cheio
  const receitaLojas = valorVendido * (1 - p.desconto / 100);
  const economiaConsumidor = valorVendido - receitaLojas;
  const valorDoado = valorTratado - valorVendido;
  const continuaPerdido = valorEmRisco - valorTratado;

  const receitaComissao = receitaLojas * (p.comissao / 100);
  const receitaMensalidades = p.lojas * p.mensalidade;
  const receitaZeroFome = receitaComissao + receitaMensalidades;
  const resultado = receitaZeroFome - p.custoFixo;

  const recuperaPorLoja = receitaLojas / p.lojas;
  const pagaPorLoja = receitaZeroFome / p.lojas;
  const lojasEquilibrio = pagaPorLoja > 0 ? Math.ceil(p.custoFixo / pagaPorLoja) : Infinity;

  const kgSalvo = valorTratado / p.precoKg;
  const kgDoado = valorDoado / p.precoKg;

  return {
    valorEmRisco,
    destino: { receitaLojas, economiaConsumidor, valorDoado, continuaPerdido },
    receitaComissao,
    receitaMensalidades,
    receitaZeroFome,
    resultado,
    loja: {
      recupera: recuperaPorLoja,
      paga: pagaPorLoja,
      ganho: recuperaPorLoja - pagaPorLoja,
      retorno: pagaPorLoja > 0 ? recuperaPorLoja / pagaPorLoja : null,
    },
    lojasEquilibrio,
    kgSalvo,
    refeicoesDoadas: kgDoado / KG_POR_REFEICAO,
  };
}
