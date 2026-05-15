export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

// ラベルに使う色のリスト（ラベル名のハッシュ値で自動的に1色が選ばれる）
const LABEL_COLORS = [
  { color: '#b91c1c', bg: '#fee2e2' },   // 赤
  { color: '#c2410c', bg: '#ffedd5' },   // オレンジ赤
  { color: '#d97706', bg: '#fef3c7' },   // アンバー
  { color: '#854d0e', bg: '#fef9c3' },   // イエロー
  { color: '#4d7c0f', bg: '#ecfccb' },   // ライム
  { color: '#166534', bg: '#dcfce7' },   // グリーン
  { color: '#065f46', bg: '#d1fae5' },   // エメラルド
  { color: '#134e4a', bg: '#ccfbf1' },   // ティール
  { color: '#155e75', bg: '#cffafe' },   // シアン
  { color: '#075985', bg: '#e0f2fe' },   // スカイ
  { color: '#1e40af', bg: '#dbeafe' },   // ブルー
  { color: '#3730a3', bg: '#e0e7ff' },   // インディゴ
  { color: '#5b21b6', bg: '#ede9fe' },   // バイオレット
  { color: '#6b21a8', bg: '#f3e8ff' },   // パープル
  { color: '#86198f', bg: '#fae8ff' },   // フューシャ
  { color: '#9d174d', bg: '#fce7f3' },   // ピンク
];

// ラベル名から色を決める関数（同じ名前なら常に同じ色になる）
export function getLabelStyle(name: string): { color: string; bg: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
  }
  return LABEL_COLORS[hash % LABEL_COLORS.length];
}

// DBから取得するタスクの型（id・createdAt など全フィールドがある）
export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  position: number | null;
  dueDate: string | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchParams {
  q?: string;
  status?: string;
  priority?: string;
}

// フィルター状態の型
export interface FilterState {
  q: string;
  labels: string[];
}

// 登録時にフロントから送るデータの型
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  labels?: string[];
}

// 更新時にフロントから送るデータの型
export interface UpdateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  status?: Status;
  dueDate?: string;
  labels?: string[];
}
