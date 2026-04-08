#!/bin/bash
set -e
mkdir -p public

# Copia os arquivos base
cp index.html    public/index.html
cp relatorio.html public/relatorio.html

# Injeta as variáveis de ambiente nos HTMLs (substitui os placeholders)
sed -i "s|__SUPABASE_URL__|${SUPABASE_URL}|g"       public/index.html
sed -i "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY}|g" public/index.html

sed -i "s|__SUPABASE_URL__|${SUPABASE_URL}|g"       public/relatorio.html
sed -i "s|__SUPABASE_ANON_KEY__|${SUPABASE_ANON_KEY}|g" public/relatorio.html

echo "✓ Build concluído — chaves injetadas com segurança"
