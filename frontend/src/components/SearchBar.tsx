import type { FilterState } from '../types/task';
import { getLabelStyle } from '../types/task';
import styles from './SearchBar.module.css';

interface Props {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  totalCount: number;     // 全タスク数
  filteredCount: number;  // 絞り込み後のタスク数
  allLabels: string[];    // 全タスクに存在するラベル一覧
  doneCount: number;      // 完了タスク数
}

export function SearchBar({
  filter,
  onFilterChange,
  totalCount,
  allLabels,
  doneCount,
}: Props) {

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, q: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({ q: '', labels: [] });
  };

  // ラベルチップのトグル：選択中なら解除、未選択なら追加
  const handleLabelToggle = (label: string) => {
    const next = filter.labels.includes(label)
      ? filter.labels.filter((l) => l !== label)
      : [...filter.labels, label];
    onFilterChange({ ...filter, labels: next });
  };

  // 表示するラベルはアルファベット/50音順
  const sortedLabels = [...allLabels].sort((a, b) => a.localeCompare(b, 'ja'));

  return (
    <div className={styles.bar}>
      {/* 🔍 検索入力欄 */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="タスクを検索..."
          value={filter.q}
          onChange={handleQueryChange}
        />
      </div>

      {/* すべてボタン */}
      <button className={styles.allBtn} onClick={handleReset}>
        すべて
      </button>

      {/* セパレーター */}
      {sortedLabels.length > 0 && <div className={styles.sep} />}

      {/* ラベルフィルターチップ */}
      {sortedLabels.map((label) => {
        const { color, bg } = getLabelStyle(label);
        const active = filter.labels.includes(label);
        return (
          <button
            key={label}
            className={`${styles.chip} ${active ? styles.chipActive : ''}`}
            style={{
              background: active ? color : bg,
              color: active ? '#fff' : color,
              borderColor: active ? color : 'transparent',
            }}
            onClick={() => handleLabelToggle(label)}
          >
            {label}
          </button>
        );
      })}

      {/* 進捗表示（右端） */}
      <div className={styles.progressWrap}>
        <span className={styles.progressText}>
          {doneCount} / {totalCount} 件
        </span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}
