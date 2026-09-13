const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

function setup(initial = []) {
  const data = new Map(initial);
  const storage = {
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
    getAllKeys: async () => [...data.keys()],
    multiGet: async (keys) => keys.map((key) => [key, data.get(key) ?? null]),
  };
  const modules = {};
  function load(name) {
    if (modules[name]) return modules[name];
    const code = ts.transpileModule(
      fs.readFileSync(
        path.join(__dirname, "../src/services", name + ".ts"),
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          esModuleInterop: true,
        },
      },
    ).outputText;
    const context = {
      exports: {},
      require: (source) =>
        source.includes("async-storage") ? storage : load("WaterService"),
    };
    vm.runInNewContext(code, context);
    return (modules[name] = context.exports);
  }
  return {
    data,
    water: load("WaterService"),
    progress: load("ProgressService"),
  };
}

test("week includes missing days; lifetime total includes dates outside the period", () => {
  const { progress } = setup();
  const result = progress.calculateWaterProgress(
    [
      { date: "2026-09-07", amount: 2000 },
      { date: "2026-09-09", amount: 3000 },
      { date: "2026-08-01", amount: 1000 },
    ],
    2000,
    "week",
    new Date(2026, 8, 13),
  );
  assert.equal(result.days, 7);
  assert.equal(result.completedDays, 2);
  assert.equal(result.average, 5000 / 7);
  assert.equal(result.total, 6000);
  assert.equal(result.points[1].amount, 0);
});

test("month counts only elapsed days, including today", () => {
  const { progress } = setup();
  const result = progress.calculateWaterProgress(
    [],
    2000,
    "month",
    new Date(2026, 8, 20),
  );
  assert.equal(result.days, 20);
  assert.equal(result.completedDays, 0);
  assert.equal(result.average, 0);
  assert.equal(result.points.length, 20);
});

test("year uses daily monthly averages and supports leap years", () => {
  const { progress } = setup();
  const result = progress.calculateWaterProgress(
    [{ date: "2024-02-29", amount: 2900 }],
    2000,
    "year",
    new Date(2024, 1, 29),
  );
  assert.equal(result.days, 366);
  assert.equal(result.points.length, 2);
  assert.equal(result.points[1].amount, 100);
  assert.equal(result.completedDays, 1);
  assert.equal(result.average, 2900 / 60);
});

test("annual completion uses 365 days while averages use elapsed days", () => {
  const { progress } = setup();
  const result = progress.calculateWaterProgress(
    [{ date: "2026-01-01", amount: 2000 }],
    2000,
    "year",
    new Date(2026, 0, 1),
  );
  assert.equal(result.days, 365);
  assert.equal(result.completedDays, 1);
  assert.equal(result.average, 2000);
});

test("single-day periods and weeks across year boundaries", () => {
  const { progress } = setup();
  assert.equal(
    progress.calculateWaterProgress([], 2000, "year", new Date(2026, 0, 1))
      .points.length,
    1,
  );
  const result = progress.calculateWaterProgress(
    [],
    2000,
    "week",
    new Date(2026, 0, 1),
  );
  assert.equal(result.start, "2025-12-29");
  assert.equal(result.days, 4);
});

test("cache history migrates once, ignores unrelated keys and handles concurrent writes", async () => {
  const { water, progress, data } = setup([
    ["waterIntake", "750"],
    ["dailyGoal", "2500"],
    ["userName", "Test"],
    ["waterIntake:2020-01-01", "1000"],
    ["waterIntake:2020-01-02", "bad"],
  ]);
  await Promise.all([water.addWater(250), water.addWater(500)]);
  const history = await water.getWaterHistory();
  assert.equal(history.goal, 2500);
  assert.equal(data.has("waterIntake"), false);
  assert.equal(await water.getWaterIntake(), 1500);
  const result = await progress.getWaterProgress("week");
  assert.equal(result.total, 2500);
  await water.addWater(-5000);
  assert.equal(await water.getWaterIntake(), 0);
});
