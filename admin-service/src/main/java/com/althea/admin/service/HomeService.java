package com.althea.admin.service;

import com.althea.admin.dto.home.*;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.CarouselSectionMapper;
import com.althea.admin.mapper.FooterMapper;
import com.althea.admin.mapper.HomepageTextMapper;
import com.althea.admin.mapper.TopProductMapper;
import com.althea.admin.repository.CarouselSectionRepository;
import com.althea.admin.repository.CategoryRepository;
import com.althea.admin.repository.FooterRepository;
import com.althea.admin.repository.ProductImageRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.admin.repository.TopProductRepository;
import com.althea.shared.model.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final CarouselSectionRepository carouselSectionRepository;
    private final CarouselSectionMapper carouselSectionMapper;
    private final CategoryRepository categoryRepository;
    private final com.althea.admin.repository.HomepageTextRepository homepageTextRepository;
    private final HomepageTextMapper homepageTextMapper;
    private final ProductRepository productRepository;
    private final TopProductMapper topProductMapper;
    private final TopProductRepository topProductRepository;
    private final FooterMapper footerMapper;
    private final FooterRepository footerRepository;
    private final ProductImageRepository productImageRepository;

    // Carousel

    public List<CarouselSection> findCarousel() {
        return carouselSectionRepository.findAll(
                Sort.by(Sort.Direction.ASC, "displayOrder")
        );
    }

    @Transactional
    public CarouselSection createCarouselSection(CarouselSectionCreateRequest request) {

        checkDisplayOrder(request.getDisplayOrder());

        CarouselSection carouselSection = carouselSectionMapper.toEntity(request);
        if (carouselSection.getImageUrl() != null && carouselSection.getImageUrl().isBlank()) {
            carouselSection.setImageUrl(null);
        }
        normalizeCarouselLinkFields(carouselSection);
        validateCarouselSectionForPersist(carouselSection);
        return carouselSectionRepository.save(carouselSection);
    }


    @Transactional
    public CarouselSection updateCarouselSection(Integer id, CarouselSectionUpdateRequest request) {
        
        CarouselSection existing = carouselSectionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("La section du carousel (id " + id + ") n'existe pas.")
        );

        if(request.getDisplayOrder() != null && !request.getDisplayOrder().equals(existing.getDisplayOrder())) {
            checkDisplayOrder(request.getDisplayOrder());
        }

        carouselSectionMapper.updateEntity(existing, request);

        normalizeCarouselLinkFields(existing);
        validateCarouselSectionForPersist(existing);

        return existing;
    }

    /**
     * Upload bannière carrousel (Mongo, comme catégorie / produit) ; met à jour {@code imageUrl} en {@code /images/{id}}.
     */
    @Transactional
    public CarouselSection uploadCarouselSectionImage(Integer id, MultipartFile file, String altText) {
        CarouselSection section = carouselSectionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("La section du carousel (id " + id + ") n'existe pas.")
        );

        deleteCarouselMongoImage(section);

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fichier image vide ou manquant.");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }
        if (!contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new BadRequestException("Le fichier doit être une image (Content-Type: image/*).");
        }

        final byte[] data;
        try {
            data = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Impossible de lire le fichier image.");
        }
        if (data.length == 0) {
            throw new BadRequestException("Fichier image vide.");
        }

        ProductImage image = ProductImage.builder()
                .productId(null)
                .categoryId(null)
                .carouselSectionId(section.getId())
                .altText(altText != null ? altText.trim() : section.getTitle())
                .contentType(contentType.trim())
                .data(data)
                .build();

        ProductImage saved = productImageRepository.save(image);
        saved.setUrl("/images/" + saved.getId());
        productImageRepository.save(saved);

        section.setImageUrl(saved.getUrl());
        return section;
    }

    @Transactional
    public CarouselSection deleteCarouselUploadedImage(Integer id) {
        CarouselSection section = carouselSectionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("La section du carousel (id " + id + ") n'existe pas.")
        );
        deleteCarouselMongoImage(section);
        section.setImageUrl(null);
        return carouselSectionRepository.save(section);
    }

    private void deleteCarouselMongoImage(CarouselSection section) {
        String imageUrl = section.getImageUrl();
        if (imageUrl == null || !imageUrl.startsWith("/images/")) {
            return;
        }
        String mongoId = imageUrl.substring("/images/".length());
        if (mongoId.isBlank()) {
            return;
        }

        Optional<ProductImage> blob = productImageRepository.findByIdAndCarouselSectionId(mongoId, section.getId())
                .or(() -> productImageRepository.findById(mongoId)
                        .filter(img -> img.getCarouselSectionId() != null
                                && img.getCarouselSectionId().equals(section.getId())));

        blob.ifPresent(productImageRepository::delete);
    }

    @Transactional
    public void deleteCarouselSection(Integer id) {
        CarouselSection existing = carouselSectionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("La section du carousel (id " + id + ") n'existe pas.")
        );

        deleteCarouselMongoImage(existing);
        carouselSectionRepository.delete(existing);
    }

    private void checkDisplayOrder(Integer displayOrder) {
        CarouselSection existingWithSameDisplayOrder = carouselSectionRepository.findByDisplayOrder(displayOrder);
        if(existingWithSameDisplayOrder != null){
            throw new BadRequestException("L'ordre d'affichage doit être unique.");
        }
    }

    /** Normalise linkTargetType (défaut CUSTOM, majuscules). */
    private void normalizeCarouselLinkFields(CarouselSection e) {
        if (e.getLinkTargetType() == null || e.getLinkTargetType().isBlank()) {
            e.setLinkTargetType(CarouselSection.LINK_TARGET_CUSTOM);
        } else {
            e.setLinkTargetType(e.getLinkTargetType().trim().toUpperCase());
        }
    }

    /**
     * Vérifie la cohérence après création ou fusion PATCH : CUSTOM → linkUrl obligatoire ;
     * CATEGORY / PRODUCT → id obligatoire et ressource existante ; nettoie les champs hors mode.
     */
    private void validateCarouselSectionForPersist(CarouselSection e) {
        String type = e.getLinkTargetType();
        switch (type) {
            case CarouselSection.LINK_TARGET_CUSTOM -> {
                if (e.getLinkUrl() == null || e.getLinkUrl().isBlank()) {
                    throw new BadRequestException(
                            "Pour linkTargetType CUSTOM, linkUrl est obligatoire.");
                }
                e.setLinkUrl(e.getLinkUrl().trim());
                e.setTargetCategoryId(null);
                e.setTargetProductId(null);
            }
            case CarouselSection.LINK_TARGET_CATEGORY -> {
                if (e.getTargetCategoryId() == null) {
                    throw new BadRequestException(
                            "Pour linkTargetType CATEGORY, targetCategoryId est obligatoire.");
                }
                categoryRepository.findById(e.getTargetCategoryId())
                        .orElseThrow(() -> new BadRequestException(
                                "Catégorie inexistante : id " + e.getTargetCategoryId()));
                e.setTargetProductId(null);
                if (e.getLinkUrl() != null && !e.getLinkUrl().isBlank()) {
                    e.setLinkUrl(e.getLinkUrl().trim());
                }
            }
            case CarouselSection.LINK_TARGET_PRODUCT -> {
                if (e.getTargetProductId() == null) {
                    throw new BadRequestException(
                            "Pour linkTargetType PRODUCT, targetProductId est obligatoire.");
                }
                productRepository.findById(e.getTargetProductId())
                        .orElseThrow(() -> new BadRequestException(
                                "Produit inexistant : id " + e.getTargetProductId()));
                e.setTargetCategoryId(null);
                if (e.getLinkUrl() != null && !e.getLinkUrl().isBlank()) {
                    e.setLinkUrl(e.getLinkUrl().trim());
                }
            }
            default -> throw new BadRequestException(
                    "linkTargetType invalide : " + type + " (attendu CUSTOM, CATEGORY ou PRODUCT).");
        }
    }

    // HomePageText
    public HomepageText getHomepageText() {
        return homepageTextRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    HomepageText empty = new HomepageText();
                    empty.setContent("");
                    empty.setActive(true);
                    return empty;
                });
    }

    @Transactional
    public HomepageText updateHomepageText(HomepageTextUpdateRequest request) {
        HomepageText entity = homepageTextRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(HomepageText::new);

        boolean isNew = entity.getId() == null;
        homepageTextMapper.updateEntity(entity, request);

        if (isNew) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        return homepageTextRepository.save(entity);
    }

    // Top Products
    public List<TopProduct> getTopProducts() {
        return topProductRepository.findAllByActiveTrueOrderByDisplayOrderAsc();
    }

    @Transactional
    public TopProduct addTopProduct(TopProductRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Le produit n'existe pas"));

        TopProduct topProduct = topProductMapper.toEntity(request);
        topProduct.setProduct(product);

        return topProductRepository.save(topProduct);
    }

    @Transactional
    public void removeTopProduct(Integer id) {

        TopProduct existing = topProductRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Le top produit n'existe pas"));

        topProductRepository.delete(existing);
    }

    // Footer
    public Footer getFooter() {
        return footerRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    Footer empty = new Footer();
                    empty.setContent("");
                    empty.setActive(true);
                    return empty;
                });
    }

    @Transactional
    public Footer updateFooter(FooterUpdateRequest request) {
        Footer footer = footerRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(Footer::new);

        boolean isNew = footer.getId() == null;
        footerMapper.updateEntity(footer, request);

        if (isNew) {
            footer.setCreatedAt(LocalDateTime.now());
        }
        footer.setUpdatedAt(LocalDateTime.now());

        return footerRepository.save(footer);
    }
}