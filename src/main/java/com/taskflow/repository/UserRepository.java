package com.taskflow.repository;

import com.taskflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u ORDER BY u.totalPoints DESC")
    List<User> findAllOrderByTotalPointsDesc();

    @Query("SELECT u FROM User u ORDER BY u.totalPoints DESC LIMIT :limit")
    List<User> findTopByTotalPoints(int limit);

    @Query("""
        SELECT u FROM User u 
        WHERE u.id IN (
            SELECT pm.id FROM Project p 
            JOIN p.members pm 
            WHERE p.id = :projectId
        )
        ORDER BY u.totalPoints DESC
    """)
    List<User> findRankingByProject(Long projectId);
}
