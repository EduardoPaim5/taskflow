package com.nexilum.service;

import com.nexilum.dto.request.ProjectRequest;
import com.nexilum.dto.response.ProjectResponse;
import com.nexilum.entity.Project;
import com.nexilum.entity.User;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ProjectResponse create(ProjectRequest request, User owner) {
        log.debug("Creating project '{}' for user {}", request.getName(), owner.getEmail());

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .color(request.getColor())
                .owner(owner)
                .build();

        project.addMember(owner);
        Project saved = projectRepository.save(project);

        log.info("Project '{}' created with ID {}", saved.getName(), saved.getId());
        return ProjectResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id, User currentUser) {
        Project project = getProjectOrThrow(id);
        validateUserAccess(project, currentUser);

        Long taskCount = taskRepository.countByProjectId(id);
        Long completedTaskCount = taskRepository.countByProjectIdAndStatus(id, TaskStatus.DONE);

        return ProjectResponse.fromEntityWithStats(project, taskCount, completedTaskCount);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> findAllByUser(User user) {
        log.debug("Finding all projects for user {}", user.getEmail());

        return projectRepository.findAllByUserId(user.getId())
                .stream()
                .map(project -> {
                    Long taskCount = taskRepository.countByProjectId(project.getId());
                    Long completedTaskCount = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
                    return ProjectResponse.fromEntityWithStats(project, taskCount, completedTaskCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProjectResponse> findAllByUserPaginated(User user, Pageable pageable) {
        log.debug("Finding all projects for user {} with pagination", user.getEmail());

        return projectRepository.findAllByUserId(user.getId(), pageable)
                .map(project -> {
                    Long taskCount = taskRepository.countByProjectId(project.getId());
                    Long completedTaskCount = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.DONE);
                    return ProjectResponse.fromEntityWithStats(project, taskCount, completedTaskCount);
                });
    }

    public ProjectResponse update(Long id, ProjectRequest request, User currentUser) {
        Project project = getProjectOrThrow(id);
        validateOwnerAccess(project, currentUser);

        log.debug("Updating project {} by user {}", id, currentUser.getEmail());

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIcon(request.getIcon());
        project.setColor(request.getColor());

        Project updated = projectRepository.save(project);

        Long taskCount = taskRepository.countByProjectId(id);
        Long completedTaskCount = taskRepository.countByProjectIdAndStatus(id, TaskStatus.DONE);

        log.info("Project {} updated successfully", id);
        return ProjectResponse.fromEntityWithStats(updated, taskCount, completedTaskCount);
    }

    public void delete(Long id, User currentUser) {
        Project project = getProjectOrThrow(id);
        validateOwnerAccess(project, currentUser);

        log.debug("Deleting project {} by user {}", id, currentUser.getEmail());
        projectRepository.delete(project);
        log.info("Project {} deleted successfully", id);
    }

    public ProjectResponse addMember(Long projectId, Long userId, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        validateOwnerAccess(project, currentUser);

        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", userId));

        if (project.getMembers().contains(newMember)) {
            log.debug("User {} is already a member of project {}", userId, projectId);
            return ProjectResponse.fromEntity(project);
        }

        project.addMember(newMember);
        Project updated = projectRepository.save(project);

        log.info("User {} added to project {}", userId, projectId);
        
        // Send notification to the new member
        notificationService.notifyMemberAdded(updated, newMember, currentUser);
        
        return ProjectResponse.fromEntity(updated);
    }

    public ProjectResponse removeMember(Long projectId, Long userId, User currentUser) {
        Project project = getProjectOrThrow(projectId);
        validateOwnerAccess(project, currentUser);

        if (project.getOwner().getId().equals(userId)) {
            throw new ForbiddenException("Não é possível remover o proprietário do projeto");
        }

        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário", "id", userId));

        project.removeMember(member);
        Project updated = projectRepository.save(project);

        log.info("User {} removed from project {}", userId, projectId);
        return ProjectResponse.fromEntity(updated);
    }

    // Helper methods
    private Project getProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto", "id", id));
    }

    private void validateUserAccess(Project project, User user) {
        boolean hasAccess = project.getOwner().getId().equals(user.getId()) ||
                project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));

        if (!hasAccess) {
            throw new ForbiddenException("Você não tem acesso a este projeto");
        }
    }

    private void validateOwnerAccess(Project project, User user) {
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new ForbiddenException("Apenas o proprietário pode realizar esta ação");
        }
    }
}
