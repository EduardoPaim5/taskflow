package com.nexilum.repository;

import com.nexilum.entity.Task;
import com.nexilum.enums.TaskPriority;
import com.nexilum.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    List<Task> findByProjectId(Long projectId);

    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    List<Task> findByAssigneeId(Long assigneeId);

    Page<Task> findByAssigneeId(Long assigneeId, Pageable pageable);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    List<Task> findByProjectIdAndAssigneeId(Long projectId, Long assigneeId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND t.status = :status AND t.priority = :priority")
    List<Task> findByProjectIdAndStatusAndPriority(Long projectId, TaskStatus status, TaskPriority priority);

    @Query("SELECT t FROM Task t WHERE t.deadline < :date AND t.status != 'DONE'")
    List<Task> findOverdueTasks(LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.deadline = :date AND t.status != 'DONE'")
    List<Task> findTasksDueOn(LocalDate date);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = 'DONE'")
    Long countCompletedTasksByUser(Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countByProjectId(Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status")
    Long countByProjectIdAndStatus(Long projectId, TaskStatus status);
}
