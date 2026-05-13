export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  position: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  q?: string;
  status?: string;
  priority?: string;
}
