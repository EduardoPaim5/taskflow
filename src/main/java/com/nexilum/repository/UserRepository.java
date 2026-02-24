package com.nexilum.repository;

import com.nexilum.entity.User;
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

    List<User> findByNameContainingIgnoreCase(String name);

    @Query("SELECT u FROM User u ORDER BY u.totalPoints DESC")
    List<User> findAllByOrderByTotalPointsDesc();

    @Query("SELECT u FROM User u ORDER BY u.totalPoints DESC")
    List<User> findAllByOrderByTotalPointsDesc(org.springframework.data.domain.Pageable pageable);

    @Query("""
        SELECT u FROM User u 
        WHERE u.id IN (
            SELECT pm.id FROM Project p 
            JOIN p.members pm 
            WHERE p.id = :projectId
        ) OR u.id = (SELECT p.owner.id FROM Project p WHERE p.id = :projectId)
        ORDER BY u.totalPoints DESC
    """)
    List<User> findByProjectIdOrderByTotalPointsDesc(Long projectId, org.springframework.data.domain.Pageable pageable);
}
