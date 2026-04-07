#!/bin/bash
# Cria a pasta de saída
mkdir -p public/css public/js

# Copia todos os arquivos
cp index.html    public/
cp relatorio.html public/
cp -r css/       public/css/
cp -r js/        public/js/

# Injeta as variáveis de ambiente no env.js
cat > public/env.js << EOF
window.__env = {
  SUPABASE_URL:      "${SUPABASE_URL}",
  SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
};
EOF

echo "Build concluído!"
