package com.althea.catalog.dto.home;

import com.althea.catalog.dto.product.ProductWithImagesDto;
import com.althea.catalog.model.CarouselSection;
import com.althea.catalog.model.Footer;
import com.althea.catalog.model.HomepageText;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class HomePageDto {
    private List<CarouselSection> carouselSections;
    private List<HomepageText> homepageTexts;
    private List<ProductWithImagesDto> topProducts;
    private Footer footer;
}