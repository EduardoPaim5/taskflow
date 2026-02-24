package com.taskflow.repository;

import com.taskflow.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    Page<Comment> findByTaskId(Long taskId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.author.id = :userId")
    Long countByAuthorId(Long userId);

    void deleteByTaskId(Long taskId);
}
