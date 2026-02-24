package com.taskflow.service;

import com.taskflow.dto.request.TaskRequest;
import com.taskflow.dto.response.TaskResponse;
import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.enums.TaskPriority;
import com.taskflow.enums.TaskStatus;
import com.taskflow.exception.ForbiddenException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskResponse create(TaskRequest request, User reporter) {
        log.debug("Creating task '{}' for project {}", request.getTitle(), request.getProjectId());

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", "id", request.getProjectId()));

        validateUserAccessToProject(project, reporter);

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", request.getAssigneeId()));
            validateUserAccessToProject(project, assignee);
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .deadline(request.getDeadline())
                .project(project)
                .reporter(reporter)
                .assignee(assignee)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task '{}' created with ID {}", saved.getTitle(), saved.getId());

        return TaskResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(Long id, User currentUser) {
        Task task = getTaskOrThrow(id);
        validateUserAccessToProject(task.getProject(), currentUser);

        return TaskResponse.fromEntity(task);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByProject(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", "id", projectId));

        validateUserAccessToProject(project, currentUser);

        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> findByProjectPaginated(Long projectId, User currentUser, Pageable pageable) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", "id", projectId));

        validateUserAccessToProject(project, currentUser);

        return taskRepository.findByProjectId(projectId, pageable)
                .map(TaskResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByAssignee(Long assigneeId, User currentUser) {
        // Users can see their own tasks or admin can see all
        if (!currentUser.getId().equals(assigneeId)) {
            log.warn("User {} tried to access tasks of user {}", currentUser.getId(), assigneeId);
            throw new ForbiddenException("Você só pode ver suas próprias tarefas");
        }

        return taskRepository.findByAssigneeId(assigneeId)
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> findByAssigneePaginated(Long assigneeId, User currentUser, Pageable pageable) {
        if (!currentUser.getId().equals(assigneeId)) {
            throw new ForbiddenException("Você só pode ver suas próprias tarefas");
        }

        return taskRepository.findByAssigneeId(assigneeId, pageable)
                .map(TaskResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findMyTasks(User currentUser) {
        return taskRepository.findByAssigneeId(currentUser.getId())
                .stream()
                .map(TaskResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TaskResponse update(Long id, TaskRequest request, User currentUser) {
        Task task = getTaskOrThrow(id);
        validateUserAccessToProject(task.getProject(), currentUser);

        log.debug("Updating task {} by user {}", id, currentUser.getEmail());

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getAssigneeId() != null) {
            User newAssignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", request.getAssigneeId()));
            validateUserAccessToProject(task.getProject(), newAssignee);
            task.setAssignee(newAssignee);
        }

        Task updated = taskRepository.save(task);
        log.info("Task {} updated successfully", id);

        return TaskResponse.fromEntity(updated);
    }

    public TaskResponse updateStatus(Long id, TaskStatus newStatus, User currentUser) {
        Task task = getTaskOrThrow(id);
        validateUserAccessToProject(task.getProject(), currentUser);

        log.debug("Updating task {} status from {} to {}", id, task.getStatus(), newStatus);

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(newStatus);

        // Handle task completion
        if (newStatus == TaskStatus.DONE && oldStatus != TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
            // TODO: Integrate with gamification service for points
            log.info("Task {} marked as completed", id);
        } else if (newStatus != TaskStatus.DONE && oldStatus == TaskStatus.DONE) {
            task.setCompletedAt(null);
            task.setPointsAwarded(0);
        }

        Task updated = taskRepository.save(task);
        return TaskResponse.fromEntity(updated);
    }

    public void delete(Long id, User currentUser) {
        Task task = getTaskOrThrow(id);
        Project project = task.getProject();

        // Only project owner or task reporter can delete
        boolean canDelete = project.getOwner().getId().equals(currentUser.getId()) ||
                task.getReporter().getId().equals(currentUser.getId());

        if (!canDelete) {
            throw new ForbiddenException("Apenas o proprietário do projeto ou criador da tarefa pode excluí-la");
        }

        log.debug("Deleting task {} by user {}", id, currentUser.getEmail());
        taskRepository.delete(task);
        log.info("Task {} deleted successfully", id);
    }

    // Helper methods
    private Task getTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa", "id", id));
    }

    private void validateUserAccessToProject(Project project, User user) {
        boolean hasAccess = project.getOwner().getId().equals(user.getId()) ||
                project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));

        if (!hasAccess) {
            throw new ForbiddenException("Você não tem acesso a este projeto");
        }
    }
}
