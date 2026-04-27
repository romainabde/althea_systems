package com.althea.shared.dto;

import com.althea.shared.model.ProductImage;

/**
 * Image produit exposée au front : pas de binaire dans le JSON, seulement un chemin vers
 * {@code GET /images/{id}} sur le catalog-service.
 */
public record ProductImageView(
        String id,
        String altText,
        String contentType,
        /** Chemin relatif (à préfixer avec l'URL du catalog), ex. /images/abc */
        String src) {

    public static String rawPath(String imageId) {
        return "/images/" + imageId;
    }

    /**
     * Vue API à partir de l'entité Mongo (héritage {@code url} base64 supporté pour l'affichage des métadonnées).
     */
    public static ProductImageView fromEntity(ProductImage img) {
        String alt = img.getAltText() != null ? img.getAltText() : "";
        String ct = resolveContentTypeHint(img);
        return new ProductImageView(
                img.getId(),
                alt,
                ct,
                rawPath(img.getId()));
    }

    private static String resolveContentTypeHint(ProductImage img) {
        if (img.getContentType() != null && !img.getContentType().isBlank()) {
            return img.getContentType().trim();
        }
        String legacy = img.getUrl();
        if (legacy != null && legacy.startsWith("data:")) {
            int semi = legacy.indexOf(';');
            if (semi > 5) {
                return legacy.substring(5, semi);
            }
        }
        return "image/jpeg";
    }
}
