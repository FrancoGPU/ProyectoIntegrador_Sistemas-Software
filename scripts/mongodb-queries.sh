#!/bin/bash

# =========================================
# MongoDB Queries - LogiStock Database
# =========================================

DB_NAME="logistockdb"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MongoDB - LogiStock Database        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Función para mostrar menú
show_menu() {
    echo -e "${GREEN}Opciones disponibles:${NC}"
    echo "1. Ver todas las colecciones"
    echo "2. Ver todos los productos"
    echo "3. Contar productos"
    echo "4. Ver productos con stock bajo"
    echo "5. Ver productos por categoría"
    echo "6. Buscar producto por código"
    echo "7. Ver estadísticas"
    echo "8. Abrir shell de MongoDB"
    echo "9. Salir"
    echo ""
}

# 1. Ver colecciones
list_collections() {
    echo -e "${YELLOW}📦 Colecciones en la base de datos:${NC}"
    mongosh $DB_NAME --eval "db.getCollectionNames()" --quiet
    echo ""
}

# 2. Ver todos los productos
list_all_products() {
    echo -e "${YELLOW}📋 Todos los productos:${NC}"
    mongosh $DB_NAME --eval "db.products.find().pretty()" --quiet
    echo ""
}

# 3. Contar productos
count_products() {
    echo -e "${YELLOW}🔢 Total de productos:${NC}"
    mongosh $DB_NAME --eval "db.products.countDocuments()" --quiet
    echo ""
}

# 4. Ver productos con stock bajo
low_stock_products() {
    echo -e "${YELLOW}⚠️  Productos con stock bajo:${NC}"
    mongosh $DB_NAME --eval "
        db.products.find({
            \$expr: { \$lte: ['\$stock', '\$minStock'] }
        }).pretty()
    " --quiet
    echo ""
}

# 5. Ver productos por categoría
products_by_category() {
    echo -e "${YELLOW}📊 Productos agrupados por categoría:${NC}"
    mongosh $DB_NAME --eval "
        db.products.aggregate([
            { \$group: { 
                _id: '\$category', 
                cantidad: { \$sum: 1 },
                stockTotal: { \$sum: '\$stock' }
            }},
            { \$sort: { cantidad: -1 }}
        ])
    " --quiet
    echo ""
}

# 6. Buscar por código
search_by_code() {
    read -p "Ingrese el código del producto: " code
    echo -e "${YELLOW}🔍 Buscando producto con código: $code${NC}"
    mongosh $DB_NAME --eval "db.products.find({code: '$code'}).pretty()" --quiet
    echo ""
}

# 7. Estadísticas
show_stats() {
    echo -e "${YELLOW}📈 Estadísticas generales:${NC}"
    mongosh $DB_NAME --eval "
        print('Total de productos: ' + db.products.countDocuments());
        print('Productos activos: ' + db.products.countDocuments({isActive: true}));
        print('Productos inactivos: ' + db.products.countDocuments({isActive: false}));
        print('');
        print('Stock total: ' + db.products.aggregate([
            { \$group: { _id: null, total: { \$sum: '\$stock' }}}
        ]).toArray()[0].total);
        print('');
        print('Categorías:');
        db.products.distinct('category').forEach(cat => print('  - ' + cat));
    " --quiet
    echo ""
}

# 8. Abrir shell
open_shell() {
    echo -e "${YELLOW}🐚 Abriendo MongoDB Shell...${NC}"
    echo "Escribe 'exit' para salir del shell"
    echo ""
    mongosh $DB_NAME
}

# Script principal
if [ $# -eq 0 ]; then
    # Modo interactivo
    while true; do
        show_menu
        read -p "Seleccione una opción (1-9): " option
        echo ""
        
        case $option in
            1) list_collections ;;
            2) list_all_products ;;
            3) count_products ;;
            4) low_stock_products ;;
            5) products_by_category ;;
            6) search_by_code ;;
            7) show_stats ;;
            8) open_shell ;;
            9) echo "¡Hasta luego!"; exit 0 ;;
            *) echo -e "${YELLOW}Opción inválida${NC}\n" ;;
        esac
        
        read -p "Presiona Enter para continuar..."
        clear
    done
else
    # Modo comando directo
    case $1 in
        list) list_collections ;;
        products) list_all_products ;;
        count) count_products ;;
        lowstock) low_stock_products ;;
        categories) products_by_category ;;
        stats) show_stats ;;
        shell) open_shell ;;
        *) 
            echo "Uso: $0 [comando]"
            echo "Comandos disponibles:"
            echo "  list        - Ver colecciones"
            echo "  products    - Ver todos los productos"
            echo "  count       - Contar productos"
            echo "  lowstock    - Productos con stock bajo"
            echo "  categories  - Productos por categoría"
            echo "  stats       - Estadísticas generales"
            echo "  shell       - Abrir MongoDB shell"
            echo ""
            echo "Sin argumentos: Modo interactivo"
            ;;
    esac
fi
