package com.nexilum.repository;

import com.nexilum.entity.ActivityLog;
import com.nexilum.enums.ActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<ActivityLog> findByUserId(Long userId, Pageable pageable);

    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Page<ActivityLog> findByProjectId(Long projectId, Pageable pageable);

    @Query("SELECT a FROM ActivityLog a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.createdAt DESC")
    List<ActivityLog> findByEntity(String entityType, Long entityId);

    @Query("""
        SELECT CAST(a.createdAt AS LocalDate) as date, COUNT(a) as count 
        FROM ActivityLog a 
        WHERE a.user.id = :userId 
        AND a.createdAt >= :startDate 
        GROUP BY CAST(a.createdAt AS LocalDate)
        ORDER BY date
    """)
    List<Object[]> getActivityHeatmap(Long userId, LocalDateTime startDate);

    @Query("""
        SELECT COUNT(a) FROM ActivityLog a 
        WHERE a.user.id = :userId 
        AND a.action = :action 
        AND a.createdAt >= :since
    """)
    Long countUserActionsSince(Long userId, ActionType action, LocalDateTime since);

    @Query("""
        SELECT DISTINCT CAST(a.createdAt AS LocalDate) 
        FROM ActivityLog a 
        WHERE a.user.id = :userId 
        ORDER BY CAST(a.createdAt AS LocalDate) DESC
    """)
    List<LocalDate> findDistinctActivityDatesByUser(Long userId);
}
