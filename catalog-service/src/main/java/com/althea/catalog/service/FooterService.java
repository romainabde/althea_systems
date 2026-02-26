package com.althea.catalog.service;

import com.althea.catalog.model.Footer;
import com.althea.catalog.repository.FooterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FooterService {

    private final FooterRepository repository;

    // PUBLIC

    // Récupérer le footer actif
    public Footer getActiveFooter() {
        return findActiveFooter();
    }

    // PROTECTED
    protected Footer findActiveFooter() {
        return repository.findFirstByActiveTrue();
    }
}