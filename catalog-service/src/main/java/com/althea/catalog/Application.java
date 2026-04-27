package com.althea.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EntityScan(basePackages = {
        "com.althea.catalog",
        "com.althea.shared.model"
})
@EnableJpaRepositories(basePackages = "com.althea.catalog.repository")
@EnableMongoRepositories(basePackages = "com.althea.catalog.repository")
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

}
