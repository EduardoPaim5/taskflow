package com.nexilum.controller;

import com.nexilum.dto.request.ProjectRequest;
import com.nexilum.dto.response.ApiResponse;
import com.nexilum.dto.response.ProjectResponse;
import com.nexilum.entity.User;
import com.nexilum.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Gerenciamento de projetos")
@SecurityRequirement(name = "bearer-jwt")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Criar projeto", description = "Cria um novo projeto")
    public ResponseEntity<ApiResponse<ProjectResponse>> create(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser) {

        ProjectResponse project = projectService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(project, "Projeto criado com sucesso"));
    }

    @GetMapping
    @Operation(summary = "Listar projetos", description = "Lista todos os projetos do usuário")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> findAll(
            @AuthenticationPrincipal User currentUser) {

        List<ProjectResponse> projects = projectService.findAllByUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Listar projetos paginado", description = "Lista projetos com paginação")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> findAllPaginated(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ProjectResponse> projects = projectService.findAllByUserPaginated(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar projeto", description = "Busca um projeto pelo ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        ProjectResponse project = projectService.findById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar projeto", description = "Atualiza um projeto existente")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser) {

        ProjectResponse project = projectService.update(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(project, "Projeto atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir projeto", description = "Exclui um projeto")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        projectService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Projeto excluído com sucesso"));
    }

    @PostMapping("/{id}/members/{userId}")
    @Operation(summary = "Adicionar membro", description = "Adiciona um membro ao projeto")
    public ResponseEntity<ApiResponse<ProjectResponse>> addMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {

        ProjectResponse project = projectService.addMember(id, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(project, "Membro adicionado com sucesso"));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @Operation(summary = "Remover membro", description = "Remove um membro do projeto")
    public ResponseEntity<ApiResponse<ProjectResponse>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {

        ProjectResponse project = projectService.removeMember(id, userId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(project, "Membro removido com sucesso"));
    }
}
