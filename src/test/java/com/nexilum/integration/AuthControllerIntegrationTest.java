package com.nexilum.integration;

import com.nexilum.dto.request.LoginRequest;
import com.nexilum.dto.request.RegisterRequest;
import com.nexilum.dto.response.AuthResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AuthController endpoints.
 * Tests: register, login, refresh token, and current user.
 */
class AuthControllerIntegrationTest extends BaseIntegrationTest {

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("Should register a new user successfully")
        void shouldRegisterNewUser() {
            // Arrange
            String email = generateUniqueEmail();
            RegisterRequest request = RegisterRequest.builder()
                    .name("Test User")
                    .email(email)
                    .password("Test@123")
                    .build();

            HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/register",
                    entity,
                    String.class
            );

            // Assert - API returns 201 CREATED for new user registration
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertTrue(isSuccessResponse(response.getBody()));

            AuthResponse authResponse = extractAuthResponse(response.getBody());
            assertNotNull(authResponse.getAccessToken());
            assertNotNull(authResponse.getRefreshToken());
            assertEquals("Bearer", authResponse.getTokenType());
        }

        @Test
        @DisplayName("Should reject registration with duplicate email")
        void shouldRejectDuplicateEmail() {
            // Arrange - Register first user
            String email = generateUniqueEmail();
            registerUser("First User", email, "Test@123");

            // Try to register with same email
            RegisterRequest request = RegisterRequest.builder()
                    .name("Second User")
                    .email(email)
                    .password("Test@456")
                    .build();

            HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/register",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertFalse(isSuccessResponse(response.getBody()));
        }

        @Test
        @DisplayName("Should reject registration with invalid email format")
        void shouldRejectInvalidEmail() {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                    .name("Test User")
                    .email("invalid-email")
                    .password("Test@123")
                    .build();

            HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/register",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        @DisplayName("Should reject registration with short password")
        void shouldRejectShortPassword() {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                    .name("Test User")
                    .email(generateUniqueEmail())
                    .password("12345")  // Less than 6 characters
                    .build();

            HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/register",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        @DisplayName("Should reject registration with blank name")
        void shouldRejectBlankName() {
            // Arrange
            RegisterRequest request = RegisterRequest.builder()
                    .name("")
                    .email(generateUniqueEmail())
                    .password("Test@123")
                    .build();

            HttpEntity<RegisterRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/register",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/login")
    class LoginTests {

        @Test
        @DisplayName("Should login with valid credentials")
        void shouldLoginWithValidCredentials() {
            // Arrange - Register user first
            String email = generateUniqueEmail();
            String password = "Test@123";
            registerUser("Login Test User", email, password);

            LoginRequest request = LoginRequest.builder()
                    .email(email)
                    .password(password)
                    .build();

            HttpEntity<LoginRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/login",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(isSuccessResponse(response.getBody()));

            AuthResponse authResponse = extractAuthResponse(response.getBody());
            assertNotNull(authResponse.getAccessToken());
            assertNotNull(authResponse.getRefreshToken());
        }

        @Test
        @DisplayName("Should reject login with wrong password")
        void shouldRejectWrongPassword() {
            // Arrange - Register user first
            String email = generateUniqueEmail();
            registerUser("Wrong Pass User", email, "CorrectPassword123");

            LoginRequest request = LoginRequest.builder()
                    .email(email)
                    .password("WrongPassword456")
                    .build();

            HttpEntity<LoginRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/login",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        }

        @Test
        @DisplayName("Should reject login with non-existent email")
        void shouldRejectNonExistentEmail() {
            // Arrange
            LoginRequest request = LoginRequest.builder()
                    .email("nonexistent@test.com")
                    .password("Test@123")
                    .build();

            HttpEntity<LoginRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/login",
                    entity,
                    String.class
            );

            // Assert
            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("POST /api/auth/refresh")
    class RefreshTokenTests {

        @Test
        @DisplayName("Should refresh token with valid refresh token")
        void shouldRefreshToken() {
            // Arrange - Register and get tokens
            String email = generateUniqueEmail();
            AuthResponse authResponse = registerUser("Refresh Test User", email, "Test@123");
            String refreshToken = authResponse.getRefreshToken();

            // API expects raw refresh token string as body
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            HttpEntity<String> entity = new HttpEntity<>(refreshToken, headers);

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/refresh",
                    entity,
                    String.class
            );

            // Assert
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertTrue(isSuccessResponse(response.getBody()));

            AuthResponse newAuthResponse = extractAuthResponse(response.getBody());
            assertNotNull(newAuthResponse.getAccessToken());
        }

        @Test
        @DisplayName("Should reject refresh with invalid token")
        void shouldRejectInvalidRefreshToken() {
            // Arrange - API expects raw refresh token string as body
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            HttpEntity<String> entity = new HttpEntity<>("invalid-refresh-token", headers);

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/auth/refresh",
                    entity,
                    String.class
            );

            // Assert - Should return 4xx or 5xx error for invalid token
            assertFalse(response.getStatusCode().is2xxSuccessful());
        }
    }

    @Nested
    @DisplayName("GET /api/auth/me")
    class CurrentUserTests {

        @Test
        @DisplayName("Should return current user with valid token")
        void shouldReturnCurrentUser() {
            // Arrange - Register and get token
            String email = generateUniqueEmail();
            AuthResponse authResponse = registerUser("Current User Test", email, "Test@123");
            String token = authResponse.getAccessToken();

            // Act
            ResponseEntity<String> response = getWithAuth(baseUrl + "/auth/me", token);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(isSuccessResponse(response.getBody()));
            assertTrue(response.getBody().contains(email));
        }

        @Test
        @DisplayName("Should reject request without token")
        void shouldRejectWithoutToken() {
            // Act
            ResponseEntity<String> response = restTemplate.getForEntity(
                    baseUrl + "/auth/me",
                    String.class
            );

            // Assert - Should not return 2xx success
            assertFalse(response.getStatusCode().is2xxSuccessful());
        }

        @Test
        @DisplayName("Should reject request with invalid token")
        void shouldRejectInvalidToken() {
            // Act
            ResponseEntity<String> response = getWithAuth(baseUrl + "/auth/me", "invalid-token");

            // Assert - Should not return 2xx success
            assertFalse(response.getStatusCode().is2xxSuccessful());
        }
    }
}
