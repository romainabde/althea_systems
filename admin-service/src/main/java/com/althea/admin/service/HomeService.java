package com.althea.admin.service;

import com.althea.admin.dto.home.*;
import com.althea.admin.exception.BadRequestException;
import com.althea.admin.exception.ResourceNotFoundException;
import com.althea.admin.mapper.CarouselSectionMapper;
import com.althea.admin.mapper.FooterMapper;
import com.althea.admin.mapper.HomepageTextMapper;
import com.althea.admin.mapper.TopProductMapper;
import com.althea.admin.repository.CarouselSectionRepository;
import com.althea.admin.repository.FooterRepository;
import com.althea.admin.repository.ProductRepository;
import com.althea.admin.repository.TopProductRepository;
import com.althea.shared.model.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final CarouselSectionRepository carouselSectionRepository;
    private final CarouselSectionMapper carouselSectionMapper;
    private final com.althea.admin.repository.HomepageTextRepository homepageTextRepository;
    private final HomepageTextMapper homepageTextMapper;
    private final ProductRepository productRepository;
    private final TopProductMapper topProductMapper;
    private final TopProductRepository topProductRepository;
    private final FooterMapper footerMapper;
    private final FooterRepository footerRepository;

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

        return existing;
    }

    @Transactional
    public void deleteCarouselSection(Integer id) {
        CarouselSection existing = carouselSectionRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("La section du carousel (id " + id + ") n'existe pas.")
        );

        carouselSectionRepository.delete(existing);
    }

    private void checkDisplayOrder(Integer displayOrder) {
        CarouselSection existingWithSameDisplayOrder = carouselSectionRepository.findByDisplayOrder(displayOrder);
        if(existingWithSameDisplayOrder != null){
            throw new BadRequestException("L'ordre d'affichage doit être unique.");
        }
    }

    // HomePageText
    public HomepageText getHomepageText() {
        return homepageTextRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new ResourceNotFoundException("HomepageText introuvable"));
    }

    @Transactional
    public HomepageText updateHomepageText(HomepageTextUpdateRequest request) {

        HomepageText entity = getHomepageText();

        homepageTextMapper.updateEntity(entity, request);

        return entity;
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
                .orElseThrow(() -> new ResourceNotFoundException("Footer introuvable"));
    }

    @Transactional
    public Footer updateFooter(FooterUpdateRequest request) {
        Footer footer = getFooter();
        footerMapper.updateEntity(footer, request);
        return footer;
    }
}