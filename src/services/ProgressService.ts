import { getWaterDateKey, getWaterHistory, WaterHistoryEntry } from "./WaterService";

export type ProgressPeriod = "week" | "month" | "year";
export interface ProgressPoint { date: string; label: string; amount: number }
export interface WaterProgress {
  points: ProgressPoint[];
  average: number;
  completedDays: number;
  days: number;
  total: number;
  periodTotal: number;
  goal: number;
  start: string;
  end: string;
}

// Charts and averages include elapsed days only. Annual completion uses the full year.
export function calculateWaterProgress(entries: WaterHistoryEntry[], goal: number, period: ProgressPeriod, now = new Date()): WaterProgress {
  const end = getWaterDateKey(now);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (period === "week") startDate.setDate(startDate.getDate() - (startDate.getDay() + 6) % 7);
  if (period === "month") startDate.setDate(1);
  if (period === "year") startDate.setMonth(0, 1);
  const start = getWaterDateKey(startDate);
  const amounts = new Map(entries.map(entry => [entry.date, entry.amount]));
  const daily: ProgressPoint[] = [];
  for (const day = new Date(startDate); getWaterDateKey(day) <= end; day.setDate(day.getDate() + 1)) {
    const date = getWaterDateKey(day);
    daily.push({ date, amount: amounts.get(date) ?? 0, label: period === "week" ? day.toLocaleDateString("es-AR", { weekday: "short" }) : String(day.getDate()) });
  }
  const periodTotal = daily.reduce((sum, day) => sum + day.amount, 0);
  const yearDays = new Date(now.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365;
  let points = daily;
  if (period === "year") {
    points = Array.from({ length: now.getMonth() + 1 }, (_, month) => {
      const date = new Date(now.getFullYear(), month, 1, 12);
      const key = getWaterDateKey(date).slice(0, 7);
      const days = daily.filter(day => day.date.startsWith(key));
      return { date: getWaterDateKey(date), label: date.toLocaleDateString("es-AR", { month: "short" }), amount: days.reduce((sum, day) => sum + day.amount, 0) / days.length };
    });
  }
  return {
    points, average: periodTotal / daily.length,
    completedDays: daily.filter(day => day.amount >= goal).length,
    days: period === "year" ? yearDays : daily.length, total: entries.filter(entry => entry.date <= end).reduce((sum, entry) => sum + entry.amount, 0),
    periodTotal, goal, start, end,
  };
}

export async function getWaterProgress(period: ProgressPeriod): Promise<WaterProgress> {
  const { entries, goal } = await getWaterHistory();
  return calculateWaterProgress(entries, goal, period);
}
