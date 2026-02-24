package com.nexilum.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexilum.dto.request.LoginRequest;
import com.nexilum.dto.request.RegisterRequest;
import com.nexilum.dto.response.ApiResponse;
import com.nexilum.dto.response.AuthResponse;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Base class for integration tests using Testcontainers with PostgreSQL.
 * Uses JDBC URL-based container management for simplicity.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    private static final AtomicInteger USER_COUNTER = new AtomicInteger(0);

    @LocalServerPort
    protected int port;

    @Autowired
    protected TestRestTemplate restTemplate;

    @Autowired
    protected ObjectMapper objectMapper;

    protected String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";
    }

    // ============ Helper Methods ============

    /**
     * Creates HTTP headers with JSON content type
     */
    protected HttpHeaders createJsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /**
     * Creates HTTP headers with JSON content type and Authorization token
     */
    protected HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = createJsonHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    /**
     * Generates a unique test email to avoid conflicts between tests
     */
    protected String generateUniqueEmail() {
        return "testuser" + USER_COUNTER.incrementAndGet() + "@test.com";
    }

    /**
     * Registers a new user and returns the AuthResponse
     */
    protected AuthResponse registerUser(String name, String email, String password) {
        RegisterRequest request = RegisterRequest.builder()
                .name(name)
                .email(email)
                .password(password)
                .build();

        HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/register",
                entity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            return extractAuthResponse(response.getBody());
        }
        return null;
    }

    /**
     * Registers a new user with unique email and returns the access token
     */
    protected String registerAndGetToken(String name, String password) {
        String email = generateUniqueEmail();
        AuthResponse authResponse = registerUser(name, email, password);
        return authResponse != null ? authResponse.getAccessToken() : null;
    }

    /**
     * Logs in a user and returns the AuthResponse
     */
    protected AuthResponse login(String email, String password) {
        LoginRequest request = LoginRequest.builder()
                .email(email)
                .password(password)
                .build();

        HttpEntity<LoginRequest> entity = new HttpEntity<>(request, createJsonHeaders());

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/auth/login",
                entity,
                String.class
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            return extractAuthResponse(response.getBody());
        }
        return null;
    }

    /**
     * Extracts AuthResponse from JSON response string
     */
    @SuppressWarnings("unchecked")
    protected AuthResponse extractAuthResponse(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse, 
                    new TypeReference<Map<String, Object>>() {});
            
            Map<String, Object> data = (Map<String, Object>) responseMap.get("data");
            if (data == null) return null;

            Map<String, Object> userMap = (Map<String, Object>) data.get("user");

            return AuthResponse.builder()
                    .accessToken((String) data.get("accessToken"))
                    .refreshToken((String) data.get("refreshToken"))
                    .tokenType((String) data.get("tokenType"))
                    .expiresIn(data.get("expiresIn") != null ? 
                            ((Number) data.get("expiresIn")).longValue() : null)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse auth response", e);
        }
    }

    /**
     * Extracts the 'data' field from an ApiResponse JSON
     */
    @SuppressWarnings("unchecked")
    protected <T> T extractData(String jsonResponse, Class<T> clazz) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse,
                    new TypeReference<Map<String, Object>>() {});
            Object data = responseMap.get("data");
            return objectMapper.convertValue(data, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract data from response", e);
        }
    }

    /**
     * Extracts 'success' field from ApiResponse
     */
    protected boolean isSuccessResponse(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse,
                    new TypeReference<Map<String, Object>>() {});
            return Boolean.TRUE.equals(responseMap.get("success"));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extracts 'message' field from ApiResponse
     */
    protected String extractMessage(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse,
                    new TypeReference<Map<String, Object>>() {});
            return (String) responseMap.get("message");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Performs a GET request with authentication
     */
    protected ResponseEntity<String> getWithAuth(String url, String token) {
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));
        return restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
    }

    /**
     * Performs a POST request with authentication
     */
    protected <T> ResponseEntity<String> postWithAuth(String url, T body, String token) {
        HttpEntity<T> entity = new HttpEntity<>(body, createAuthHeaders(token));
        return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    /**
     * Performs a PUT request with authentication
     */
    protected <T> ResponseEntity<String> putWithAuth(String url, T body, String token) {
        HttpEntity<T> entity = new HttpEntity<>(body, createAuthHeaders(token));
        return restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }

    /**
     * Performs a DELETE request with authentication
     */
    protected ResponseEntity<String> deleteWithAuth(String url, String token) {
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));
        return restTemplate.exchange(url, HttpMethod.DELETE, entity, String.class);
    }

    /**
     * Performs a PATCH request with authentication
     */
    protected <T> ResponseEntity<String> patchWithAuth(String url, T body, String token) {
        HttpEntity<T> entity = new HttpEntity<>(body, createAuthHeaders(token));
        return restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
    }
}
