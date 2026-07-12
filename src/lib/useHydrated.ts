import { useEffect, useState } from "react";

// localStorage 永続化ストアはサーバ側で空のため、
// マウント後にだけ実データを描画して hydration mismatch を防ぐ
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
