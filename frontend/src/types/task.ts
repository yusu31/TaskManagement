export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

// 色相を45度間隔で8色 → その中間8色の順に並べた16色パレット
// 隣り合う色同士が最大限離れるよう設計
export const LABEL_COLORS: { color: string; bg: string }[] = [
  { color: 'hsl(0,   70%, 38%)', bg: 'hsl(0,   80%, 88%)' },  //  0: 赤
  { color: 'hsl(180, 65%, 28%)', bg: 'hsl(180, 70%, 86%)' },  //  1: ティール
  { color: 'hsl(90,  60%, 28%)', bg: 'hsl(90,  68%, 86%)' },  //  2: 黄緑
  { color: 'hsl(270, 58%, 40%)', bg: 'hsl(270, 68%, 88%)' },  //  3: 紫
  { color: 'hsl(45,  72%, 34%)', bg: 'hsl(45,  82%, 86%)' },  //  4: 黄オレンジ
  { color: 'hsl(225, 62%, 38%)', bg: 'hsl(225, 72%, 88%)' },  //  5: 青
  { color: 'hsl(135, 58%, 28%)', bg: 'hsl(135, 68%, 86%)' },  //  6: 緑
  { color: 'hsl(315, 60%, 40%)', bg: 'hsl(315, 72%, 88%)' },  //  7: ピンク
  { color: 'hsl(22,  68%, 36%)', bg: 'hsl(22,  78%, 87%)' },  //  8: オレンジ
  { color: 'hsl(202, 62%, 32%)', bg: 'hsl(202, 70%, 87%)' },  //  9: 水色
  { color: 'hsl(112, 56%, 28%)', bg: 'hsl(112, 65%, 87%)' },  // 10: ライム
  { color: 'hsl(292, 55%, 38%)', bg: 'hsl(292, 65%, 89%)' },  // 11: 薄紫
  { color: 'hsl(67,  62%, 30%)', bg: 'hsl(67,  72%, 87%)' },  // 12: 黄緑2
  { color: 'hsl(247, 58%, 40%)', bg: 'hsl(247, 68%, 89%)' },  // 13: インディゴ
  { color: 'hsl(157, 58%, 28%)', bg: 'hsl(157, 66%, 86%)' },  // 14: エメラルド
  { color: 'hsl(337, 62%, 38%)', bg: 'hsl(337, 72%, 88%)' },  // 15: ローズ
];

// colorIndex を受け取れるようにした（省略時はハッシュで決める）
export function getLabelStyle(name: string, colorIndex?: number): { color: string; bg: string } {
  const idx = colorIndex !== undefined ? colorIndex : (() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) & 0x7fffffff;
    }
    return hash;
  })();
  return LABEL_COLORS[idx % LABEL_COLORS.length];
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
