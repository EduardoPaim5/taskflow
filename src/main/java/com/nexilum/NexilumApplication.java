package com.nexilum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NexilumApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexilumApplication.class, args);
    }
}
