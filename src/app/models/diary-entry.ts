export interface DiaryEntryRequestDTO {
  title: string;
  content: string;
  entryDate: string;
}

export interface DiaryEntryResponseDTO {
  id: number;
  title: string;
  content: string;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}
