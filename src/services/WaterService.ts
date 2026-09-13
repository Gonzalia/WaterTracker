import AsyncStorage from "@react-native-async-storage/async-storage";

const LEGACY_KEY = "waterIntake";
const PREFIX = "waterIntake:";

export const getWaterDateKey = (date = new Date()): string => {
  if (!Number.isFinite(date.getTime())) throw new Error("Fecha inválida");
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Serialize reads and writes so rapid additions and migration cannot overwrite each other.
let pending: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => {});
  return result;
}

async function migrateLegacy() {
  const legacy = await AsyncStorage.getItem(LEGACY_KEY);
  if (legacy === null) return;
  const todayKey = PREFIX + getWaterDateKey();
  if (await AsyncStorage.getItem(todayKey) === null) {
    const amount = Number(legacy);
    await AsyncStorage.setItem(todayKey, String(Number.isFinite(amount) ? Math.max(0, amount) : 0));
  }
  // The old total had no date. Preserve it as today's intake once.
  await AsyncStorage.removeItem(LEGACY_KEY);
}

async function readAmount(key: string) {
  const amount = Number(await AsyncStorage.getItem(key));
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function storageKey(date: Date) {
  const day = getWaterDateKey(date);
  if (day > getWaterDateKey()) throw new Error("No se puede cargar agua en una fecha futura");
  return PREFIX + day;
}

export const getWaterIntake = (date = new Date()): Promise<number> => {
  const key = storageKey(date);
  return serialize(async () => {
    await migrateLegacy();
    return readAmount(key);
  });
};

export const saveWaterIntake = (amount: number, date = new Date()) => {
  const key = storageKey(date);
  return serialize(async () => {
    if (!Number.isFinite(amount)) throw new Error("Cantidad inválida");
    await migrateLegacy();
    await AsyncStorage.setItem(key, String(Math.max(0, amount)));
  });
};

export const addWater = (amount: number, date = new Date()) => {
  const key = storageKey(date);
  return serialize(async () => {
    if (!Number.isFinite(amount)) throw new Error("Cantidad inválida");
    await migrateLegacy();
    const total = Math.max(0, (await readAmount(key)) + amount);
    await AsyncStorage.setItem(key, String(total));
    return total;
  });
};

export const resetWater = (date = new Date()) => saveWaterIntake(0, date);

export interface WaterHistoryEntry {
  date: string;
  amount: number;
}

export const getWaterHistory = () => serialize(async () => {
  await migrateLegacy();
  const today = getWaterDateKey();
  const keys = (await AsyncStorage.getAllKeys()).filter(key => /^waterIntake:\d{4}-\d{2}-\d{2}$/.test(key) && key.slice(PREFIX.length) <= today);
  const values = keys.length ? await AsyncStorage.multiGet(keys) : [];
  const entries: WaterHistoryEntry[] = values.map(([key, value]) => {
    const amount = Number(value);
    return { date: key.slice(PREFIX.length), amount: Number.isFinite(amount) ? Math.max(0, amount) : 0 };
  }).sort((a, b) => a.date.localeCompare(b.date));
  const storedGoal = Number(await AsyncStorage.getItem("dailyGoal"));
  return { entries, goal: storedGoal > 0 && Number.isFinite(storedGoal) ? storedGoal : 2000 };
});
