import api from '../lib/axios';
import type { 
  GamificationProfile, 
  Badge, 
  RankingEntry,
  RankingResponse,
  HeatmapEntry,
  HeatmapResponse,
  ApiResponse 
} from '../types';

export const gamificationService = {
  async getProfile(): Promise<GamificationProfile> {
    const response = await api.get<ApiResponse<GamificationProfile>>('/gamification/profile');
    return response.data.data;
  },

  async getBadges(): Promise<Badge[]> {
    const response = await api.get<ApiResponse<Badge[]>>('/gamification/badges');
    return response.data.data;
  },

  async getGlobalRanking(limit = 10): Promise<RankingEntry[]> {
    const response = await api.get<ApiResponse<RankingResponse>>('/gamification/ranking', {
      params: { limit },
    });
    return response.data.data.rankings;
  },

  async getProjectRanking(projectId: number, limit = 10): Promise<RankingEntry[]> {
    const response = await api.get<ApiResponse<RankingResponse>>(
      `/gamification/ranking/project/${projectId}`,
      { params: { limit } }
    );
    return response.data.data.rankings;
  },

  async getHeatmap(year?: number): Promise<HeatmapEntry[]> {
    const response = await api.get<ApiResponse<HeatmapResponse>>('/gamification/heatmap', {
      params: { year },
    });
    // Convert contributions object to array
    const contributions = response.data.data.contributions;
    return Object.entries(contributions).map(([date, count]) => ({ date, count }));
  },
};
