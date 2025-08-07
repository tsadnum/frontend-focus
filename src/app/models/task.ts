export enum TaskType {
  WORK = 'WORK',
  STUDY = 'STUDY',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}


export interface TaskRequestDTO {
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  kanbanOrder?: number;
}


export interface TaskResponseDTO{
  id: number;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  dueDate?: string;
  kanbanOrder?: number;
  createdAt: string;
  updatedAt: string;
}


