# 🗄️ Guía MongoDB - LogiStock Database

## 📊 Estado Actual de la Base de Datos

**Base de Datos:** `logistockdb`  
**Colecciones:** `products`  
**Total de productos:** 2

---

## 🎯 Formas de Ver los Datos

### 1️⃣ **Usando mongosh CLI (Recomendado)**

#### Ver todas las colecciones:
```bash
mongosh logistockdb --eval "db.getCollectionNames()"
```

#### Ver todos los productos:
```bash
mongosh logistockdb --eval "db.products.find().pretty()"
```

#### Contar productos:
```bash
mongosh logistockdb --eval "db.products.countDocuments()"
```

#### Ver productos con stock bajo:
```bash
mongosh logistockdb --eval "db.products.find({ \$expr: { \$lte: ['\$stock', '\$minStock'] } }).pretty()"
```

#### Buscar por código:
```bash
mongosh logistockdb --eval "db.products.find({code: 'OFF001'}).pretty()"
```

---

### 2️⃣ **Usando el Script Interactivo** ⭐ (Más fácil)

Hemos creado un script con menú interactivo:

```bash
./scripts/mongodb-queries.sh
```

**Opciones del menú:**
1. Ver todas las colecciones
2. Ver todos los productos
3. Contar productos
4. Ver productos con stock bajo
5. Ver productos por categoría
6. Buscar producto por código
7. Ver estadísticas
8. Abrir shell de MongoDB
9. Salir

**Uso rápido (sin menú):**
```bash
./scripts/mongodb-queries.sh products    # Ver todos los productos
./scripts/mongodb-queries.sh count       # Contar productos
./scripts/mongodb-queries.sh lowstock    # Stock bajo
./scripts/mongodb-queries.sh stats       # Estadísticas
./scripts/mongodb-queries.sh shell       # Abrir shell
```

---

### 3️⃣ **MongoDB Shell Interactivo**

Abrir shell de MongoDB:
```bash
mongosh logistockdb
```

Dentro del shell, puedes ejecutar:

```javascript
// Ver todas las colecciones
show collections

// Ver todos los productos
db.products.find().pretty()

// Contar productos
db.products.countDocuments()

// Ver un producto específico
db.products.findOne()

// Buscar por código
db.products.find({code: "OFF001"})

// Productos con stock bajo
db.products.find({
    $expr: { $lte: ["$stock", "$minStock"] }
})

// Productos por categoría
db.products.find({category: "Tecnología"})

// Productos activos
db.products.find({isActive: true})

// Estadísticas agregadas
db.products.aggregate([
    {
        $group: {
            _id: "$category",
            cantidad: { $sum: 1 },
            stockTotal: { $sum: "$stock" }
        }
    }
])

// Ver categorías únicas
db.products.distinct("category")

// Salir del shell
exit
```

---

### 4️⃣ **A través del Backend API** (Recomendado para Frontend)

Si el backend está corriendo:

```bash
# Ver todos los productos (API)
curl http://localhost:8080/api/inventario | jq '.'

# Ver productos con stock bajo
curl http://localhost:8080/api/inventario/low-stock | jq '.'

# Ver estadísticas
curl http://localhost:8080/api/inventario/stats | jq '.'

# Ver un producto específico (por ID)
curl http://localhost:8080/api/inventario/68da1ce608a529744cba9ed0 | jq '.'
```

---

### 5️⃣ **Usando MongoDB Compass** (GUI - Opcional)

Si tienes MongoDB Compass instalado:

1. Abrir MongoDB Compass
2. Conectar a: `mongodb://localhost:27017`
3. Seleccionar base de datos: `logistockdb`
4. Explorar colección: `products`

**Descargar:** https://www.mongodb.com/try/download/compass

---

## 📋 Datos Actuales en la Base de Datos

### Productos Existentes:

#### Producto 1:
```json
{
  "_id": "68da1ce608a529744cba9ed0",
  "code": "OFF002",
  "name": "Producto de Prueba",
  "description": "Este es un producto de prueba para verificar el backend Java",
  "category": "Tecnología",
  "stock": 10,
  "minStock": 5,
  "price": "99.99",
  "supplier": "Proveedor Test",
  "location": "Almacén Principal",
  "isActive": true,
  "createdAt": "2025-09-29T05:45:10.132Z",
  "updatedAt": "2025-09-29T06:31:19.149Z"
}
```

#### Producto 2:
```json
{
  "_id": "68da23efa4cd7153584c797d",
  "code": "OFF001",
  "name": "Silla Ergonómica",
  "description": "Silla de oficina con soporte lumbar",
  "category": "Oficina",
  "stock": 50,
  "minStock": 10,
  "price": "500",
  "location": "Almacén Principal",
  "isActive": true,
  "createdAt": "2025-09-29T06:15:11.295Z",
  "updatedAt": "2025-09-29T06:31:14.178Z"
}
```

---

## 🔧 Consultas Útiles

### Insertar un producto de prueba:
```javascript
mongosh logistockdb --eval '
db.products.insertOne({
    code: "TEC001",
    name: "Monitor LED 24 pulgadas",
    description: "Monitor Full HD para oficina",
    category: "Tecnología",
    stock: 15,
    minStock: 8,
    price: "850",
    supplier: "TechStore",
    location: "Almacén Principal",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _class: "com.logistock.model.Product"
})
'
```

### Actualizar stock de un producto:
```javascript
mongosh logistockdb --eval '
db.products.updateOne(
    { code: "OFF001" },
    { $set: { stock: 45, updatedAt: new Date() } }
)
'
```

### Eliminar un producto:
```javascript
mongosh logistockdb --eval '
db.products.deleteOne({ code: "OFF002" })
'
```

### Ver productos ordenados por stock (menor a mayor):
```javascript
mongosh logistockdb --eval '
db.products.find().sort({ stock: 1 }).pretty()
'
```

### Búsqueda por nombre (contiene texto):
```javascript
mongosh logistockdb --eval '
db.products.find({
    name: { $regex: "Silla", $options: "i" }
}).pretty()
'
```

---

## 📊 Queries Avanzadas

### Valor total del inventario por categoría:
```javascript
db.products.aggregate([
    {
        $group: {
            _id: "$category",
            totalStock: { $sum: "$stock" },
            totalValue: { 
                $sum: { 
                    $multiply: [
                        "$stock", 
                        { $toDouble: "$price" }
                    ]
                }
            },
            cantidad: { $sum: 1 }
        }
    },
    { $sort: { totalValue: -1 } }
])
```

### Top 5 productos con más stock:
```javascript
db.products.find()
    .sort({ stock: -1 })
    .limit(5)
    .pretty()
```

### Productos por rango de precio:
```javascript
// Productos entre 100 y 1000
db.products.find({
    $expr: {
        $and: [
            { $gte: [{ $toDouble: "$price" }, 100] },
            { $lte: [{ $toDouble: "$price" }, 1000] }
        ]
    }
}).pretty()
```

---

## 🛠️ Mantenimiento de la Base de Datos

### Backup de la base de datos:
```bash
mongodump --db logistockdb --out ./backup/$(date +%Y%m%d)
```

### Restaurar backup:
```bash
mongorestore --db logistockdb ./backup/20241017/logistockdb
```

### Limpiar datos de prueba:
```javascript
mongosh logistockdb --eval '
db.products.deleteMany({
    name: { $regex: "prueba", $options: "i" }
})
'
```

### Ver tamaño de la base de datos:
```bash
mongosh logistockdb --eval "db.stats()"
```

### Ver índices de la colección:
```bash
mongosh logistockdb --eval "db.products.getIndexes()"
```

---

## 🚀 Comandos Rápidos

```bash
# Ver datos rápidamente
./scripts/mongodb-queries.sh products

# Ver estadísticas
./scripts/mongodb-queries.sh stats

# Abrir shell interactivo
./scripts/mongodb-queries.sh shell

# O usar mongosh directamente
mongosh logistockdb

# Ver logs de MongoDB (si está corriendo como servicio)
sudo journalctl -u mongod -f
```

---

## 📝 Notas Importantes

1. **Conexión:** MongoDB está corriendo en `localhost:27017`
2. **Base de datos:** `logistockdb`
3. **Autenticación:** Actualmente sin usuario/contraseña (desarrollo)
4. **Colecciones activas:** `products`
5. **Script útil:** `./scripts/mongodb-queries.sh` para consultas rápidas

---

## 🔍 Verificar Estado de MongoDB

```bash
# Ver si MongoDB está corriendo
systemctl status mongod

# O verificar proceso
ps aux | grep mongod

# Verificar puerto
netstat -tulpn | grep 27017

# Probar conexión
mongosh --eval "db.adminCommand('ping')"
```

---

**Última actualización:** 17 de octubre de 2025  
**Estado:** ✅ MongoDB funcionando con 2 productos en inventario
