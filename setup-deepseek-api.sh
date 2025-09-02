#!/bin/bash

# =========================================
# CONFIGURACIÓN DE DEEPSEEK API KEY
# =========================================

echo "🔧 Configurando DeepSeek API Key para Firebase Functions..."

# ⚠️ IMPORTANTE: Reemplaza TU_API_KEY_AQUI con tu API key real de DeepSeek
# Puedes obtener una gratis en: https://platform.deepseek.com/api_keys

# MÉTODO 1: Configurar con Firebase CLI (RECOMENDADO)
echo "📝 Método 1: Configurar con Firebase Functions Config"
firebase functions:config:set deepseek.key="sk-tu-api-key-aqui"

# MÉTODO 2: Variable de entorno local (ALTERNATIVO)
echo "📝 Método 2: Variable de entorno"
# Descomenta la siguiente línea y reemplaza con tu API key
# export DEEPSEEK_API_KEY="sk-tu-api-key-aqui"

echo ""
echo "✅ Configuración completada"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Reemplaza 'sk-tu-api-key-aqui' con tu API key real de DeepSeek"
echo "2. Ejecuta: firebase deploy --only functions"
echo "3. Prueba la generación de copywriting"
echo ""
echo "📚 Para obtener API key gratuita:"
echo "   https://platform.deepseek.com/api_keys"
echo ""
