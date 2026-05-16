import { createContext, useContext } from 'react';

// ラベル名 → パレットのインデックス番号 のマップを全コンポーネントで共有するContext
export const LabelColorContext = createContext<Record<string, number>>({});
export const useLabelColor = () => useContext(LabelColorContext);
