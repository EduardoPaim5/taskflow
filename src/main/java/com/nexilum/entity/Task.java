package com.nexilum.entity;

import com.nexilum.enums.TaskPriority;
import com.nexilum.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "points_awarded")
    @Builder.Default
    private Integer pointsAwarded = 0;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("createdAt ASC")
    private List<Comment> comments = new ArrayList<>();

    // Helper methods
    public void addComment(Comment comment) {
        this.comments.add(comment);
        comment.setTask(this);
    }

    public boolean isCompleted() {
        return this.status == TaskStatus.DONE;
    }

    public boolean isOverdue() {
        return this.deadline != null 
            && !isCompleted() 
            && LocalDate.now().isAfter(this.deadline);
    }

    public boolean isCompletedBeforeDeadline() {
        return this.completedAt != null 
            && this.deadline != null 
            && this.completedAt.toLocalDate().isBefore(this.deadline);
    }
}
