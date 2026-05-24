package com.althea.catalog.service;

import com.althea.shared.model.CarouselSection;
import com.althea.catalog.repository.CarouselSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarouselSectionService {

    private final CarouselSectionRepository repository;

    // PUBLIC

    // Récupérer toutes les sections actives triées
    public List<CarouselSection> getActiveSections() {
        List<CarouselSection> sections = findActiveSections();
        for (CarouselSection section : sections) {
            applyDerivedLinkUrlIfNeeded(section);
        }
        return sections;
    }

    // PROTECTED

    // Rechercher les sections actives
    protected List<CarouselSection> findActiveSections() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    /**
     * Si le slide cible une catégorie ou un produit sans {@code linkUrl} explicite,
     * renseigne l'URL attendue par le front vitrine ({@code /categories/{id}}, {@code /products/{id}}).
     * Ne modifie pas la base : exécuté sur des entités détachées après la lecture repository.
     */
    private void applyDerivedLinkUrlIfNeeded(CarouselSection section) {
        if (section.getLinkUrl() != null && !section.getLinkUrl().isBlank()) {
            return;
        }
        String type = section.getLinkTargetType();
        if (type == null || type.isBlank()) {
            type = CarouselSection.LINK_TARGET_CUSTOM;
        } else {
            type = type.trim().toUpperCase();
        }
        if (CarouselSection.LINK_TARGET_CATEGORY.equals(type)
                && section.getTargetCategoryId() != null) {
            section.setLinkUrl("/categories/" + section.getTargetCategoryId());
        } else if (CarouselSection.LINK_TARGET_PRODUCT.equals(type)
                && section.getTargetProductId() != null) {
            section.setLinkUrl("/products/" + section.getTargetProductId());
        }
    }
}