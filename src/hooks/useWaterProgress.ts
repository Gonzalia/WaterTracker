import { useCallback, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getWaterProgress, ProgressPeriod, WaterProgress } from "../services/ProgressService";
import { getWaterDateKey } from "../services/WaterService";

export default function useWaterProgress(period: ProgressPeriod) {
  const [progress, setProgress] = useState<WaterProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      let request = 0;
      const refresh = async () => {
        const version = ++request;
        setLoading(true);
        setError(false);
        try {
          const result = await getWaterProgress(period);
          if (active && version === request) setProgress(result);
        } catch {
          if (active && version === request) setError(true);
        } finally {
          if (active && version === request) setLoading(false);
        }
      };
      void refresh();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") void refresh();
      });
      let day = getWaterDateKey();
      const timer = setInterval(() => {
        const next = getWaterDateKey();
        if (next !== day) {
          day = next;
          void refresh();
        }
      }, 1000);
      return () => {
        active = false;
        subscription.remove();
        clearInterval(timer);
      };
    }, [period, retry]),
  );

  return { progress, loading, error, setLoading, retry: () => setRetry(value => value + 1) };
}
