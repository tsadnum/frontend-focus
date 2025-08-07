export interface GoalRequestDTO {
  title: string;
  description?: string;
  progress?: number;
  targetDate: string;
}

export interface GoalResponseDTO {
  id: number;
  title: string;
  description?: string;
  progress: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}
