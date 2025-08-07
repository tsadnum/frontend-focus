export interface EventRequestDTO {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export interface EventResponseDTO {
  id: number;
  title: string;
  category?: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

