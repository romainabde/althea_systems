package com.althea.catalog.service;

import com.althea.catalog.dto.home.HomePageDto;
import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.model.CarouselSection;
import com.althea.catalog.model.Footer;
import com.althea.catalog.model.HomepageText;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HomeService {

    private final FooterService footerService;
    private final HomepageTextService homepageTextService;
    private final CarouselSectionService carouselSectionService;
    private final TopProductService topProductService;

    public HomeService(FooterService footerService, HomepageTextService homepageTextService, CarouselSectionService carouselSectionService, TopProductService topProductService) {
        this.footerService = footerService;
        this.homepageTextService = homepageTextService;
        this.carouselSectionService = carouselSectionService;
        this.topProductService = topProductService;
    }

    public HomePageDto getHomeData(){

        List<CarouselSection> carouselSections = carouselSectionService.getActiveSections();
        List<HomepageText> homepageTexts = homepageTextService.getActiveTexts();
        Footer footer = footerService.getActiveFooter();
        List<ProductWithImagesDto> topProductsDto = topProductService.getTopProducts();

        return new HomePageDto(
                carouselSections,
                homepageTexts,
                topProductsDto,
                footer
        );
    }
}
