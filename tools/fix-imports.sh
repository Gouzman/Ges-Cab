#!/bin/bash

echo "🔍 Correction des imports React..."

# Supprimer les imports React inutiles
find src -name "*.jsx" -type f -exec sed -i '' -e 's/^import React, { \(.*\) } from '\''react'\''/import { \1 } from '\''react'\''/' {} +

echo "✅ Terminé"