package com.althea.shared.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "product_image")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @Id
    private String id;

    /** Catalogue produit ; null pour une image de catégorie */
    private Integer productId;

    /** Image unique catégorie ; null pour une image produit */
    private Integer categoryId;

    /** Image bannière carrousel page d'accueil ; null sinon */
    private Integer carouselSectionId;

    private String url;
    private String altText;
    private String contentType;

    /** Stocké dans Mongo ; non sérialisé en JSON HTTP (réponses API légères). */
    @JsonIgnore
    private byte[] data;
}
