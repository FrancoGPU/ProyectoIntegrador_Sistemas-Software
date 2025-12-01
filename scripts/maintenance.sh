#!/bin/bash

# Script de Mantenimiento y Backup para LogiStock
# Autor: FrancoGPU

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME="logistock_db"

echo "=========================================="
echo "Iniciando Mantenimiento LogiStock - $TIMESTAMP"
echo "=========================================="

# 1. Crear directorio de backups si no existe
if [ ! -d "$BACKUP_DIR" ]; then
  mkdir -p $BACKUP_DIR
  echo "[INFO] Directorio de backups creado."
fi

# 2. Realizar Backup de MongoDB (Simulado si no hay mongodump instalado en este entorno)
if command -v mongodump &> /dev/null; then
    echo "[INFO] Ejecutando mongodump..."
    mongodump --db $DB_NAME --out "$BACKUP_DIR/$TIMESTAMP" --gzip
    echo "[SUCCESS] Backup completado en $BACKUP_DIR/$TIMESTAMP"
else
    echo "[WARN] mongodump no encontrado. Simulando backup..."
    touch "$BACKUP_DIR/backup_$TIMESTAMP.dummy"
    echo "[SUCCESS] Backup simulado creado."
fi

# 3. Limpieza de logs antiguos (más de 7 días)
echo "[INFO] Limpiando logs antiguos..."
find ./logs -name "*.log" -mtime +7 -exec rm {} \;
echo "[SUCCESS] Limpieza completada."

# 4. Verificación de espacio en disco
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}')
echo "[INFO] Uso de disco actual: $DISK_USAGE"

echo "=========================================="
echo "Mantenimiento Finalizado"
echo "=========================================="
