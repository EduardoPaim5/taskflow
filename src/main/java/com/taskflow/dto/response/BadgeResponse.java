package com.taskflow.dto.response;

import com.taskflow.entity.Badge;
import com.taskflow.entity.UserBadge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String icon;
    private LocalDateTime earnedAt;

    public static BadgeResponse fromEntity(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .build();
    }

    public static BadgeResponse fromUserBadge(UserBadge userBadge) {
        Badge badge = userBadge.getBadge();
        return BadgeResponse.builder()
                .id(badge.getId())
                .code(badge.getCode())
                .name(badge.getName())
                .description(badge.getDescription())
                .icon(badge.getIcon())
                .earnedAt(userBadge.getEarnedAt())
                .build();
    }
}
