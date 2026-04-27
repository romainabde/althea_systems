package com.althea.admin.dto.product;

import jakarta.validation.constraints.AssertTrue;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageCreateRequest {

    /**
     * Image encodée en base64 (éventuellement au format data-URL {@code data:image/png;base64,...}).
     * Sinon renseigner {@link #url} (ancien champ unique base64) pour rétrocompatibilité.
     */
    private String dataBase64;

    /**
     * @deprecated Remplacé par {@link #dataBase64} + {@link #contentType}. Contenu base64 pur ou data-URL.
     */
    private String url;

    /** Type MIME, ex. image/jpeg, image/png. */
    private String contentType;

    private String altText;

    @AssertTrue(message = "Fournir dataBase64 (ou url pour l'ancien format) et un contentType.")
    public boolean isPayloadValid() {
        boolean hasPayload = (dataBase64 != null && !dataBase64.isBlank())
                || (url != null && !url.isBlank());
        boolean hasCt = contentType != null && !contentType.isBlank();
        return hasPayload && hasCt;
    }
}
