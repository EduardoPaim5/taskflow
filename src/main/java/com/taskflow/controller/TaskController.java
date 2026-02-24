package com.taskflow.controller;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.ApiResponse;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.User;
import com.taskflow.enums.TaskStatus;
import com.taskflow.service.TaskService;
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
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Gerenciamento de tarefas")
@SecurityRequirement(name = "bearer-jwt")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Criar tarefa", description = "Cria uma nova tarefa em um projeto")
    public ResponseEntity<ApiResponse<TaskResponse>> create(
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {

        TaskResponse task = taskService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(task, "Tarefa criada com sucesso"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar tarefa", description = "Busca uma tarefa pelo ID")
    public ResponseEntity<ApiResponse<TaskResponse>> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        TaskResponse task = taskService.findById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(task));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Listar tarefas do projeto", description = "Lista todas as tarefas de um projeto")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> findByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {

        List<TaskResponse> tasks = taskService.findByProject(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/project/{projectId}/paginated")
    @Operation(summary = "Listar tarefas do projeto paginado", description = "Lista tarefas com paginação")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> findByProjectPaginated(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<TaskResponse> tasks = taskService.findByProjectPaginated(projectId, currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/my-tasks")
    @Operation(summary = "Minhas tarefas", description = "Lista todas as tarefas atribuídas ao usuário atual")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> findMyTasks(
            @AuthenticationPrincipal User currentUser) {

        List<TaskResponse> tasks = taskService.findMyTasks(currentUser);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar tarefa", description = "Atualiza uma tarefa existente")
    public ResponseEntity<ApiResponse<TaskResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {

        TaskResponse task = taskService.update(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(task, "Tarefa atualizada com sucesso"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status", description = "Atualiza o status de uma tarefa")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal User currentUser) {

        TaskResponse task = taskService.updateStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success(task, "Status atualizado com sucesso"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir tarefa", description = "Exclui uma tarefa")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        taskService.delete(id, currentUser);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Tarefa excluída com sucesso"));
    }
}
