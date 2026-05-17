package com.althea.catalog.util;

import com.althea.shared.model.ProductImage;

import java.util.Base64;

/**
 * Résout les octets d'une image (champ {@code data} ou ancien {@code url} en base64 / data-URL).
 */
public final class ProductImagePayloadResolver {

    private ProductImagePayloadResolver() {
    }

    public record Resolved(byte[] data, String contentType) {
    }

    public static Resolved resolve(ProductImage img) {
        if (img.getData() != null && img.getData().length > 0) {
            String ct = img.getContentType() != null && !img.getContentType().isBlank()
                    ? img.getContentType().trim()
                    : "application/octet-stream";
            return new Resolved(img.getData(), ct);
        }
        if (img.getUrl() == null || img.getUrl().isBlank()) {
            return new Resolved(new byte[0], "application/octet-stream");
        }
        return decodeLegacy(img.getUrl(), img.getContentType());
    }

    private static Resolved decodeLegacy(String url, String fallbackContentType) {
        String u = url.trim();
        if (u.startsWith("data:")) {
            int comma = u.indexOf(',');
            if (comma <= 0) {
                return new Resolved(new byte[0], "application/octet-stream");
            }
            String meta = u.substring(5, comma);
            String base64 = u.substring(comma + 1);
            int semi = meta.indexOf(';');
            String ct = semi > 0 ? meta.substring(0, semi) : "image/png";
            if (meta.contains("base64")) {
                return new Resolved(Base64.getDecoder().decode(base64), ct);
            }
            return new Resolved(base64.getBytes(), ct);
        }
        byte[] bytes = Base64.getDecoder().decode(u);
        String ct = (fallbackContentType != null && !fallbackContentType.isBlank())
                ? fallbackContentType.trim()
                : "image/jpeg";
        return new Resolved(bytes, ct);
    }
}
