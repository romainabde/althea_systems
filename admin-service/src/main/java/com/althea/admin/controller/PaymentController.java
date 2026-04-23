package com.althea.admin.controller;

import com.althea.admin.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getById(@PathVariable Integer paymentId) {
        return ResponseEntity.ok(paymentService.findById(paymentId));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<?> refund(@PathVariable Integer paymentId) {
        return ResponseEntity.ok(paymentService.refund(paymentId));
    }
}
