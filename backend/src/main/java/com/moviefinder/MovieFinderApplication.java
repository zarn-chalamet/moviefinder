package com.moviefinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MovieFinderApplication {

    public static void main(String[] args) {
        SpringApplication.run(MovieFinderApplication.class, args);
        
        System.out.println("\n" +
            "╔══════════════════════════════════════════════════════════════╗\n" +
            "║                                                              ║\n" +
            "║   🎬 MovieFinder Backend Started Successfully!               ║\n" +
            "║                                                              ║\n" +
            "║   API:      http://localhost:8080/api/v1                     ║\n" +
            "║   Swagger:  http://localhost:8080/swagger-ui.html            ║\n" +
            "║   H2 DB:    http://localhost:8080/h2-console                 ║\n" +
            "║                                                              ║\n" +
            "╚══════════════════════════════════════════════════════════════╝\n"
        );
    }
}
