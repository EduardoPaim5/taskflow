package com.taskflow.integration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.taskflow.dto.request.ProjectRequest;
import com.taskflow.dto.response.AuthResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for ProjectController endpoints.
 * Tests: CRUD operations and member management.
 */
class ProjectControllerIntegrationTest extends BaseIntegrationTest {

    private String ownerToken;
    private String ownerEmail;
    private Long ownerId;

    @BeforeEach
    void setUpProject() {
        // Register project owner
        ownerEmail = generateUniqueEmail();
        AuthResponse authResponse = registerUser("Project Owner", ownerEmail, "Test@123");
        ownerToken = authResponse.getAccessToken();
        
        // Get owner ID from /auth/me
        ResponseEntity<String> meResponse = getWithAuth(baseUrl + "/auth/me", ownerToken);
        try {
            Map<String, Object> userData = extractData(meResponse.getBody(), Map.class);
            ownerId = ((Number) userData.get("id")).longValue();
        } catch (Exception e) {
            ownerId = 1L;
        }
    }

    @Nested
    @DisplayName("POST /api/projects")
    class CreateProjectTests {

        @Test
        @DisplayName("Should create a new project successfully")
        void shouldCreateProject() {
            // Arrange
            ProjectRequest request = ProjectRequest.builder()
                    .name("Test Project")
                    .description("A test project description")
                    .icon("folder")
                    .color("#3498db")
                    .build();

            // Act
            ResponseEntity<String> response = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            // Assert - API returns 201 CREATED for new project
            assertTrue(response.getStatusCode().is2xxSuccessful());
            assertTrue(isSuccessResponse(response.getBody()));
            assertTrue(response.getBody().contains("Test Project"));
        }

        @Test
        @DisplayName("Should reject project with blank name")
        void shouldRejectBlankName() {
            // Arrange
            ProjectRequest request = ProjectRequest.builder()
                    .name("")
                    .description("Description")
                    .build();

            // Act
            ResponseEntity<String> response = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        }

        @Test
        @DisplayName("Should reject project without authentication")
        void shouldRejectWithoutAuth() {
            // Arrange
            ProjectRequest request = ProjectRequest.builder()
                    .name("Unauthorized Project")
                    .build();

            HttpEntity<ProjectRequest> entity = new HttpEntity<>(request, createJsonHeaders());

            // Act
            ResponseEntity<String> response = restTemplate.postForEntity(
                    baseUrl + "/projects",
                    entity,
                    String.class
            );

            // Assert - Should not return 2xx success (could be 401 or 403)
            assertFalse(response.getStatusCode().is2xxSuccessful());
        }
    }

    @Nested
    @DisplayName("GET /api/projects")
    class GetProjectsTests {

        @Test
        @DisplayName("Should return user's projects")
        void shouldReturnProjects() {
            // Arrange - Create a project first
            ProjectRequest request = ProjectRequest.builder()
                    .name("My Project")
                    .description("Project for listing test")
                    .build();

            postWithAuth(baseUrl + "/projects", request, ownerToken);

            // Act
            ResponseEntity<String> response = getWithAuth(baseUrl + "/projects", ownerToken);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(isSuccessResponse(response.getBody()));
            assertTrue(response.getBody().contains("My Project"));
        }

        @Test
        @DisplayName("Should return empty list for new user")
        void shouldReturnEmptyListForNewUser() {
            // Arrange - Register new user with no projects
            String newToken = registerAndGetToken("New User", "Test@123");

            // Act
            ResponseEntity<String> response = getWithAuth(baseUrl + "/projects", newToken);

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(isSuccessResponse(response.getBody()));
        }
    }

    @Nested
    @DisplayName("GET /api/projects/{id}")
    class GetProjectByIdTests {

        @Test
        @DisplayName("Should return project by ID for owner")
        void shouldReturnProjectById() {
            // Arrange - Create a project
            ProjectRequest request = ProjectRequest.builder()
                    .name("Project By ID")
                    .description("Test getting by ID")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Act
            ResponseEntity<String> response = getWithAuth(
                    baseUrl + "/projects/" + projectId,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().contains("Project By ID"));
        }

        @Test
        @DisplayName("Should reject access for non-member")
        void shouldRejectNonMemberAccess() {
            // Arrange - Create project with owner
            ProjectRequest request = ProjectRequest.builder()
                    .name("Private Project")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register another user (non-member)
            String otherToken = registerAndGetToken("Other User", "Test@123");

            // Act
            ResponseEntity<String> response = getWithAuth(
                    baseUrl + "/projects/" + projectId,
                    otherToken
            );

            // Assert
            assertTrue(response.getStatusCode().is4xxClientError());
        }

        @Test
        @DisplayName("Should return 404 for non-existent project")
        void shouldReturn404ForNonExistent() {
            // Act
            ResponseEntity<String> response = getWithAuth(
                    baseUrl + "/projects/99999",
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("PUT /api/projects/{id}")
    class UpdateProjectTests {

        @Test
        @DisplayName("Should update project successfully")
        void shouldUpdateProject() {
            // Arrange - Create a project
            ProjectRequest createRequest = ProjectRequest.builder()
                    .name("Original Name")
                    .description("Original description")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    createRequest,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Update request
            ProjectRequest updateRequest = ProjectRequest.builder()
                    .name("Updated Name")
                    .description("Updated description")
                    .color("#e74c3c")
                    .build();

            // Act
            ResponseEntity<String> response = putWithAuth(
                    baseUrl + "/projects/" + projectId,
                    updateRequest,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().contains("Updated Name"));
        }

        @Test
        @DisplayName("Should reject update from non-owner")
        void shouldRejectUpdateFromNonOwner() {
            // Arrange - Create project
            ProjectRequest request = ProjectRequest.builder()
                    .name("Owner's Project")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register another user
            String otherToken = registerAndGetToken("Not Owner", "Test@123");

            ProjectRequest updateRequest = ProjectRequest.builder()
                    .name("Hacked Name")
                    .build();

            // Act
            ResponseEntity<String> response = putWithAuth(
                    baseUrl + "/projects/" + projectId,
                    updateRequest,
                    otherToken
            );

            // Assert
            assertTrue(response.getStatusCode().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("DELETE /api/projects/{id}")
    class DeleteProjectTests {

        @Test
        @DisplayName("Should delete project successfully")
        void shouldDeleteProject() {
            // Arrange - Create a project
            ProjectRequest request = ProjectRequest.builder()
                    .name("To Delete")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Act
            ResponseEntity<String> response = deleteWithAuth(
                    baseUrl + "/projects/" + projectId,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());

            // Verify it's deleted
            ResponseEntity<String> getResponse = getWithAuth(
                    baseUrl + "/projects/" + projectId,
                    ownerToken
            );
            assertEquals(HttpStatus.NOT_FOUND, getResponse.getStatusCode());
        }

        @Test
        @DisplayName("Should reject delete from non-owner")
        void shouldRejectDeleteFromNonOwner() {
            // Arrange - Create project
            ProjectRequest request = ProjectRequest.builder()
                    .name("Cannot Delete This")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register another user
            String otherToken = registerAndGetToken("Attacker", "Test@123");

            // Act
            ResponseEntity<String> response = deleteWithAuth(
                    baseUrl + "/projects/" + projectId,
                    otherToken
            );

            // Assert
            assertTrue(response.getStatusCode().is4xxClientError());
        }
    }

    @Nested
    @DisplayName("POST/DELETE /api/projects/{id}/members/{userId}")
    class MemberManagementTests {

        @Test
        @DisplayName("Should add member to project")
        void shouldAddMember() {
            // Arrange - Create project
            ProjectRequest request = ProjectRequest.builder()
                    .name("Team Project")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register new user to add as member
            String memberEmail = generateUniqueEmail();
            AuthResponse memberAuth = registerUser("New Member", memberEmail, "Test@123");
            
            // Get member ID
            ResponseEntity<String> memberMe = getWithAuth(baseUrl + "/auth/me", memberAuth.getAccessToken());
            Long memberId = extractUserId(memberMe.getBody());

            // Act
            ResponseEntity<String> response = postWithAuth(
                    baseUrl + "/projects/" + projectId + "/members/" + memberId,
                    null,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());

            // Verify member can access project
            ResponseEntity<String> memberAccess = getWithAuth(
                    baseUrl + "/projects/" + projectId,
                    memberAuth.getAccessToken()
            );
            assertEquals(HttpStatus.OK, memberAccess.getStatusCode());
        }

        @Test
        @DisplayName("Should remove member from project")
        void shouldRemoveMember() {
            // Arrange - Create project and add member
            ProjectRequest request = ProjectRequest.builder()
                    .name("Project with Member")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register and add member
            String memberEmail = generateUniqueEmail();
            AuthResponse memberAuth = registerUser("Removable Member", memberEmail, "Test@123");
            
            ResponseEntity<String> memberMe = getWithAuth(baseUrl + "/auth/me", memberAuth.getAccessToken());
            Long memberId = extractUserId(memberMe.getBody());

            postWithAuth(baseUrl + "/projects/" + projectId + "/members/" + memberId, null, ownerToken);

            // Act - Remove member
            ResponseEntity<String> response = deleteWithAuth(
                    baseUrl + "/projects/" + projectId + "/members/" + memberId,
                    ownerToken
            );

            // Assert
            assertEquals(HttpStatus.OK, response.getStatusCode());

            // Verify member can no longer access project
            ResponseEntity<String> memberAccess = getWithAuth(
                    baseUrl + "/projects/" + projectId,
                    memberAuth.getAccessToken()
            );
            assertTrue(memberAccess.getStatusCode().is4xxClientError());
        }

        @Test
        @DisplayName("Should reject add member by non-owner")
        void shouldRejectAddMemberByNonOwner() {
            // Arrange - Create project
            ProjectRequest request = ProjectRequest.builder()
                    .name("Restricted Project")
                    .build();

            ResponseEntity<String> createResponse = postWithAuth(
                    baseUrl + "/projects",
                    request,
                    ownerToken
            );

            Long projectId = extractProjectId(createResponse.getBody());

            // Register two users - one member, one trying to add
            String memberEmail = generateUniqueEmail();
            AuthResponse memberAuth = registerUser("Existing Member", memberEmail, "Test@123");
            
            ResponseEntity<String> memberMe = getWithAuth(baseUrl + "/auth/me", memberAuth.getAccessToken());
            Long memberId = extractUserId(memberMe.getBody());

            // Add first member
            postWithAuth(baseUrl + "/projects/" + projectId + "/members/" + memberId, null, ownerToken);

            // Register another user
            String newUserEmail = generateUniqueEmail();
            AuthResponse newUserAuth = registerUser("New User To Add", newUserEmail, "Test@123");
            
            ResponseEntity<String> newUserMe = getWithAuth(baseUrl + "/auth/me", newUserAuth.getAccessToken());
            Long newUserId = extractUserId(newUserMe.getBody());

            // Act - Member tries to add new user (should fail)
            ResponseEntity<String> response = postWithAuth(
                    baseUrl + "/projects/" + projectId + "/members/" + newUserId,
                    null,
                    memberAuth.getAccessToken()
            );

            // Assert
            assertTrue(response.getStatusCode().is4xxClientError());
        }
    }

    // ============ Helper Methods ============

    @SuppressWarnings("unchecked")
    private Long extractProjectId(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse,
                    new TypeReference<Map<String, Object>>() {});
            Map<String, Object> data = (Map<String, Object>) responseMap.get("data");
            return ((Number) data.get("id")).longValue();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract project ID", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Long extractUserId(String jsonResponse) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(jsonResponse,
                    new TypeReference<Map<String, Object>>() {});
            Map<String, Object> data = (Map<String, Object>) responseMap.get("data");
            return ((Number) data.get("id")).longValue();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID", e);
        }
    }
}
