// Auth types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string;
  totalPoints: number;
  level: number;
  levelName: string;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description: string;
  owner: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequest {
  name: string;
  description: string;
}

// Task types
export type TaskStatus = 'TODO' | 'DOING' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: Project;
  assignee?: User;
  createdBy: User;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description: string;
  status?: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: number;
  deadline?: string;
}

// Comment types
export interface Comment {
  id: number;
  content: string;
  author: User;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

// Gamification types
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface GamificationProfile {
  userId: number;
  userName: string;
  totalPoints: number;
  level: number;
  levelName: string;
  pointsToNextLevel: number;
  nextLevelThreshold: number;
  progressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  projectsCount: number;
  commentsCount: number;
  recentBadges: Badge[];
  totalBadges: number;
  globalRankPosition: number;
}

export interface RankingEntry {
  position: number;
  userId: number;
  userName: string;
  level: number;
  levelName: string;
  totalPoints: number;
  tasksCompleted: number;
  currentStreak: number;
}

export interface RankingResponse {
  rankings: RankingEntry[];
  totalParticipants: number;
}

export interface HeatmapResponse {
  userId: number;
  userName: string;
  contributions: Record<string, number>;
  totalActivities: number;
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

// Notification types
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_COMMENT_ADDED'
  | 'BADGE_EARNED'
  | 'LEVEL_UP'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_UPDATED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: number;
  entityType?: string;
  projectId?: number;
  projectName?: string;
  actorId?: number;
  actorName?: string;
  timestamp: string;
  read: boolean;
}

export interface ProjectEvent {
  event: string;
  payload: unknown;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
