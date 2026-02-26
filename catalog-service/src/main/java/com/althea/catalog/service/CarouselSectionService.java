package com.althea.catalog.service;

import com.althea.catalog.model.CarouselSection;
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
        return findActiveSections();
    }

    // PROTECTED

    // Rechercher les sections actives
    protected List<CarouselSection> findActiveSections() {
        return repository.findByActiveTrueOrderByDisplayOrderAsc();
    }
}