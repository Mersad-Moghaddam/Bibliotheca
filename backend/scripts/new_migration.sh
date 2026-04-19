#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <name_with_underscores>" >&2
  exit 1
fi

name="$1"
if [[ ! "$name" =~ ^[a-z0-9_]+$ ]]; then
  echo "migration name must match ^[a-z0-9_]+$" >&2
  exit 1
fi

latest="$(find migrations -maxdepth 1 -type f -name '*.up.sql' -printf '%f\n' | sed -E 's/^([0-9]{6})_.*/\1/' | sort -n | tail -n 1)"
if [[ -z "$latest" ]]; then
  next="000001"
else
  next=$(printf "%06d" $((10#$latest + 1)))
fi

up="migrations/${next}_${name}.up.sql"
down="migrations/${next}_${name}.down.sql"

cat >"$up" <<SQL
-- ${next}_${name}

SQL
cat >"$down" <<SQL
-- ${next}_${name}

SQL

echo "created $up"
echo "created $down"
