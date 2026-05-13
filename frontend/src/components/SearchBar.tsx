import { useState } from 'react';
import type { SearchParams } from '../types/task';
import styles from './SearchBar.module.css';

interface Props {
  onSearch: (params: SearchParams) => void;
  resultCount: number;
  isFiltered: boolean;
}

export function SearchBar({ onSearch, resultCount, isFiltered }: Props) {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    if (keyword.trim()) {
      onSearch({ q: keyword.trim() });
    }
  };

  const handleReset = () => {
    setKeyword('');
    onSearch({});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={styles.bar}>
      <input
        className={styles.input}
        type="text"
        placeholder="タスクを検索... (Enterで検索)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={`${styles.btn} ${styles.btnSearch}`} onClick={handleSearch}>
        検索
      </button>
      {isFiltered && (
        <button className={`${styles.btn} ${styles.btnReset}`} onClick={handleReset}>
          すべて表示
        </button>
      )}
      <span className={styles.resultInfo}>
        {isFiltered ? `${resultCount} 件ヒット` : `全 ${resultCount} 件`}
      </span>
    </div>
  );
}
