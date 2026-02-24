package com.taskflow.enums;

public enum ActionType {
    // Task actions
    TASK_CREATED,
    TASK_UPDATED,
    TASK_COMPLETED,
    TASK_ASSIGNED,
    TASK_STATUS_CHANGED,
    
    // Project actions
    PROJECT_CREATED,
    PROJECT_UPDATED,
    PROJECT_MEMBER_ADDED,
    PROJECT_MEMBER_REMOVED,
    
    // Comment actions
    COMMENT_ADDED,
    COMMENT_UPDATED,
    COMMENT_DELETED,
    
    // User actions
    USER_REGISTERED,
    USER_LOGGED_IN,
    USER_LEVEL_UP,
    USER_BADGE_EARNED
}
