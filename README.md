# 🌿 Polpa de Maracujá — Sistema de Estoque

App web para controle de estoque, vendas e relatórios. Funciona em qualquer celular ou computador.

---

## 🗂️ Estrutura

```
polpa-estoque/
├── index.html           ← App principal (estoque + produtos)
├── relatorio.html       ← Página de relatórios
├── css/shared.css       ← Estilos compartilhados
├── js/db.js             ← Funções do banco (referência)
├── env.js               ← Variáveis de ambiente (gerado no build)
├── build.sh             ← Script de build para o Vercel
├── vercel.json          ← Configuração do Vercel
├── supabase_schema.sql  ← Schema do banco de dados
└── .env.example         ← Modelo das variáveis
```

---

## 🚀 Configuração passo a passo

### 1. Criar o banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **"New project"** → dê um nome (ex: `polpa-estoque`)
3. Escolha uma senha para o banco e clique em **"Create new project"**
4. Aguarde ~2 minutos para o projeto ser criado
5. No menu lateral, clique em **"SQL Editor"**
6. Cole o conteúdo do arquivo `supabase_schema.sql` e clique em **"Run"**
7. Vá em **"Project Settings" → "API"** e anote:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon / public key** (começa com `eyJ...`)

### 2. Criar usuários no Supabase

1. No menu lateral, clique em **"Authentication" → "Users"**
2. Clique em **"Invite user"** ou **"Add user"**
3. Crie um e-mail e senha para cada pessoa que vai usar o app
4. Repita para quantos usuários precisar

### 3. Criar o repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"+"** → **"New repository"**
3. Nome: `polpa-estoque` → marque **Public** → **"Create repository"**
4. Faça upload de todos os arquivos deste projeto

### 4. Hospedar no Vercel

1. Acesse [vercel.com](https://vercel.com) e crie conta com o GitHub
2. Clique em **"Add New Project"** → importe o repositório `polpa-estoque`
3. Antes de confirmar o deploy, clique em **"Environment Variables"** e adicione:
   - `SUPABASE_URL` → cole a Project URL do Supabase
   - `SUPABASE_ANON_KEY` → cole a anon key do Supabase
4. Clique em **"Deploy"**
5. Em ~1 minuto o app estará no ar em `https://polpa-estoque.vercel.app`

---

## 🔄 Como atualizar o app

Sempre que você editar os arquivos e fazer upload no GitHub, o Vercel atualiza o site automaticamente em ~30 segundos.

---

## 📊 Funcionalidades

- **Estoque:** painel com kg disponíveis, faturamento do mês, entradas e saídas do dia
- **Entrada:** registrar produção/compra com vendedor, conta e descrição
- **Venda:** selecionar produto cadastrado, calcular kg automaticamente
- **Produtos:** cadastrar potes, sachês, pacotes com peso e preço
- **Relatórios:**
  - Filtro por período (hoje, 7 dias, mês, mês passado, ano ou personalizado)
  - KPIs: faturamento, custo, kg vendidos, kg comprados
  - Gráfico de vendas por produto
  - Gráfico de entradas por vendedor
  - Gráfico de faturamento por conta
  - Tabela completa de movimentações
  - Exportar CSV para Excel

---

## 🔒 Segurança

- Acesso protegido por login (e-mail + senha)
- Dados armazenados no Supabase (PostgreSQL)
- As chaves de API ficam apenas no Vercel, nunca expostas no código
- Row Level Security ativo: só usuários autenticados acessam os dados
