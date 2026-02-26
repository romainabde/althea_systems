package com.althea.catalog.service;

import com.althea.catalog.model.HomepageText;
import com.althea.catalog.repository.HomepageTextRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HomepageTextService {

    private final HomepageTextRepository repository;

    // PUBLIC

    // Récupérer tous les textes actifs
    public List<HomepageText> getActiveTexts() {
        return findActiveTexts();
    }

    // PROTECTED
    protected List<HomepageText> findActiveTexts() {
        return repository.findByActiveTrue();
    }
}