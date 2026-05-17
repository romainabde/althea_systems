package com.althea.shared.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "CartItem",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"cartId", "productId"})
        }
)
@Data
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cartId", nullable = false)
    private Cart cart;

    @Column(nullable = false)
    private Integer productId;

    @Column(nullable = false)
    private Integer quantity;
}
