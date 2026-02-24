import api from '../lib/axios';
import type { Project, ProjectRequest, ApiResponse, PaginatedResponse } from '../types';

export const projectService = {
  async getAll(page = 0, size = 10): Promise<PaginatedResponse<Project>> {
    const response = await api.get<ApiResponse<Project[]>>('/projects', {
      params: { page, size },
    });
    // Backend returns array directly, wrap in paginated format
    const projects = response.data.data || [];
    return {
      content: projects,
      totalElements: projects.length,
      totalPages: 1,
      size: projects.length,
      number: page,
      first: page === 0,
      last: true,
    };
  },

  async getById(id: number): Promise<Project> {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  async create(data: ProjectRequest): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },

  async update(id: number, data: ProjectRequest): Promise<Project> {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async addMember(projectId: number, userId: number): Promise<Project> {
    const response = await api.post<ApiResponse<Project>>(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data.data;
  },

  async removeMember(projectId: number, userId: number): Promise<Project> {
    const response = await api.delete<ApiResponse<Project>>(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data.data;
  },
};
