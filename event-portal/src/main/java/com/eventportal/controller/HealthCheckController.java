// src/main/java/com/eventportal/controller/HealthCheckController.java
package com.eventportal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @GetMapping
    public String healthCheck() {
        return "Backend connected successfully | H2: http://localhost:8080/h2-console";
    }
}