package com.althea.admin.controller;

import com.althea.admin.dto.order.OrderSearchRequest;
import com.althea.admin.dto.order.OrderStatusUpdateRequest;
import com.althea.admin.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<?> getAll(@ModelAttribute OrderSearchRequest request) {
        return ResponseEntity.ok(orderService.findAll(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refund(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.refund(id));
    }
}
