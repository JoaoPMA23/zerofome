// Dados fictícios usados na demonstração.
// Em produção, os itens viriam da integração com o ERP do estabelecimento.

const MERCADO = { nome: 'Mercado Vila Verde', dist: '0,7 km', emoji: '🏪' };
const ONG = 'Banco de Alimentos Vila Verde';
const CLIENTE = { nome: 'Ana', abreviado: 'Ana S.', bairro: 'Vila Verde', raio: '2 km' };

const CATEGORIAS_APP = ['Todos', 'Padaria', 'Hortifruti', 'Mercearia', 'Refeições'];

// categoria do estoque -> categoria exibida no filtro do app
const CATEGORIA_APP = {
  Padaria: 'Padaria',
  Hortifruti: 'Hortifruti',
  Mercearia: 'Mercearia',
  Laticínios: 'Mercearia',
  Carnes: 'Mercearia',
  Refeições: 'Refeições',
};

const COR_CATEGORIA = {
  Padaria: 'oklch(94% .05 75)',
  Hortifruti: 'oklch(94% .06 140)',
  Mercearia: 'oklch(94% .03 230)',
  Refeições: 'oklch(94% .05 30)',
  Laticínios: 'oklch(95% .03 220)',
  Carnes: 'oklch(94% .05 20)',
};

const CONSERVACAO = {
  Padaria: 'Manter em local seco, com a embalagem fechada.',
  Hortifruti: 'Manter em local fresco e arejado; lavar antes de consumir.',
  Mercearia: 'Manter em local seco e arejado.',
  Laticínios: 'Manter refrigerado (até 7 °C) após a retirada.',
  Carnes: 'Manter refrigerado (0 a 4 °C) e consumir dentro do prazo.',
  Refeições: 'Consumir no mesmo dia; refrigerar se não for consumir em até 2 h.',
};

const JANELAS_RETIRADA = ['Hoje, 17h às 19h', 'Hoje, 18h às 20h', 'Hoje, 19h às 21h', 'Amanhã, 9h às 12h'];

const ETAPAS_FLUXO = [
  { titulo: 'ERP / estoque', descricao: 'Produtos, lotes e validades' },
  { titulo: 'Detecção', descricao: 'Itens perto do vencimento' },
  { titulo: 'Sugestão', descricao: 'Desconto ou doação' },
  { titulo: 'Aprovação', descricao: 'Comerciante autoriza' },
  { titulo: 'Destinação', descricao: 'Reserva, retirada e impacto' },
];

// Campos de um item de estoque:
//   dias: dias até o vencimento | giro: venda média por dia | kg: peso por unidade
const ERP_LEITURA_INICIAL = [
  { nome: 'Iogurte natural 170 g', cat: 'Laticínios', e: '🥛', lote: 'L2311', qtd: 24, un: 'un', preco: 4.49, dias: 2, giro: 5, kg: 0.17 },
  { nome: 'Pão de forma integral', cat: 'Padaria', e: '🍞', lote: 'P0811', qtd: 12, un: 'un', preco: 9.9, dias: 1, giro: 4, kg: 0.5 },
  { nome: 'Banana prata', cat: 'Hortifruti', e: '🍌', lote: 'H1104', qtd: 18, un: 'kg', preco: 6.99, dias: 2, giro: 5, kg: 1 },
  { nome: 'Alface crespa', cat: 'Hortifruti', e: '🥬', lote: 'H1105', qtd: 15, un: 'un', preco: 3.49, dias: 0, giro: 6, kg: 0.3 },
  { nome: 'Frango resfriado (bandeja 1 kg)', cat: 'Carnes', e: '🍗', lote: 'C5520', qtd: 8, un: 'un', preco: 18.9, dias: 1, giro: 3, kg: 1 },
  { nome: 'Queijo minas frescal 500 g', cat: 'Laticínios', e: '🧀', lote: 'L2290', qtd: 6, un: 'un', preco: 16.9, dias: 4, giro: 1, kg: 0.5 },
];

// Leituras seguintes, disparadas pelo botão "Simular leitura do ERP".
const ERP_PROXIMAS_LEITURAS = [
  [
    { nome: 'Bolo de cenoura (fatia)', cat: 'Padaria', e: '🍰', lote: 'P0812', qtd: 10, un: 'un', preco: 6.5, dias: 1, giro: 3, kg: 0.15 },
    { nome: 'Tomate italiano', cat: 'Hortifruti', e: '🍅', lote: 'H1108', qtd: 10, un: 'kg', preco: 8.99, dias: 2, giro: 3, kg: 1 },
    { nome: 'Suco integral de uva 1 L', cat: 'Mercearia', e: '🧃', lote: 'M7731', qtd: 14, un: 'un', preco: 12.9, dias: 5, giro: 1, kg: 1 },
  ],
  [
    { nome: 'Pão francês (kit 10 un)', cat: 'Padaria', e: '🥖', lote: 'P0813', qtd: 9, un: 'kit', preco: 8, dias: 0, giro: 3, kg: 0.5 },
    { nome: 'Requeijão cremoso 200 g', cat: 'Laticínios', e: '🫙', lote: 'L2318', qtd: 11, un: 'un', preco: 7.99, dias: 3, giro: 2, kg: 0.2 },
  ],
];

// Ofertas de outros estabelecimentos que já aparecem no app do cliente.
const OFERTAS_VIZINHOS = [
  { loja: 'Padaria Pão da Esquina', dist: '0,4 km', nome: 'Kit de pães e salgados', cat: 'Padaria', e: '🥐', un: 'kit', preco: 12.5, orig: 25, janela: 'Hoje, 18h às 20h', validade: 'Consumir em até 1 dia', disp: 6, kg: 0.8 },
  { loja: 'Hortifruti Folha Viva', dist: '0,9 km', nome: 'Cesta de frutas e verduras', cat: 'Hortifruti', e: '🧺', un: 'cesta', preco: 17.9, orig: 30, janela: 'Hoje, 17h às 19h', validade: 'Consumir em até 3 dias', disp: 4, kg: 2.5 },
  { loja: 'Restaurante Sabor Caseiro', dist: '1,3 km', nome: 'Marmita do dia', cat: 'Refeições', e: '🍱', un: 'un', preco: 15.9, orig: 28, janela: 'Hoje, 14h às 15h', validade: 'Consumir no mesmo dia', disp: 8, kg: 0.6 },
  { loja: 'Confeitaria Doce Ponto', dist: '1,8 km', nome: 'Kit de confeitaria', cat: 'Padaria', e: '🧁', un: 'kit', preco: 11.9, orig: 20, janela: 'Hoje, 19h às 21h', validade: 'Consumir em até 2 dias', disp: 3, kg: 0.5 },
];
