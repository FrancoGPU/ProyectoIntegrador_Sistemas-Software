#!/bin/bash
# Script para instalar todas las extensiones recomendadas de VS Code
# para el proyecto LogiStock Solutions
#
# Uso: ./install-vscode-extensions.sh
#
# Nota: Requiere que el comando 'code' esté disponible en tu PATH
# Si no lo tienes: VS Code → Command Palette → "Shell Command: Install 'code' command in PATH"

set -e

echo "🚀 Instalando extensiones recomendadas para LogiStock Solutions..."
echo ""

# Backend Java/Spring Boot
echo "📦 Backend (Java/Spring Boot)..."
code --install-extension vscjava.vscode-java-pack
code --install-extension vscjava.vscode-maven
code --install-extension vmware.vscode-spring-boot
code --install-extension redhat.java

# Frontend Angular/TypeScript
echo "📦 Frontend (Angular/TypeScript)..."
code --install-extension angular.ng-template
code --install-extension ms-vscode.vscode-typescript-next

# Linting y Formateo
echo "📦 Linting y Formateo..."
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# Base de Datos
echo "📦 Base de Datos..."
code --install-extension mongodb.mongodb-vscode

# Git y Control de Versiones
echo "📦 Git y Control de Versiones..."
code --install-extension eamodio.gitlens
code --install-extension github.vscode-pull-request-github

# Docker y DevContainers
echo "📦 Docker y DevContainers..."
code --install-extension ms-vscode-remote.remote-containers
code --install-extension ms-azuretools.vscode-docker

# Utilidades
echo "📦 Utilidades..."
code --install-extension ms-vscode.vscode-json
code --install-extension pkief.material-icon-theme
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension sonarsource.sonarlint-vscode

echo ""
echo "✅ Todas las extensiones han sido instaladas correctamente!"
echo "🔄 Reinicia VS Code para aplicar los cambios."
