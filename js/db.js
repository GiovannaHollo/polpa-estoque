// js/db.js — Conexão e operações com o Supabase
// As variáveis SUPABASE_URL e SUPABASE_ANON_KEY são injetadas
// pelo Vercel em tempo de build via vercel.json

const SUPABASE_URL      = window.__env?.SUPABASE_URL      || '';
const SUPABASE_ANON_KEY = window.__env?.SUPABASE_ANON_KEY || '';

// ── Cliente Supabase (via CDN, carregado no HTML) ────────────
const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── AUTH ─────────────────────────────────────────────────────
export const auth = {
  login:   (email, senha) => _sb.auth.signInWithPassword({ email, password: senha }),
  logout:  ()             => _sb.auth.signOut(),
  session: ()             => _sb.auth.getSession(),
  onAuthChange: (cb)      => _sb.auth.onAuthStateChange(cb),
};

// ── PRODUTOS ─────────────────────────────────────────────────
export const db = {
  // Listar todos os produtos ativos
  async listarProdutos() {
    const { data, error } = await _sb
      .from('produtos')
      .select('*')
      .eq('ativo', true)
      .order('nome');
    if (error) throw error;
    return data;
  },

  // Criar produto
  async criarProduto(prod) {
    const { data, error } = await _sb
      .from('produtos')
      .insert(prod)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Atualizar produto
  async atualizarProduto(id, campos) {
    const { data, error } = await _sb
      .from('produtos')
      .update(campos)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Soft-delete produto
  async excluirProduto(id) {
    const { error } = await _sb
      .from('produtos')
      .update({ ativo: false })
      .eq('id', id);
    if (error) throw error;
  },

  // ── MOVIMENTAÇÕES ──────────────────────────────────────────

  // Registrar entrada de estoque em kg
  async registrarEntrada({ qty_kg, preco_kg, vendedor, conta, descricao }) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .insert({ tipo: 'entrada', qty_kg, preco_kg, vendedor, conta, descricao })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Registrar saída/venda (desconta estoque do produto)
  async registrarVenda({ produto_id, produto_nome, unidades, qty_kg, preco_total, cliente, descricao }) {
    // 1. Insere movimentação
    const { data, error } = await _sb
      .from('movimentacoes')
      .insert({ tipo: 'saida', qty_kg, produto_id, produto_nome, unidades, preco_total, cliente, descricao })
      .select()
      .single();
    if (error) throw error;

    // 2. Decrementa estoque do produto
    const { error: err2 } = await _sb.rpc('decrementar_estoque', {
      p_id: produto_id,
      p_qtd: unidades,
    });
    if (err2) throw err2;

    return data;
  },

  // Listar últimas movimentações
  async listarMovimentacoes(limite = 50) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(limite);
    if (error) throw error;
    return data;
  },

  // ── RELATÓRIOS ─────────────────────────────────────────────

  // Estoque total em kg
  async estoqueKgTotal() {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('tipo, qty_kg');
    if (error) throw error;
    return data.reduce((acc, m) => acc + (m.tipo === 'entrada' ? m.qty_kg : -m.qty_kg), 0);
  },

  // Movimentações em um período
  async movimentacoesPorPeriodo(de, ate) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('*')
      .gte('criado_em', de)
      .lte('criado_em', ate)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Faturamento por vendedor
  async faturamentoPorVendedor(de, ate) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('vendedor, qty_kg, preco_total')
      .eq('tipo', 'entrada')
      .gte('criado_em', de)
      .lte('criado_em', ate);
    if (error) throw error;
    const mapa = {};
    data.forEach(m => {
      const v = m.vendedor || 'Sem vendedor';
      if (!mapa[v]) mapa[v] = { vendedor: v, total_kg: 0, total_r$: 0 };
      mapa[v].total_kg += m.qty_kg;
      mapa[v].total_r$ += m.preco_total || 0;
    });
    return Object.values(mapa).sort((a, b) => b.total_r$ - a.total_r$);
  },

  // Faturamento por conta
  async faturamentoPorConta(de, ate) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('conta, qty_kg, preco_total')
      .eq('tipo', 'entrada')
      .gte('criado_em', de)
      .lte('criado_em', ate);
    if (error) throw error;
    const mapa = {};
    data.forEach(m => {
      const c = m.conta || 'Sem conta';
      if (!mapa[c]) mapa[c] = { conta: c, total_kg: 0, total_r$: 0 };
      mapa[c].total_kg += m.qty_kg;
      mapa[c].total_r$ += m.preco_total || 0;
    });
    return Object.values(mapa).sort((a, b) => b.total_r$ - a.total_r$);
  },

  // Vendas por produto no período
  async vendasPorProduto(de, ate) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('produto_nome, unidades, qty_kg, preco_total')
      .eq('tipo', 'saida')
      .gte('criado_em', de)
      .lte('criado_em', ate);
    if (error) throw error;
    const mapa = {};
    data.forEach(m => {
      const n = m.produto_nome || 'Produto removido';
      if (!mapa[n]) mapa[n] = { nome: n, total_unidades: 0, total_kg: 0, total_r$: 0 };
      mapa[n].total_unidades += m.unidades || 0;
      mapa[n].total_kg       += m.qty_kg;
      mapa[n].total_r$       += m.preco_total || 0;
    });
    return Object.values(mapa).sort((a, b) => b.total_r$ - a.total_r$);
  },

  // Faturamento total no período
  async faturamentoTotal(de, ate) {
    const { data, error } = await _sb
      .from('movimentacoes')
      .select('tipo, qty_kg, preco_total, preco_kg')
      .gte('criado_em', de)
      .lte('criado_em', ate);
    if (error) throw error;
    return {
      entradas_kg:  data.filter(m => m.tipo === 'entrada').reduce((a, m) => a + m.qty_kg, 0),
      saidas_kg:    data.filter(m => m.tipo === 'saida').reduce((a, m) => a + m.qty_kg, 0),
      faturamento:  data.filter(m => m.tipo === 'saida').reduce((a, m) => a + (m.preco_total || 0), 0),
      custo:        data.filter(m => m.tipo === 'entrada').reduce((a, m) => a + (m.preco_total || 0), 0),
    };
  },
};
