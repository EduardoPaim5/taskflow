import api from '../lib/axios';
import type { Task, TaskRequest, ApiResponse, PaginatedResponse, TaskStatus } from '../types';
import { projectService } from './project.service';

export interface TaskFilters {
  projectId?: number;
  status?: TaskStatus;
  assigneeId?: number;
  page?: number;
  size?: number;
}

// Backend returns tasks in this format
interface TaskApiResponse {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline?: string;
  completedAt?: string;
  isOverdue: boolean;
  pointsAwarded: number;
  projectId: number;
  projectName: string;
  assignee?: { id: number; name: string };
  reporter: { id: number; name: string };
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Transform API response to frontend Task type
function transformTask(apiTask: TaskApiResponse): Task {
  const defaultUser = {
    email: '',
    role: 'USER' as const,
    totalPoints: 0,
    level: 1,
    levelName: '',
    currentStreak: 0,
    longestStreak: 0,
    tasksCompleted: 0,
    createdAt: '',
  };

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description,
    status: apiTask.status,
    priority: apiTask.priority,
    deadline: apiTask.deadline,
    completedAt: apiTask.completedAt,
    project: {
      id: apiTask.projectId,
      name: apiTask.projectName,
      description: '',
      owner: {
        id: apiTask.reporter.id,
        name: apiTask.reporter.name,
        ...defaultUser,
      },
      members: [],
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
    },
    assignee: apiTask.assignee ? {
      id: apiTask.assignee.id,
      name: apiTask.assignee.name,
      ...defaultUser,
    } : undefined,
    createdBy: {
      id: apiTask.reporter.id,
      name: apiTask.reporter.name,
      ...defaultUser,
    },
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

export const taskService = {
  async getAll(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    void filters;
    // Get all projects first, then fetch tasks for each project
    const projectsResponse = await projectService.getAll(0, 100);
    const projects = projectsResponse.content;
    
    if (projects.length === 0) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 1,
        size: 0,
        number: 0,
        first: true,
        last: true,
      };
    }

    // Fetch tasks from all projects
    const taskPromises = projects.map(project => 
      api.get<ApiResponse<TaskApiResponse[]>>(`/tasks/project/${project.id}`)
        .then(res => res.data.data || [])
        .catch(() => [])
    );
    
    const tasksArrays = await Promise.all(taskPromises);
    const allTasks = tasksArrays.flat().map(transformTask);
    
    return {
      content: allTasks,
      totalElements: allTasks.length,
      totalPages: 1,
      size: allTasks.length,
      number: 0,
      first: true,
      last: true,
    };
  },

  async getById(id: number): Promise<Task> {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },

  async getByProject(projectId: number): Promise<Task[]> {
    const response = await api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`);
    return response.data.data;
  },

  async create(data: TaskRequest): Promise<Task> {
    const response = await api.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data;
  },

  async update(id: number, data: Partial<TaskRequest>): Promise<Task> {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data;
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status?status=${status}`);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async assign(taskId: number, userId: number): Promise<Task> {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/assign`, { userId });
    return response.data.data;
  },
};
