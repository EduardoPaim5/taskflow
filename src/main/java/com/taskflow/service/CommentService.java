package com.taskflow.service;

import com.taskflow.dto.request.CommentRequest;
import com.taskflow.dto.response.CommentResponse;
import com.taskflow.entity.Comment;
import com.taskflow.entity.Project;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.ForbiddenException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.CommentRepository;
import com.taskflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final GamificationService gamificationService;
    private final BadgeService badgeService;
    private final NotificationService notificationService;

    public CommentResponse create(Long taskId, CommentRequest request, User author) {
        log.debug("Creating comment on task {} by user {}", taskId, author.getEmail());

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa", "id", taskId));

        validateUserAccessToProject(task.getProject(), author);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .author(author)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("Comment created with ID {} on task {}", saved.getId(), taskId);

        // Award points for comment
        gamificationService.awardPointsForComment(author);
        badgeService.checkAndAwardBadges(author);

        // Notify task assignee and reporter about new comment
        notificationService.notifyCommentAdded(saved, author);

        return CommentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> findByTask(Long taskId, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa", "id", taskId));

        validateUserAccessToProject(task.getProject(), currentUser);

        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CommentResponse> findByTaskPaginated(Long taskId, User currentUser, Pageable pageable) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa", "id", taskId));

        validateUserAccessToProject(task.getProject(), currentUser);

        return commentRepository.findByTaskId(taskId, pageable)
                .map(CommentResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public CommentResponse findById(Long id, User currentUser) {
        Comment comment = getCommentOrThrow(id);
        validateUserAccessToProject(comment.getTask().getProject(), currentUser);

        return CommentResponse.fromEntity(comment);
    }

    public CommentResponse update(Long id, CommentRequest request, User currentUser) {
        Comment comment = getCommentOrThrow(id);

        // Only the author can edit their comment
        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Você só pode editar seus próprios comentários");
        }

        log.debug("Updating comment {} by user {}", id, currentUser.getEmail());

        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);

        log.info("Comment {} updated successfully", id);
        return CommentResponse.fromEntity(updated);
    }

    public void delete(Long id, User currentUser) {
        Comment comment = getCommentOrThrow(id);
        Project project = comment.getTask().getProject();

        // Author or project owner can delete
        boolean canDelete = comment.getAuthor().getId().equals(currentUser.getId()) ||
                project.getOwner().getId().equals(currentUser.getId());

        if (!canDelete) {
            throw new ForbiddenException("Você não tem permissão para excluir este comentário");
        }

        log.debug("Deleting comment {} by user {}", id, currentUser.getEmail());
        commentRepository.delete(comment);
        log.info("Comment {} deleted successfully", id);
    }

    // Helper methods
    private Comment getCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comentário", "id", id));
    }

    private void validateUserAccessToProject(Project project, User user) {
        boolean hasAccess = project.getOwner().getId().equals(user.getId()) ||
                project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));

        if (!hasAccess) {
            throw new ForbiddenException("Você não tem acesso a este projeto");
        }
    }
}
