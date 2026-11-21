#!/bin/bash
cd "$(dirname "$0")/.."
git rev-parse --verify -q HEAD >/dev/null || exit 1

{
  git diff HEAD -- 'src/*.ts'
  git ls-files --others --exclude-standard -- 'src/*.ts' | while IFS= read -r f; do
    printf '%s\n' "$f"
    cat "$f"
  done
} 2>/dev/null | shasum | cut -d' ' -f1
