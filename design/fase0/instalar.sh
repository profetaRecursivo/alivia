#!/usr/bin/env bash
# Instala la Fase 0 (base compartida) en src/.
# Uso: bash design/fase0/instalar.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

copy() {
  local from="design/fase0/$1.txt"
  local to="$1"
  if [ ! -f "$from" ]; then
    echo "Falta $from" >&2
    exit 1
  fi
  cp "$from" "$to"
  echo "  $to"
}

echo "Instalando Fase 0:"
copy "src/lib/format.ts"
copy "src/lib/demo-data.ts"
copy "src/lib/repository.ts"
copy "src/components/ui/AppHeader.tsx"
copy "src/components/ui/Screen.tsx"
copy "src/components/ui/SuccessDialog.tsx"
copy "src/components/ui/index.ts"

echo
echo "Listo. Verificá con:"
echo "  npx tsc --noEmit"
echo "  npx eslint src"
echo "  git diff --name-only"
