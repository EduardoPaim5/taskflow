package com.nexilum.service;

import com.nexilum.dto.request.TaskRequest;
import com.nexilum.dto.response.TaskResponse;
import com.nexilum.entity.Project;
import com.nexilum.entity.Task;
import com.nexilum.entity.User;
import com.nexilum.enums.TaskPriority;
import com.nexilum.enums.TaskStatus;
import com.nexilum.exception.ForbiddenException;
import com.nexilum.exception.ResourceNotFoundException;
import com.nexilum.repository.ProjectRepository;
import com.nexilum.repository.TaskRepository;
import com.nexilum.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private final GamificationService gamificationService;
    private final BadgeService badgeService;
    private final NotificationService notificationService;

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

        // Award points for task creation
        gamificationService.awardPointsForTaskCreation(reporter);

        // Send notification if task is assigned to someone else
        if (assignee != null && !assignee.getId().equals(reporter.getId())) {
            notificationService.notifyTaskAssigned(saved, reporter);
        }

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

        User oldAssignee = task.getAssignee();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());

        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        if (request.getAssigneeId() != null) {
            User newAssignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", request.getAssigneeId()));
            validateUserAccessToProject(task.getProject(), newAssignee);
            task.setAssignee(newAssignee);
        }

        Task updated = taskRepository.save(task);
        log.info("Task {} updated successfully", id);

        // Notify new assignee if changed
        User newAssignee = updated.getAssignee();
        boolean assigneeChanged = (oldAssignee == null && newAssignee != null) ||
                (oldAssignee != null && newAssignee != null && !oldAssignee.getId().equals(newAssignee.getId()));
        
        if (assigneeChanged && newAssignee != null && !newAssignee.getId().equals(currentUser.getId())) {
            notificationService.notifyTaskAssigned(updated, currentUser);
        }

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
            
            // Award points for task completion
            User assignee = task.getAssignee();
            if (assignee != null) {
                int previousLevel = assignee.getLevel();
                boolean beforeDeadline = task.getDeadline() != null && 
                        LocalDate.now().isBefore(task.getDeadline());
                int pointsAwarded = gamificationService.awardPointsForTaskCompletion(
                        assignee, task.getPriority(), beforeDeadline);
                task.setPointsAwarded(pointsAwarded);
                
                // Check for new badges
                badgeService.checkAndAwardBadges(assignee);
                
                // Check for level up and notify
                if (gamificationService.didUserLevelUp(assignee, previousLevel)) {
                    notificationService.notifyLevelUp(
                            assignee, 
                            assignee.getLevel(), 
                            gamificationService.getLevelName(assignee.getLevel())
                    );
                }
                
                log.info("Task {} completed by user {}. Points awarded: {}", 
                        id, assignee.getId(), pointsAwarded);
            } else {
                log.info("Task {} marked as completed (no assignee)", id);
            }
        } else if (newStatus != TaskStatus.DONE && oldStatus == TaskStatus.DONE) {
            // Task moved out of DONE - remove points
            User assignee = task.getAssignee();
            int pointsToRemove = task.getPointsAwarded();
            
            if (assignee != null && pointsToRemove > 0) {
                gamificationService.removePointsForTaskUncompletion(assignee, pointsToRemove);
                log.info("Task {} moved out of DONE. Removed {} points from user {}", 
                        id, pointsToRemove, assignee.getId());
            }
            
            task.setCompletedAt(null);
            task.setPointsAwarded(0);
        }

        Task updated = taskRepository.save(task);
        
        // Send notification for status change
        notificationService.notifyTaskStatusChanged(updated, currentUser);
        
        // Broadcast to project channel for real-time updates (kanban board)
        notificationService.broadcastToProjectChannel(
                task.getProject().getId(),
                "TASK_STATUS_CHANGED",
                TaskResponse.fromEntity(updated)
        );
        
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
