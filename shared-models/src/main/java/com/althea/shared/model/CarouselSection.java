package com.althea.shared.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "carousel_section")
@Data
public class CarouselSection {

    /**
     * Cible du bouton / lien du slide :<ul>
     * <li>{@code CUSTOM} — utiliser uniquement {@link #linkUrl} (comportement historique).</li>
     * <li>{@code CATEGORY} — {@link #targetCategoryId} renseigné ; {@link #linkUrl} peut être dérivé côté API (ex. /categories/{id}).</li>
     * <li>{@code PRODUCT} — {@link #targetProductId} renseigné ; {@link #linkUrl} peut être dérivé (ex. /products/{id}).</li>
     * </ul>
     */
    public static final String LINK_TARGET_CUSTOM = "CUSTOM";
    public static final String LINK_TARGET_CATEGORY = "CATEGORY";
    public static final String LINK_TARGET_PRODUCT = "PRODUCT";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "link_target_type", nullable = false, length = 32)
    private String linkTargetType = LINK_TARGET_CUSTOM;

    @Column(name = "target_category_id")
    private Integer targetCategoryId;

    @Column(name = "target_product_id")
    private Integer targetProductId;

    @Column(name = "display_order")
    private Integer displayOrder;

    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}