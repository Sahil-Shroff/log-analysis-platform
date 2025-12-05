import { useEffect, useRef, useState } from "react";

interface PollingOptions<T> {
  intervalMs: number;
  enabled?: boolean;
  deps?: any[];
  immediate?: boolean;
  transform?: (data: T) => T;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: PollingOptions<T>
) {
  const { intervalMs, enabled = true, deps = [], immediate = true, transform } =
    options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const timerRef = useRef<number | null>(null);

  const run = async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await fetcher();
      setData(transform ? transform(res) : res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    if (immediate) run();
    timerRef.current = window.setInterval(run, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, intervalMs, ...deps]);

  return { data, error, loading, refresh: run };
}
