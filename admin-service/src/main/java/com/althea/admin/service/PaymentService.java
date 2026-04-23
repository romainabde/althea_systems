package com.althea.admin.service;

import com.althea.admin.dto.common.PaymentDto;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.PaymentMapper;
import com.althea.admin.repository.PaymentRepository;
import com.althea.shared.model.Payment;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;

    public PaymentDto findById(Integer paymentId) {
        return paymentMapper.toDto(getPaymentById(paymentId));
    }

    @Transactional
    public PaymentDto refund(Integer paymentId) {
        Payment payment = getPaymentById(paymentId);

        if ("REFUNDED".equalsIgnoreCase(payment.getStatus())) {
            throw new BadRequestException("Ce paiement est déjà remboursé.");
        }

        payment.setStatus("REFUNDED");
        payment.setRefundedAt(LocalDateTime.now());

        return paymentMapper.toDto(payment);
    }

    private Payment getPaymentById(Integer paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Le paiement " + paymentId + " n'existe pas"));
    }
}
