package com.taskflow.controller;

import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.UserResponse;
import com.taskflow.entity.User;
import com.taskflow.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gerenciamento de usuários")
@SecurityRequirement(name = "bearer-jwt")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Usuário atual", description = "Retorna os dados do usuário autenticado")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal User currentUser) {

        UserResponse user = userService.getCurrentUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário", description = "Busca um usuário pelo ID")
    public ResponseEntity<ApiResponse<UserResponse>> findById(@PathVariable Long id) {
        UserResponse user = userService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    @Operation(summary = "Listar usuários", description = "Lista todos os usuários")
    public ResponseEntity<ApiResponse<List<UserResponse>>> findAll() {
        List<UserResponse> users = userService.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Listar usuários paginado", description = "Lista usuários com paginação")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> findAllPaginated(
            @PageableDefault(size = 20) Pageable pageable) {

        Page<UserResponse> users = userService.findAllPaginated(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar por nome", description = "Busca usuários pelo nome")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchByName(
            @RequestParam String query) {

        List<UserResponse> users = userService.searchByName(query);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/me")
    @Operation(summary = "Atualizar perfil", description = "Atualiza o perfil do usuário atual")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String avatarUrl) {

        UserResponse user = userService.updateProfile(currentUser, name, avatarUrl);
        return ResponseEntity.ok(ApiResponse.success(user, "Perfil atualizado com sucesso"));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Estatísticas do usuário", description = "Retorna estatísticas do usuário")
    public ResponseEntity<ApiResponse<UserStats>> getUserStats(
            @AuthenticationPrincipal User currentUser) {

        UserResponse user = userService.getCurrentUser(currentUser);
        Long completedTasks = userService.getCompletedTasksCount(currentUser.getId());

        UserStats stats = new UserStats(
                user.getTotalPoints(),
                user.getLevel(),
                user.getLevelName(),
                completedTasks,
                user.getCurrentStreak(),
                user.getLongestStreak()
        );

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // Inner class for user stats
    public record UserStats(
            Integer totalPoints,
            Integer level,
            String levelName,
            Long completedTasks,
            Integer currentStreak,
            Integer longestStreak
    ) {}
}
