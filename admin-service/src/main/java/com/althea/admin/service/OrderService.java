package com.althea.admin.service;

import com.althea.admin.dto.common.OrderDetailDto;
import com.althea.admin.dto.common.OrderSummaryDto;
import com.althea.admin.dto.order.OrderSearchRequest;
import com.althea.admin.dto.order.OrderStatusUpdateRequest;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.OrderMapper;
import com.althea.admin.repository.OrderRepository;
import com.althea.admin.repository.PaymentRepository;
import com.althea.shared.model.Order;
import com.althea.shared.model.Payment;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "ACTIVE", "TERMINEE", "ANNULEE", "COMPLETED", "CANCELED", "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public List<OrderSummaryDto> findAll(OrderSearchRequest request) {
        Specification<Order> specification = buildSpecification(request);
        List<Order> orders = orderRepository.findAll(specification, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderMapper.toSummaryDto(orders);
    }

    @Transactional
    public OrderDetailDto findById(Integer id) {
        Order order = getOrderById(id);
        Payment payment = paymentRepository.findByOrderId(id).orElse(null);
        return orderMapper.toDetailDto(order, payment);
    }

    @Transactional
    public OrderDetailDto updateStatus(Integer id, OrderStatusUpdateRequest request) {
        Order order = getOrderById(id);

        String normalizedStatus = request.getStatus().toUpperCase();
        if (!ALLOWED_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Statut invalide. Valeurs autorisées: ACTIVE, TERMINEE, ANNULEE.");
        }

        order.setStatus(normalizedStatus);
        Payment payment = paymentRepository.findByOrderId(id).orElse(null);
        return orderMapper.toDetailDto(order, payment);
    }

    @Transactional
    public OrderDetailDto refund(Integer id) {
        Order order = getOrderById(id);

        Payment payment = paymentRepository.findByOrderId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun paiement trouvé pour la commande " + id));

        if ("REFUNDED".equalsIgnoreCase(payment.getStatus())) {
            throw new BadRequestException("Le paiement de cette commande est déjà remboursé.");
        }

        payment.setStatus("REFUNDED");
        payment.setRefundedAt(LocalDateTime.now());

        return orderMapper.toDetailDto(order, payment);
    }

    private Order getOrderById(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La commande " + id + " n'existe pas"));
    }

    private Specification<Order> buildSpecification(OrderSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), request.getUserId()));
            }

            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), request.getStatus().toUpperCase()));
            }

            if (request.getYear() != null) {
                LocalDateTime from = LocalDate.of(request.getYear(), 1, 1).atStartOfDay();
                LocalDateTime to = from.plusYears(1);
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
                predicates.add(cb.lessThan(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
