package com.logistock.controller;

import com.logistock.dto.ActualizarEstadoRequest;
import com.logistock.dto.CrearPedidoRequest;
import com.logistock.dto.StockValidationResult;
import com.logistock.model.EstadoPedido;
import com.logistock.model.Pedido;
import com.logistock.model.ProductoPedido;
import com.logistock.model.User;
import com.logistock.service.PedidoService;
import com.logistock.service.ProductService;
import com.logistock.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    // ==================== ENDPOINTS ADMIN ====================

    /**
     * Validar stock antes de crear pedido (ADMIN)
     * Verifica si algún producto quedará por debajo del stock mínimo
     */
    @PostMapping("/validar-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> validarStock(@RequestBody List<ProductoPedido> productos) {
        try {
            StockValidationResult resultado = productService.validateStockForOrder(productos);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error al validar stock: " + e.getMessage()));
        }
    }

    /**
     * Crear nuevo pedido (ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> crearPedido(@RequestBody CrearPedidoRequest request) {
        try {
            Pedido pedido = new Pedido();
            pedido.setClienteId(request.getClienteId());
            pedido.setClienteNombre(request.getClienteNombre());
            pedido.setClienteDireccion(request.getClienteDireccion());
            pedido.setClienteTelefono(request.getClienteTelefono());
            pedido.setProductos(request.getProductos());
            pedido.setDireccionEntrega(request.getDireccionEntrega());
            pedido.setObservaciones(request.getObservaciones());

            Pedido nuevoPedido = pedidoService.crearPedido(pedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener todos los pedidos (ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> obtenerTodos() {
        List<Pedido> pedidos = pedidoService.obtenerTodos();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Obtener pedido por ID (ADMIN)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        Optional<Pedido> pedido = pedidoService.obtenerPorId(id);
        if (pedido.isPresent()) {
            return ResponseEntity.ok(pedido.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Actualizar pedido (ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarPedido(
            @PathVariable String id,
            @RequestBody Pedido pedidoActualizado) {
        try {
            Pedido pedido = pedidoService.actualizarPedido(id, pedidoActualizado);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cancelar pedido (ADMIN)
     */
    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelarPedido(@PathVariable String id) {
        try {
            Pedido pedido = pedidoService.cancelarPedido(id);
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Eliminar pedido (ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarPedido(@PathVariable String id) {
        try {
            pedidoService.eliminarPedido(id);
            return ResponseEntity.ok(Map.of("message", "Pedido eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener estadísticas de pedidos (ADMIN)
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PedidoService.PedidoEstadisticas> obtenerEstadisticas() {
        PedidoService.PedidoEstadisticas stats = pedidoService.obtenerEstadisticas();
        return ResponseEntity.ok(stats);
    }

    /**
     * Obtener pedidos por estado (ADMIN)
     */
    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Pedido>> obtenerPorEstado(@PathVariable EstadoPedido estado) {
        List<Pedido> pedidos = pedidoService.obtenerPorEstado(estado);
        return ResponseEntity.ok(pedidos);
    }

    // ==================== ENDPOINTS USER ====================

    /**
     * Obtener pedidos disponibles (USER)
     */
    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<Pedido>> obtenerDisponibles() {
        List<Pedido> pedidos = pedidoService.obtenerDisponibles();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * Tomar un pedido (USER)
     */
    @PostMapping("/{id}/tomar")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> tomarPedido(
            @PathVariable String id,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User usuario = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Pedido pedido = pedidoService.tomarPedido(
                    id,
                    usuario.getId(),
                    usuario.getUsername()
            );
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener mis entregas (USER)
     */
    @GetMapping("/mis-entregas")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> obtenerMisEntregas(Authentication authentication) {
        try {
            String username = authentication.getName();
            User usuario = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            List<Pedido> pedidos = pedidoService.obtenerMisEntregas(usuario.getId());
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Actualizar estado de mi pedido (USER)
     */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable String id,
            @RequestBody ActualizarEstadoRequest request,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User usuario = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Pedido pedido = pedidoService.actualizarEstado(
                    id,
                    usuario.getId(),
                    request.getNuevoEstado()
            );
            return ResponseEntity.ok(pedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
