package com.nexilum.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String icon;

    @Column(name = "required_count")
    private Integer requiredCount;

    @Column(name = "criteria_type")
    private String criteriaType; // TASKS_COMPLETED, STREAK_DAYS, COMMENTS_MADE, etc.

    @Column(name = "is_secret")
    @Builder.Default
    private Boolean isSecret = false;
}
