package com.nexilum.controller;

import com.nexilum.dto.request.CommentRequest;
import com.nexilum.dto.response.ApiResponse;
import com.nexilum.dto.response.CommentResponse;
import com.nexilum.entity.User;
import com.nexilum.service.CommentService;
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
@RequestMapping("/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Gerenciamento de comentários")
@SecurityRequirement(name = "bearer-jwt")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/task/{taskId}")
    @Operation(summary = "Criar comentário", description = "Adiciona um comentário a uma tarefa")
    public ResponseEntity<ApiResponse<CommentResponse>> create(
            @PathVariable Long taskId,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User currentUser) {

        CommentResponse comment = commentService.create(taskId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment, "Comentário adicionado com sucesso"));
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Listar comentários", description = "Lista todos os comentários de uma tarefa")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> findByTask(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User currentUser) {

        List<CommentResponse> comments = commentService.findByTask(taskId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/task/{taskId}/paginated")
    @Operation(summary = "Listar comentários paginado", description = "Lista comentários com paginação")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> findByTaskPaginated(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<CommentResponse> comments = commentService.findByTaskPaginated(taskId, currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar comentário", description = "Busca um comentário pelo ID")
    public ResponseEntity<ApiResponse<CommentResponse>> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        CommentResponse comment = commentService.findById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(comment));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar comentário", description = "Atualiza um comentário existente")
    public ResponseEntity<ApiResponse<CommentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request,
            @AuthenticationPrincipal User currentUser) {

        CommentResponse comment = commentService.update(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(comment, "Comentário atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir comentário", description = "Exclui um comentário")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        commentService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Comentário excluído com sucesso"));
    }
}
