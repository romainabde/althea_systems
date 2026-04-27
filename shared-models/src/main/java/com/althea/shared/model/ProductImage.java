package com.althea.shared.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.FieldType;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

/**
 * Métadonnées + binaire image (MongoDB). Préférer {@link #data} + {@link #contentType}.
 * L'ancien champ {@link #url} pouvait contenir du base64 ou une data-URL (rétrocompatibilité lecture).
 */
@Document(collection = "images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImage {
    @MongoId(FieldType.OBJECT_ID)
    private String id;

    private Integer productId;

    /**
     * @deprecated Données déplacées dans {@link #data}. Conservé pour les documents déjà en base.
     */
    @JsonIgnore
    private String url;

    private String altText;

    /** Contenu binaire de l'image (ex. PNG, JPEG). */
    @JsonIgnore
    private byte[] data;

    /** Type MIME, ex. image/jpeg, image/png. */
    private String contentType;
}
