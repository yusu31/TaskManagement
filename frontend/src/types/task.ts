export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

// DBから取得するタスクの型（id・createdAt など全フィールドがある）
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

// 登録時にフロントから送るデータの型
// id・createdAt・updatedAt はサーバー側が自動でつけるので含めない
export interface CreateTaskInput {
  title: string;
  description?: string;   // ? = 省略可能（任意入力）
  priority?: Priority;
  status?: Status;
  dueDate?: string;       // "2026-05-20" のような文字列形式
}
